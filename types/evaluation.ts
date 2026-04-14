import type { LanguageCode } from "./language";
import type { Software, SoftwareType, SoftwareVersion } from "./software";
import type { Author } from "./user";

export type EvaluationCriteria = {
	ref: string;
	name: string;
	description: string;
	desc0: string;
	desc1: string;
	desc2: string;
};

export type EvaluationCriteriaRated = {
	ref: string;
	score: number;
	comment: string;
	sources: string // list of sources used for the evaluation
};

export type EvaluationCriteriaWeighted = {
	ref: string;
	weight: number;
};

export type EvaluationSection = {
	ref: string;
	name: string;
	description: string;
	sections: (EvaluationSection | EvaluationCriteria)[];
};

export type MaturitySection = EvaluationSection & {
	name: "Maturity"
}

export type EvaluationSectionRated = {
	ref: string;
	sections: (EvaluationSectionRated | EvaluationCriteriaRated)[];
};

export type EvaluationSectionWeighted = {
	ref: string;
	sections: (EvaluationSectionWeighted | EvaluationCriteriaWeighted)[];
};

export type EvaluationGridFileData = {
	gridVersion: string;
	qsosVersion: string;
	createdAt: string;
	creatorEmail: string;
	updatedAt: string;
	sections: EvaluationSection[];
	changeLog: string;
}

export type EvaluationGrid = EvaluationGridFileData & {
	softwareType: SoftwareType;
};

export type EvaluationFileData = {
	evaluationUid: string;
	authors: Author[];
	language: LanguageCode;
	createdAt: string;
	updatedAt: string;
	sections: EvaluationSectionRated[];
}

export type Evaluation = EvaluationFileData & {
	software: Software;
	softwareVersion: SoftwareVersion
	readonly grid: EvaluationGrid
};

export type EvaluationDraft = Partial<Evaluation>;

export type EvaluationListItem = EvaluationFileData & { gridVersion: string; softwareVersion: string; };

export const isCriteria = (section: EvaluationSection | EvaluationCriteria): section is EvaluationCriteria => {
	return !("sections" in section)
}

export const isSubsection = (section: EvaluationSection | EvaluationCriteria): section is EvaluationSection => {
	return "sections" in section
}