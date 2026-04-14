import { defineEventHandler } from "h3";
import { provider } from "~/services/data-providers/current-provider";

// GET api/software-types/{softwareType} - Get an existing type of software data

export default defineEventHandler(async (event) => {
	const typeUid = getRouterParam(event, "type");
	if (!typeUid) {
		throw createError({
			statusCode: 404,
			statusMessage: "Software type is required",
		});
	}
	const decodedType = decodeURIComponent(typeUid);
	return await provider.getSoftwareType(decodedType);
});
