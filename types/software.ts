export type SoftwareType = {
	uid: string;
	name: string; // label
	description: string; // short description of the type of software
	icon?: string; // icon url
	creatorEmail?: string;
	createdAt?: string;
	updatedAt?: string;
};

export type SoftwareFileData = {
	uid: string;
	name: string; // Application/software name
	description: string; // short description of the software
	licenseId: string; // Identifier of the main license, taken from https://spdx.org/licenses/
	url: string; // URL of the software website
	demoUrl?: string; // URL of the demo website
	icon?: string; // icon url
	creatorEmail?: string;
	createdAt?: string;
	updatedAt?: string;
}

export type Software = SoftwareFileData & {
	type: SoftwareType;
	versions: SoftwareVersion[];
};

export type SoftwareVersion = {
	version: string;
	dateAdded: string;
	summary: string;
	creatorEmail?: string;
	createdAt?: string;
	updatedAt?: string;
};
