import { provider } from "~/services/data-providers/current-provider";

// GET api/software-types/{typeUid}/softwares/{softwareUid}/versions – Get the list of versions for an existing software

export default defineEventHandler(async (event) => {
    const type = getRouterParam(event, "type");
    const softwareUid = getRouterParam(event, "softwareUid");

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

    const decodedType = decodeURIComponent(type);
    const decodedSoftwareUid = decodeURIComponent(softwareUid);
    return await provider.getSoftwareVersions(decodedType, decodedSoftwareUid);
});
