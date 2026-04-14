import { provider } from "~/services/data-providers/current-provider";

// GET api/software-types/{typeUid}/softwares/{softwareUid} – Get an existing software data

export default defineEventHandler(async (event) => {
	const type = decodeURIComponent(getRouterParam(event, "type") || "");
	const softwareUid = decodeURIComponent(getRouterParam(event, "softwareUid") || "");

	if (!softwareUid)
		throw createError({
			statusCode: 404,
			statusMessage: "Software UID is required",
		});

	if (!type)
		throw createError({
			statusCode: 404,
			statusMessage: "Software type is required",
		});

	return await provider.getSoftware(type, softwareUid);
});
