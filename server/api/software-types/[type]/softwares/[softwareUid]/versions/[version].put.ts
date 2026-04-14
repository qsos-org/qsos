import { provider } from "~/services/data-providers/current-provider";
import type { SoftwareVersion } from "~~/types/software";
import { requireOwnerOrAdmin } from "~~/server/utils/auth";
// PUT api/software-types/{typeUid}/softwares/{softwareUid}/version/{version} – Update an existing software version

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);
    if (!session?.user || !session?.loggedInAt) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized",
            message: "Authentication required to update a software version.",
        })
    }
    const type = getRouterParam(event, "type");
    const softwareUid = getRouterParam(event, "softwareUid");
    const initialVersion = getRouterParam(event, "version");
    const version = await readBody<SoftwareVersion>(event);

    if (!softwareUid)
        throw createError({
            statusCode: 404,
            statusMessage: "Software UID is required",
        });

    if (!type)
        throw createError({
            statusCode: 404,
            statusMessage: "Software type is required",
        });

    if (!initialVersion)
        throw createError({
            statusCode: 404,
            statusMessage: "Software version is required",
        });


    const current = await provider.getSoftwareVersion(type, softwareUid, initialVersion);
    if (!current) throw createError({ statusCode: 404, statusMessage: "Software version not found" });
    await requireOwnerOrAdmin(event, current.creatorEmail ?? null);

    await provider.deleteSoftwareVersion(type, softwareUid, initialVersion);
    return await provider.pushSoftwareVersion(type, softwareUid, version);
});
