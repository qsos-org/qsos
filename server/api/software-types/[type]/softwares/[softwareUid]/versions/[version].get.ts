import { provider } from "~/services/data-providers/current-provider";

// GET api/software-types/{typeUid}/softwares/{softwareUid}/version/{version} – Get an existing software version data

export default defineEventHandler(async (event) => {
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

    const decodedType = decodeURIComponent(type);
    const decodedSoftwareUid = decodeURIComponent(softwareUid);
    const decodedVersion = decodeURIComponent(version);

    return await provider.getSoftwareVersion(decodedType, decodedSoftwareUid, decodedVersion) ?? createError({
        statusCode: 404,
        statusMessage: "Software version not found",
    });
});
