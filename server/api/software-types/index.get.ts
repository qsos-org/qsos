import { provider } from "~/services/data-providers/current-provider";

// GET api/software-types - Get the list of software types available

export default defineEventHandler(async (event) => {
	return await provider.getSoftwareTypes();
});
