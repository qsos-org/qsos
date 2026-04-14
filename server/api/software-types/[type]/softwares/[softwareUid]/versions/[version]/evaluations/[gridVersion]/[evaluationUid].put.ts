import { provider } from "~/services/data-providers/current-provider";
import type { Evaluation } from "~~/types/evaluation";
import { requireOwnerOrAdmin } from "~~/server/utils/auth";

// PUT api/software-types/{typeUid}/softwares/{softwareUid}/versions/{version}/evaluations/{evaluationUid} – Update an existing software evaluation

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);
    if (!session?.user || !session?.loggedInAt) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized",
            message: "Authentication required to update a software evaluation.",
        })
    }
    const type = decodeURIComponent(getRouterParam(event, "type") || "");
    const softwareUid = decodeURIComponent(getRouterParam(event, "softwareUid") || "");
    const version = decodeURIComponent(getRouterParam(event, "version") || "");
    const gridVersion = decodeURIComponent(getRouterParam(event, "gridVersion") || "");
    const evaluationUid = decodeURIComponent(getRouterParam(event, "evaluationUid") || "");
    const evaluation = await readBody<Evaluation>(event);

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

    if (!gridVersion)
        throw createError({
            statusCode: 404,
            statusMessage: "Grid version is required",
        });

    if (!evaluationUid)
        throw createError({
            statusCode: 404,
            statusMessage: "Evaluation UID is required",
        });

    const current = await provider.getEvaluation(type, softwareUid, version, gridVersion, evaluationUid);
    if (!current) throw createError({ statusCode: 404, statusMessage: "Evaluation not found" });
    await requireOwnerOrAdmin(event, current.authors?.find(a => a?.email)?.email ?? (current as any).creatorEmail ?? (current as any).author?.email ?? null);

    await provider.deleteEvaluation(type, softwareUid, version, gridVersion, evaluationUid);
    return await provider.pushEvaluation(evaluation);
});