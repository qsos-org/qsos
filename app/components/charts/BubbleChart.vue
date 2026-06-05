<template>
  <Bubble :data="chartData" :options="chartOptions" :width="400" :height="400" />
</template>

<script lang="ts" setup>
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  PointElement,
  LinearScale,
  type ChartOptions
} from 'chart.js';
import { Bubble } from 'vue-chartjs';
import { computed } from 'vue';
import type { EvaluationGrid, EvaluationListItem } from '~~/types/evaluation';
import type { Software } from '~~/types/software';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const props = defineProps<{
  softwares: { [softwareUid: string]: { software: Software, evaluations: EvaluationListItem[] } },
  grid: EvaluationGrid,
  weights: { [key: string]: any }
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

function weightedAverageExcludingMaturity(evaluations: EvaluationListItem[], weights: any) {
  const maturityNames = ['Maturity', 'Maturité', 'Madurez', 'Section générique', 'qsos_maturity_2_0.maturity']
  const sectionIndices = props.grid.sections.map((_, idx) => idx).filter(idx =>
    !maturityNames.includes(props.grid.sections[idx]!.name)
  );
  const scores = sectionIndices.map(idx => weightedAverageForSection(evaluations, idx, weights)).filter(v => v !== null) as number[];
  return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
}

const chartData = computed(() => ({
  datasets: Object.entries(props.softwares).map(([softwareUid, { software, evaluations }], idx) => {
    const functionalCover = weightedAverageExcludingMaturity(evaluations, props.weights);
    const maturityNames = ['Maturity', 'Maturité', 'Madurez', 'Section générique', 'qsos_maturity_2_0.maturity']
    const maturityIdx = props.grid.sections.findIndex(section => maturityNames.includes(section.name));
    const maturity = maturityIdx !== -1 ? weightedAverageForSection(evaluations, maturityIdx, props.weights) : null;

    return {
      label: software.name,
      backgroundColor: generateRandomColor(idx),
      data: [{ x: functionalCover, y: maturity, r: 5 }]
    };
  })
}));

const chartOptions: ChartOptions<'bubble'> = {
  responsive: true,
  plugins: {
    tooltip: {
      callbacks: {
        label: function (context) {
          const dataPoint = context.raw as { x: number, y: number };
          if (!dataPoint) return '';
          const x = dataPoint.x;
          const y = dataPoint.y;
          return `{x: ${x}\ny: ${y}}`;
        }
      }
    }
  },
  scales: {
    x: {
      min: 0,
      max: 2,
      title: {
        display: true,
        text: 'Functional cover'
      }
    },
    y: {
      min: 0,
      max: 2,
      title: {
        display: true,
        text: 'Maturity'
      }
    }
  }
};
</script>
