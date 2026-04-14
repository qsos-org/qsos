import { defineEventHandler } from "h3";
import { provider } from "~/services/data-providers/current-provider";
import { requireOwnerOrAdmin } from "~~/server/utils/auth";

// PUT api/software-types/{softwareType} - Update an existing type of software data

export default defineEventHandler(async (event) => {
	const session = await getUserSession(event);
	if (!session?.user || !session?.loggedInAt) {
		throw createError({
			statusCode: 401,
			statusMessage: "Unauthorized",
			message: "Authentication required to update a software type.",
		})
	}
	const typeUid = getRouterParam(event, "type");
	const type = await readBody(event);
	if (!typeUid) {
		throw createError({
			statusCode: 404,
			statusMessage: "Software type is required",
		});
	}

	//await requireAdmin(event);
	const decodedType = decodeURIComponent(typeUid);
	const current = await provider.getSoftwareType(decodedType);
	if (!current) throw createError({ statusCode: 404, statusMessage: "Software type not found" });
	await requireOwnerOrAdmin(event, current.creatorEmail ?? null);
	return await provider.pushSoftwareType(type, decodedType);

});
