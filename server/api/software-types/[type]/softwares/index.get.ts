import { defineEventHandler } from "h3";
import { provider } from "~/services/data-providers/current-provider";

// GET api/software-types/{softwareType}/softwares – Get the list of softwares of an existing type

export default defineEventHandler(async (event) => {
	const type = getRouterParam(event, "type");
	if(!type) {
		throw createError({
			statusCode: 404,
			statusMessage: "Software type is required",
		});
	}
	const decodedType = decodeURIComponent(type);
	return await provider.getSoftwaresByType(decodedType)
});
