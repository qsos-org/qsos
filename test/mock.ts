import { faker } from "@faker-js/faker";
import { pickRandomIn } from "../app/services/utils";
import type {
	Evaluation,
	EvaluationCriteria,
	EvaluationSection,
	EvaluationGrid,
	EvaluationCriteriaRated,
	EvaluationSectionRated,
} from "../types/evaluation";
import type { Software, SoftwareType, SoftwareVersion } from "../types/software";
import type { Author } from "../types/user";

export function mockSoftwareType(): SoftwareType {
	return {
		uid: faker.commerce.department(),
		name: faker.commerce.department(),
		description: faker.lorem.sentence(),
		creatorEmail: faker.internet.email()
	};
}

export function mockSoftware(existingData: Partial<Software> = {}): Software {
	return {
		uid: faker.commerce.productName(),
		type: mockSoftwareType(),
		name: faker.commerce.productName(),
		description: faker.lorem.sentence(),
		licenseId: pickRandomIn(["MIT", "Apache-1.0", "GPL-3.0"]),
		url: faker.internet.url(),
		versions: Array.from(
			{ length: faker.number.int({ min: 3, max: 5 }) },
			mockSoftwareVersion,
		),
		creatorEmail: faker.internet.email(),
		...existingData
	};
}

export function mockSoftwareVersion(existingData: Partial<SoftwareVersion> = {}): SoftwareVersion {
	return {
		version: faker.system.semver(),
		dateAdded: faker.date.recent().toISOString(),
		summary: faker.lorem.sentence(),
		creatorEmail: faker.internet.email(),
		...existingData
	};
}

export function mockEvaluationGrid(existingData: Partial<EvaluationGrid> = {}): EvaluationGrid {
	return {
		softwareType: mockSoftwareType(),
		gridVersion: faker.system.semver(),
		qsosVersion: faker.system.semver(),
		createdAt: faker.date.recent().toISOString(),
		creatorEmail: faker.system.semver(),
		updatedAt: faker.date.recent().toISOString(),
		changeLog: faker.system.semver(),
		sections: Array.from(
			{ length: faker.number.int({ min: 3, max: 5 }) },
			mockEvaluationSection,
		),
		...existingData
	};
}

export function mockEvaluationSection(existingData: Partial<EvaluationSection> = {}): EvaluationSection {
	return {
		name: faker.lorem.words(),
		description: faker.lorem.sentence(),
		sections: Array.from(
			{ length: faker.number.int({ min: 3, max: 5 }) },
			mockEvaluationCriteria,
		),
		...existingData
	};
}

export function mockEvaluationCriteria(): EvaluationCriteria {
	return {
		ref: faker.lorem.slug(),
		name: faker.lorem.words(),
		description: faker.lorem.sentence(),
		desc0: faker.lorem.sentence(),
		desc1: faker.lorem.sentence(),
		desc2: faker.lorem.sentence(),
	};
}

export function mockEvaluationSectionRated(): EvaluationSectionRated {
	return {
		ref: faker.lorem.slug(),
		sections: Array.from(
			{ length: faker.number.int({ min: 3, max: 5 }) },
			mockEvaluationCriteriaRated
		),
	};
}

export function mockEvaluationCriteriaRated(): EvaluationCriteriaRated {
	return {
		ref: faker.lorem.slug(),
		score: faker.number.int({ min: 0, max: 100 }),
		comment: faker.lorem.sentence(),
		sources: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => faker.internet.url()).join(", "),
	};
}

export function mockEvaluation(): Evaluation {
	const softwareType = mockSoftwareType();
	const softwareVersion = mockSoftwareVersion();
	return {
		grid: mockEvaluationGrid({ softwareType }),
		software: mockSoftware({ type: softwareType, versions: [softwareVersion] }),
		softwareVersion,
		evaluationUid: faker.string.uuid(),
		authors: Array.from(
			{ length: faker.number.int({ min: 1, max: 3 }) },
			mockAuthor,
		),
		sections: Array.from(
			{ length: faker.number.int({ min: 3, max: 5 }) },
			mockEvaluationSectionRated,
		),
		createdAt: faker.date.recent().toISOString(),
		updatedAt: faker.date.recent().toISOString(),
		language: "en-us",
	};
}

export function mockAuthor(): Author {
	return {
		uid: faker.string.uuid(),
		name: faker.person.fullName(),
		email: faker.internet.email(),
	};
}
