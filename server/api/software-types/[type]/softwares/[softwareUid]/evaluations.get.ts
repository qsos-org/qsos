import { provider } from "~/services/data-providers/current-provider";

// GET api/software-types/{typeUid}/softwares/{softwareUid}/evaluations – Get all evaluations for an existing software
export default defineEventHandler(async (event) => {
    const type = decodeURIComponent(getRouterParam(event, "type") || "");
    const softwareUid = decodeURIComponent(getRouterParam(event, "softwareUid") || "");
    const query = getQuery(event);
    const gridVersion = query.gridVersion?.toString()
    const softwareVersion = query.softwareVersion?.toString()

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

    return await provider.getEvaluations(type, softwareUid, softwareVersion, gridVersion);
}); 
