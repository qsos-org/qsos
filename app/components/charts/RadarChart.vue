<template>
  <Radar :data="chartData" :options="chartOptions" :width="400" :height="400" />
</template>

<script lang="ts" setup>
import { Radar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData
} from 'chart.js';
import { computed } from 'vue';
import type { EvaluationGrid, EvaluationListItem } from '~~/types/evaluation';
import type { Software } from '~~/types/software';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const props = defineProps<{
  softwares: { [softwareUid: string]: { software: Software, evaluations: EvaluationListItem[] } },
  grid: EvaluationGrid,
  weights: any
}>();

function generateRandomColor(idx: number) {
  const hue = 360 * idx / Math.max(1, Object.keys(props.softwares).length);
  return `hsl(${hue}, 70%, 50%)`;
}

function getWeight(weights: any, path: (string | number)[]): number {
  let current = weights.sections;
  for (const key of path) {
    if (!current) return 1;
    current = current[key];
  }
  return current?.weight ?? 1;
}

function getScoresAndWeightsForSection(
  evaluations: EvaluationListItem[],
  sectionIdx: number,
  weights: any
): { scores: number[], weights: number[] } {
  const sectionDef = props.grid.sections[sectionIdx];

  function visit(section: any, path: (string | number)[]): { scores: number[], weights: number[] } {
    if (!section) return { scores: [], weights: [] };

    if (!('sections' in section)) {
      const allScores: number[] = evaluations.map(evaluation => {
        let current: any = evaluation.sections;
        for (const key of path) {
          if (!current) return null;
          current = current[key];
        }
        return typeof current?.score === 'number' ? current.score : null;
      }).filter(v => v !== null) as number[];

      if (allScores.length === 0) return { scores: [], weights: [] };

      const avgScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
      const weight = getWeight(weights, path);
      return { scores: [avgScore], weights: [weight] };
    } else {
      return section.sections.reduce(
        (acc: { scores: number[], weights: number[] }, subsection: any, idx: number) => {
          const result = visit(subsection, [...path, 'sections', idx]);
          return { scores: acc.scores.concat(result.scores), weights: acc.weights.concat(result.weights) };
        },
        { scores: [], weights: [] }
      );
    }
  }

  return visit(sectionDef, [sectionIdx]);
}

function weightedAverageForSection(
  evaluations: EvaluationListItem[],
  sectionIdx: number,
  weights: any
) {
  const { scores, weights: criteriaWeights } = getScoresAndWeightsForSection(evaluations, sectionIdx, weights);
  if (scores.length === 0 || criteriaWeights.length === 0) return null;

  let total = scores.reduce((total, score, i) => total + score * (criteriaWeights[i] ?? 1), 0);
  let totalWeight = scores.reduce((total, _, i) => total + (criteriaWeights[i] ?? 1), 0);

  if (totalWeight === 0) return null;
  return parseFloat((total / totalWeight).toFixed(2));
}

const sectionLabels = computed(() => props.grid.sections.map(section => $t(section.name)));

const chartData: ComputedRef<ChartData<"radar">> = computed(() => ({
  labels: sectionLabels.value,
  datasets: Object.entries(props.softwares).map(([softwareUid, { software, evaluations }], idx) => ({
    label: software.name,
    data: props.grid.sections.map((_, sectionIdx) => weightedAverageForSection(evaluations, sectionIdx, props.weights)),
    borderColor: generateRandomColor(idx),
    backgroundColor: 'rgba(0,0,0,0.07)',
    fill: true
  }))
}));

const chartOptions: ChartOptions<"radar"> = {
  responsive: true,
  scales: {
    r: {
      min: 0,
      max: 2
    }
  }
};
</script>