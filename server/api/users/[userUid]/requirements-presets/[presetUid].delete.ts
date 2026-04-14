import { provider } from "~/services/data-providers/current-provider";

// DELETE api/users/{usersUid}/requirements-presets/{presetUid} - Delete a requirement preset

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);
	if(!session?.user || !session?.loggedInAt) {
		throw createError({
			statusCode: 401,
			statusMessage: "Unauthorized",
			message: "Authentication required to delete a requirement preset.",
		})
	}
    const userUid = getRouterParam(event, "userUid");
    const presetUid = getRouterParam(event, "presetUid");
    if(!userUid){
        throw createError({
            statusCode: 404, 
            statusMessage: "User UID is required", 
        });
    }
    if(!presetUid){
        throw createError({
            statusCode: 404,
            statusMessage: "Preset UID is required",
        });
    }

    return await provider.deleteRequirementPreset(userUid, presetUid);

});
