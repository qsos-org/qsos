import { provider } from "~/services/data-providers/current-provider";

// Get api/users/{userUid}/requirements-presets/{presetUid} - Get a specific requirment preset

export default defineEventHandler(async (event) => {
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

    return await provider.getRequirementPreset(userUid, presetUid);
    
});
