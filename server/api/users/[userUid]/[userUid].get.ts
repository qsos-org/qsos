import { provider } from "~/services/data-providers/current-provider";

// GET api/users/{userUid} - Get user by UID

export default defineEventHandler(async (event) => {
    const userUid = getRouterParam(event, "userUid");

    if (!userUid) {
        throw createError({
            statusCode: 404,
            statusMessage: "User UID is required",
        });
    }
    try {
        return await provider.getUser(userUid);
    } catch (error) {

        throw createError({
            statusCode: 404,
            statusMessage: `User with UID ${userUid} not found`,
        });
    }

});
