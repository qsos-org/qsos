import { defineEventHandler, readBody } from "h3";
import { provider } from "~/services/data-providers/current-provider";

// POST api/software-types/{softwareType}/grids – Create a new evaluation grid for an existing type of software

export default defineEventHandler(async (event) => {

	const session = await getUserSession(event);
	if(!session?.user || !session?.loggedInAt) {
		throw createError({
			statusCode: 401,
			statusMessage: "Unauthorized",
			message: "You must be logged in to create a new evaluation grid."
		})
	}
	const grid = await readBody(event);
	const newGrid = await provider.pushEvaluationGrid(grid);
	setResponseStatus(event, 201);
	return newGrid;
});
