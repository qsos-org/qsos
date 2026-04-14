import { provider } from "~/services/data-providers/current-provider";
import { requireOwnerOrAdmin } from "~~/server/utils/auth";
// PUT api/software-types/{softwareType}/grids/{gridVersion} – Update an existing evaluation grid

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);
    if (!session?.user || !session?.loggedInAt) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized",
            message: "You must be logged in to update an evaluation grid."
        })
    }
    const gridVersion = getRouterParam(event, "gridVersion");
    const type = getRouterParam(event, "type");
    const body = await readBody(event);

    if (!type) throw createError({
        statusCode: 404,
        statusMessage: "Software type not found",
    })
    if (!gridVersion) throw createError({
        statusCode: 404,
        statusMessage: "Grid version not found",
    })

    const current = await provider.getEvaluationGrid(type, gridVersion);
    if (!current) throw createError({ statusCode: 404, statusMessage: "Evaluation grid not found" });
    await requireOwnerOrAdmin(event, current.creatorEmail ?? null);

    if (!gridVersion)
        throw createError({
            statusCode: 404,
            statusMessage: "Grid version is required",
        });

    if (!type)
        throw createError({
            statusCode: 404,
            statusMessage: "Software type is required",
        })

    if (body.type !== type) {
        // type has changed, so the old file needs to be removed
        await provider.deleteEvaluationGrid(type, gridVersion);
    }
    const updatedSoftware = await provider.pushEvaluationGrid({ uid: gridVersion, ...body });
    return updatedSoftware;
});
