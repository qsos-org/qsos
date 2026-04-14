import { defineEventHandler } from "h3";
import { provider } from "~/services/data-providers/current-provider";

// GET api/software-types/{softwareType}/grids – Get the list of evaluation grids of an existing type

export default defineEventHandler(async (event) => {
	const type = getRouterParam(event, "type");
	if(!type) {
		throw createError({
			statusCode: 404,
			statusMessage: "Software type is required",
		});
	}
	const decodedType = decodeURIComponent(type);
	return await provider.getEvaluationGridsByType(decodedType)
});
