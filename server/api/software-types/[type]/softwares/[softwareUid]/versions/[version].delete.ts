import { provider } from "~/services/data-providers/current-provider";
import { requireOwnerOrAdmin } from "~~/server/utils/auth";
// DELETE api/software-types/{typeUid}/softwares/{softwareUid}/versions/{version} – Delete an existing software version

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);
    if (!session?.user || !session?.loggedInAt) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized",
            message: "Authentication required to delete a software version.",
        })
    }
    const type = getRouterParam(event, "type");
    const softwareUid = getRouterParam(event, "softwareUid");
    const version = getRouterParam(event, "version")?.toString();

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

    if (!version)
        throw createError({
            statusCode: 404,
            statusMessage: "Software version is required",
        });


    const current = await provider.getSoftwareVersion(type, softwareUid, version);
    if (!current) throw createError({ statusCode: 404, statusMessage: "Software version not found" });
    await requireOwnerOrAdmin(event, current.creatorEmail ?? null);

    return await provider.deleteSoftwareVersion(type, softwareUid, version);
});
