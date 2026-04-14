import type { EvaluationCriteria, EvaluationCriteriaRated, EvaluationSection, EvaluationListItem } from '~~/types/evaluation';
import { isCriteria } from '~~/types/evaluation';
import type { Path } from '~/utils/path';
import { getValueAtPath } from '~/utils/path';

/**
 * Safely converts a value to a weight number with a fallback
 */
export function asWeight(v: any, fallback = 100): number {
    const n = Number(v);
    return isNaN(n) ? fallback : n;
}

/**
 * Calculates the simple average of scores at a given path in evaluations
 */
export function calcAverage(evaluations: EvaluationListItem[], p: Path): number | null {
    const scores = evaluations
        .map(e => getValueAtPath(e, p))
        .map((c: any) => (c as EvaluationCriteriaRated)?.score)
        .filter(score => score !== undefined) as number[];
    if (!scores.length) return null;
    return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

/**
 * Recursively calculates weighted average for a section
 * @param evaluations - Array of evaluations
 * @param section - The section to calculate the weighted average for
 * @param path - Current path in the evaluation structure
 * @param weights - Weights object (typically a ref.value or plain object)
 * @returns Weighted average score or null if no valid scores
 */
export function calcWeightedAverageForSection(
    evaluations: EvaluationListItem[],
    section: EvaluationSection,
    path: Path,
    weights: any
): number | null {
    if (!Array.isArray(section.sections) || section.sections.length === 0) {
        return null;
    }
    let totalWeight = 0;
    let weightedSum = 0;
    section.sections.forEach((child, index) => {
        const childPath: Path = [...path, 'sections', String(index)];
        const childWeight = asWeight(getValueAtPath(weights, [...childPath, 'weight']), 100);
        if (childWeight <= 0) return;
        const childScore = isCriteria(child)
            ? calcAverage(evaluations, childPath)
            : calcWeightedAverageForSection(evaluations, child as EvaluationSection, childPath, weights);
        if (childScore == null) return;
        weightedSum += childScore * childWeight;
        totalWeight += childWeight;
    });
    return totalWeight > 0 ? weightedSum / totalWeight : null;
}

/**
 * Calculates the overall weighted average across all root sections of a grid
 * @param evaluations - Array of evaluations
 * @param gridSections - The root sections from the evaluation grid
 * @param weights - Weights object (typically a ref.value or plain object)
 * @returns Overall weighted average score or null if no valid scores
 */
export function calcWeightedAverageForGrid(
    evaluations: EvaluationListItem[],
    gridSections: (EvaluationSection | EvaluationCriteria)[],
    weights: any
): number | null {
    if (!Array.isArray(gridSections) || gridSections.length === 0) {
        return null;
    }
    let totalWeight = 0;
    let weightedSum = 0;
    gridSections.forEach((child, index) => {
        const childPath: Path = ['sections', String(index)];
        const childWeight = asWeight(getValueAtPath(weights, [...childPath, 'weight']), 100);
        if (childWeight <= 0) return;
        const childScore = isCriteria(child)
            ? calcAverage(evaluations, childPath)
            : calcWeightedAverageForSection(evaluations, child as EvaluationSection, childPath, weights);
        if (childScore == null) return;
        weightedSum += childScore * childWeight;
        totalWeight += childWeight;
    });
    return totalWeight > 0 ? weightedSum / totalWeight : null;
}
