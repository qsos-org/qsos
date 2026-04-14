import { provider } from "~/services/data-providers/current-provider";
import type { LicenseInfo, LicenseExceptionInfo } from "../../types/license"
import log from "loglevel"
import path from "node:path";

const LICENSES_URL = 'https://raw.githubusercontent.com/spdx/license-list-data/master/json/licenses.json'
const EXCEPTIONS_URL = 'https://raw.githubusercontent.com/spdx/license-list-data/master/json/exceptions.json'

const OUTPUT_DIR = provider.getDataPath("license-list-data");

async function downloadJson<License>(url: string): Promise<License> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
  }
  return response.json() as Promise<License>
}

export async function generateLicensesFile(): Promise<void> {
  try {
    if (!await provider.fs.folderExists(OUTPUT_DIR)) {
      log.info(`Creating data folder at ${OUTPUT_DIR}`);
      await provider.fs.makeFolder(OUTPUT_DIR).catch((err) => {
        log.error(`Couldn't create data folder at ${OUTPUT_DIR}`, err)
      })
    }

    log.info("Downloading JSON files...")
    const [licensesResponse, exceptionsResponse] = await Promise.all([
      downloadJson<{ licenses: LicenseInfo[] }>(LICENSES_URL),
      downloadJson<{ exceptions: LicenseExceptionInfo[] }>(EXCEPTIONS_URL),
    ])

    log.info("Writing license files locally...")
    await provider.fs.writeFile(path.join(OUTPUT_DIR, "licenses.json"), JSON.stringify(licensesResponse, null, 2))
    await provider.fs.writeFile(path.join(OUTPUT_DIR, "exceptions.json"), JSON.stringify(exceptionsResponse, null, 2))
    log.info(`Files successfully generated in: ${OUTPUT_DIR}`)
  } catch (error) {
    log.error("Error while generating licenses:", error)
  }
}

generateLicensesFile()