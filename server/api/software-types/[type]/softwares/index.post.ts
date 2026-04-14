import { defineEventHandler, readBody } from "h3";
import { provider } from "~/services/data-providers/current-provider";

// POST api/software-types/{softwareType}/softwares – Create a new software of an existing type

export default defineEventHandler(async (event) => {
	const session = await getUserSession(event);
	if(!session?.user || !session?.loggedInAt) {
		throw createError({
			statusCode: 401,
			statusMessage: "Unauthorized",
			message: "Authentication required to create a software.",
		})
	}
	const software = await readBody(event);
	const loggerEmail = session.user?.email;
	if(loggerEmail){
		software.creatorEmail = loggerEmail;
	}
	const newSoftware = await provider.pushSoftware(software);
	setResponseStatus(event, 201);
	return newSoftware;
});
