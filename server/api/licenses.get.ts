import type { LicenseInfo, LicenseExceptionInfo } from "~~/types/license";
import { createError } from "h3";
import path from "path";
import log from "loglevel";
import { provider } from "~/services/data-providers/current-provider";

const LICENSE_LIST_PATH = provider.getDataPath("license-list-data");
provider.fs.folderExists(LICENSE_LIST_PATH).then(exists => {
    if (exists) return;
    provider.fs.makeFolder(LICENSE_LIST_PATH).catch((err) => {
        console.error(`Couldn't create data folder at ${LICENSE_LIST_PATH}`, err)
    })
})

// GET api/licenses - Get the list of licenses and license exceptions available
export default defineEventHandler(async (event) => {
    let licensesResponse, exceptionsResponse;
    try {
        log.info("Fetching data from the GitHub API...");
        [licensesResponse, exceptionsResponse] = await Promise.all([
            fetch(
                "https://raw.githubusercontent.com/spdx/license-list-data/refs/heads/main/json/licenses.json"
            ).then((r) => r.json() as Promise<{ licenses: LicenseInfo[] }>),
            fetch(
                "https://raw.githubusercontent.com/spdx/license-list-data/refs/heads/main/json/exceptions.json"
            ).then((r) => r.json() as Promise<{ exceptions: LicenseExceptionInfo[] }>)
        ])
    } catch (fetchError) {
        try {
            log.warn("Failed to fetch licenses data from Github, fallback on local file.");
            log.trace(fetchError);
            ;[licensesResponse, exceptionsResponse] = await Promise.all([
                provider.fs.readJSON<{ licenses: LicenseInfo[] }>(path.join(LICENSE_LIST_PATH, "licenses.json")),
                provider.fs.readJSON<{ exceptions: LicenseExceptionInfo[] }>(path.join(LICENSE_LIST_PATH, "exceptions.json"))
            ])
        } catch (localError) {
            log.error("Failed to load licenses data from local file.");
            log.trace(localError)
        }
    }

    const licenses = licensesResponse?.licenses
    const exceptions = exceptionsResponse?.exceptions

    if (!licenses || !exceptions) {
        log.error("Failed to load licenses data. Try running `npm run update-licenses` to download the latest data.");
        throw createError({
            statusCode: 500,
            message: "Unable to load license data.",
        });
    }

    log.info(`Licenses index: ${licenses.length} licenses, ${exceptions.length} exceptions`);
    return {
        licenses,
        exceptions
    };
});