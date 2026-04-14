// @vitest-environment nuxt
import { expect, test } from "vitest";

import {
	mockEvaluation,
	mockEvaluationGrid,
	mockSoftware,
	mockSoftwareType,
	mockSoftwareVersion,
} from "../mock";

import { FileBasedProvider } from "../../app/services/data-providers/file-based-provider";
import { compareSemver } from "../../utils/semver";
const provider = new FileBasedProvider("bun", "test-data");

test("write and read software types", async () => {
	const type = mockSoftwareType();
	await provider.pushSoftwareType(type);
	const typeRead = await provider.getSoftwareType(type.uid);
	expect(typeRead).toMatchObject(type);
});

test("write and read software", async () => {
	const software = mockSoftware();
	await provider.pushSoftwareType(software.type);
	await provider.pushSoftware(software);
	const softwareRead = await provider.getSoftware(software.type.uid, software.uid);

	expect(softwareRead.createdAt).toBeDefined();
	expect(softwareRead.updatedAt).toBeDefined();
	// expect createdAt to be current date
	expect(new Date(softwareRead.createdAt!).getTime()).toBeGreaterThan(new Date().getTime() - 10000);
	// expect updatedAt to be current date
	expect(new Date(softwareRead.updatedAt!).getTime()).toBeGreaterThan(new Date().getTime() - 10000);
	// update the software createdAt and updatedAt to match the updated dynamic values
	software.createdAt = softwareRead.createdAt;
	software.updatedAt = softwareRead.updatedAt;

	expect(softwareRead.type.createdAt).toBeDefined();
	expect(softwareRead.type.updatedAt).toBeDefined();
	// expect createdAt to be current date
	expect(new Date(softwareRead.type.createdAt!).getTime()).toBeGreaterThan(new Date().getTime() - 10000);
	// expect updatedAt to be current date
	expect(new Date(softwareRead.type.updatedAt!).getTime()).toBeGreaterThan(new Date().getTime() - 10000);
	expect(new Date(softwareRead.updatedAt!).getTime()).toBeGreaterThan(new Date().getTime() - 10000);
	// update the software createdAt and updatedAt to match the updated dynamic values
	software.type.createdAt = softwareRead.type.createdAt;
	software.type.updatedAt = softwareRead.type.updatedAt;
	// update the versions createdAt and updatedAt to match the updated dynamic values
	software.versions = software.versions.sort((a, b) => compareSemver(b.version, a.version));
	software.versions = software.versions.map((version, index) => ({
		...version,
		createdAt: softwareRead.versions[index].createdAt,
		updatedAt: softwareRead.versions[index].updatedAt
	}));

	expect(softwareRead).toMatchObject(software);
});

test("write and read software versions", async () => {
	const software = mockSoftware();
	const softwareVersion = mockSoftwareVersion();
	await provider.pushSoftwareType(software.type);
	await provider.pushSoftware(software);
	await provider.pushSoftwareVersion(software.type.uid, software.uid, softwareVersion);
	const softwareVersionRead = await provider.getSoftwareVersion(
		software.type.uid,
		software.uid,
		softwareVersion.version,
	);
	expect(softwareVersionRead).toMatchObject(softwareVersion);
});

test("write and read software evaluation grids", async () => {
	const grid = mockEvaluationGrid();
	await provider.pushSoftwareType(grid.softwareType);
	await provider.pushEvaluationGrid(grid);
	const gridRead = await provider.getEvaluationGrid(grid.softwareType.uid, grid.gridVersion);
	expect(new Date(gridRead.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(grid.updatedAt).getTime());
	grid.updatedAt = gridRead.updatedAt; // update the updatedAt to match the read value for comparison
	expect(gridRead).toMatchObject(grid);
});

test("write and read software evaluation", async () => {
	const evaluation = mockEvaluation();
	await provider.pushSoftwareType(evaluation.software.type);
	await provider.pushSoftware(evaluation.software);
	await provider.pushEvaluationGrid(evaluation.grid);
	await provider.pushEvaluation(evaluation);

	const evaluationRead = await provider.getEvaluation(
		evaluation.software.type.uid,
		evaluation.software.uid,
		evaluation.softwareVersion.version,
		evaluation.grid.gridVersion,
		evaluation.evaluationUid,
	);

	// ignore dynamic fields
	evaluation.grid.updatedAt = evaluationRead.grid.updatedAt;
	evaluation.updatedAt = evaluationRead.updatedAt;

	expect(evaluationRead).toMatchObject(evaluation);
});
