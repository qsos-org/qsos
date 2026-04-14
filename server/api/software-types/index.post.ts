import { defineEventHandler, readBody } from "h3";
import { provider } from "~/services/data-providers/current-provider";

// POST api/software-types – Add a new type of software

export default defineEventHandler(async (event) => {
	const session = await getUserSession(event);
	if(!session?.user || !session?.loggedInAt) {
		throw createError({
			statusCode: 401,
			statusMessage: "Unauthorized",
			message: "Authentication required to create a software type.",
		})
	}
	
	const type = await readBody(event);
	const loggerEmail = session.user?.email;
	if(loggerEmail){
		type.creatorEmail = loggerEmail;
	}
	const newType = await provider.pushSoftwareType(type);
	setResponseStatus(event, 201);
	return newType;
});
