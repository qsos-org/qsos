import { provider } from "~/services/data-providers/current-provider";

// POST api/software-types/{type}/softwares/{softwareUid}/versions – Create a new version for an existing software

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);
	if(!session?.user || !session?.loggedInAt) {
		throw createError({
			statusCode: 401,
			statusMessage: "Unauthorized",
			message: "Authentication required to create a software version.",
		})
	}
    const type = getRouterParam(event, "type")!;
    const uid = getRouterParam(event, "softwareUid")!;
    const decodedType = decodeURIComponent(type);
    const decodedUid = decodeURIComponent(uid);
    const version = await readBody(event);
    version.dateAdded = new Date().toISOString();

    if (await provider.existsSoftwareVersion(decodedType, decodedUid, version.version)) {
        throw createError({
            statusCode: 409,
            statusMessage: "Software version already exists",
        });
    }
    const loggerEmail = session.user?.email;
	if(loggerEmail){
		version.creatorEmail = loggerEmail;
	}
    const newSoftware = await provider.pushSoftwareVersion(decodedType, decodedUid, version);
    setResponseStatus(event, 201);
    return newSoftware;
});
