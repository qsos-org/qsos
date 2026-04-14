import { nanoid } from "nanoid";
import {provider} from "~/services/data-providers/current-provider";

// POST api/software-types/{typeUid}/softwares/{softwareUid}/evaluations – Create a new evaluation for an existing software
export default defineEventHandler(async (event) => {
	const session = await getUserSession(event);
	if(!session?.user || !session?.loggedInAt) {
		throw createError({
			statusCode: 401,
			statusMessage: "Unauthorized",
			message:"Authentication required to create a software evaluation.",
		})
	}
	const evaluation = await readBody(event);
	evaluation.evaluationUid = nanoid();
	const newEvaluation = await provider.pushEvaluation(evaluation);
	setResponseStatus(event, 201);
	return newEvaluation;
}); 
