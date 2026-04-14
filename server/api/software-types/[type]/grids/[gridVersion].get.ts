import { provider } from "~/services/data-providers/current-provider";

// GET api/software-types/{typeUid}/grids/{gridVersion} – Get an existing evaluation grid data

export default defineEventHandler(async (event) => {
    const type = getRouterParam(event, "type");
    const gridVersion = getRouterParam(event, "gridVersion");

    if (!gridVersion)
        throw createError({
            statusCode: 404,
            statusMessage: "Grid version is required",
        });

    if (!type)
        throw createError({
            statusCode: 404,
            statusMessage: "Software type is required",
        });

    const decodedType = decodeURIComponent(type);
    const decodedGridVersion = decodeURIComponent(gridVersion);
    return await provider.getEvaluationGrid(decodedType, decodedGridVersion);
});
