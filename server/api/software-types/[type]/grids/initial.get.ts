import { QSOS_VERSIONS } from "~/services/qsos-versions/qsos-versions";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const qsosVersion = query.version as string || '2.0';

    if (!QSOS_VERSIONS[qsosVersion]) {
        throw createError({
            statusCode: 400,
            statusMessage: `Unsupported QSOS version: ${qsosVersion}`
        });
    }
    return {
        qsosVersion,
        maturitySection: QSOS_VERSIONS[qsosVersion].maturitySection
    }
});