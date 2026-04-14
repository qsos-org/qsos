import type { EvaluationCriteriaWeighted} from "./evaluation";

export type RequirementPreset = {
    presetUid: string;
    label: string; 
    userUid: string;
    gridVersion: string;
    softwareTypeUid: string;
    criteriaWeights: EvaluationCriteriaWeighted[];
    createdAt: string;
    updatedAt: string;
    description?: string;
};