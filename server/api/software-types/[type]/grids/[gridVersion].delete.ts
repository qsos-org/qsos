import { provider } from "~/services/data-providers/current-provider";
import { requireOwnerOrAdmin } from "~~/server/utils/auth";

// DELETE api/software-types/{softwareType}/grids/{gridVersion} – Delete an existing evaluation grid

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);
    if (!session?.user || !session?.loggedInAt) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized",
            message: "You must be logged in to delete an evaluation grid."
        })
    }
    const gridVersion = getRouterParam(event, "gridVersion");
    const type = getRouterParam(event, "type");

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

    await provider.deleteEvaluationGrid(type, gridVersion);
});
