import type { EvaluationGrid, Evaluation } from "../../../types/evaluation";
import type { SoftwareType, Software, SoftwareVersion } from "../../../types/software";
import type { RequirementPreset } from "../../../types/requirements";
import type { User } from "../../../types/user";

export interface DataProvider {
	getSoftwareTypes(): Promise<SoftwareType[]>;
	getSoftwareType(uid: string): Promise<SoftwareType>;
	getSoftwaresByType(type: string): Promise<Software[]>;
	getSoftware(type: string, uid: string): Promise<Software>;
	getSoftwareVersions(type: string, uid: string): Promise<SoftwareVersion[]>;
	getSoftwareVersion(
		type: string,
		softwareUid: string,
		version: string,
	): Promise<SoftwareVersion | null>;
	getEvaluationGridsByType(type: string): Promise<EvaluationGrid[]>;
	getEvaluationGrid(type: string, gridVersion: string): Promise<EvaluationGrid>;
	getEvaluation(
		type: string,
		softwareUid: string,
		version: string,
		gridVersion: string,
		evaluationUid: string,
	): Promise<Evaluation>;
	getRequirementPresets(userUid: string, softwareTypeUid: string, gridVersion?: string): Promise<RequirementPreset[]>;
	getRequirementPreset(userUid: string, presetUid: string): Promise<RequirementPreset>;
	getUser(userUid: string): Promise<User>;
	pushSoftwareType(type: SoftwareType, previousUid?: string): Promise<SoftwareType>; // insert or update an existing type of software
	pushSoftware(software: Software, previousType?: string, previousUid?: string): Promise<Software>;
	pushSoftwareVersion(type: string, uid: string, softwareVersion: SoftwareVersion): Promise<SoftwareVersion>;
	pushEvaluationGrid(grid: EvaluationGrid): Promise<EvaluationGrid>;
	pushEvaluation(evaluation: Evaluation): Promise<Evaluation>;
	pushRequirementPreset(preset: RequirementPreset): Promise<RequirementPreset>;
	deleteSoftware(type: string, uid: string): Promise<void>;
	deleteSoftwareVersion(
		type: string,
		uid: string,
		version: string,
	): Promise<void>;
	deleteEvaluationGrid(type: string, gridVersion: string): Promise<void>;
	deleteEvaluation(
		type: string,
		softwareUid: string,
		version: string,
		gridVersion: string,
		evaluationUid: string,
	): Promise<void>;
	deleteRequirementPreset(userUid: string, presetUid: string): Promise<void>;
}
