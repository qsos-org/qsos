import { provider } from '~/services/data-providers/current-provider'
import type { RequirementPreset } from '~~/types/requirements'
// PUT api/users/{userUid}/requirements-presets/{presetUid}
export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)

    if (!session?.user || !session?.loggedInAt) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'Authentication required to update a requirement preset.',
        })
    }

    const userUid = getRouterParam(event, 'userUid')
    const presetUid = getRouterParam(event, 'presetUid')

    if (!userUid) {
        throw createError({
            statusCode: 404,
            statusMessage: 'User Uid is required',
        })
    }

    if (!presetUid) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Preset Uid is required',
        })
    }

    const existingPreset = await provider.getRequirementPreset(userUid, presetUid)

    if (!existingPreset) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Requirement preset not found',
        })
    }
    const body = await readBody<Partial<RequirementPreset>>(event)

    const updatedPreset: RequirementPreset = {
        ...existingPreset,
        ...body,
        userUid,
        presetUid,
        updatedAt: new Date().toISOString(), // on met à jour la date de modif ici
    }

    const saved = await provider.pushRequirementPreset(updatedPreset)

    return saved
})