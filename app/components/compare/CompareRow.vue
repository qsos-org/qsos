<template>
  <tr class="section" :title="section.description">
    <td @click="opened = !opened">
      <span class="path">{{ path.length >= 4 ? `${'&nbsp;'.repeat(path.length - 3)}└` : '' }}
        {{ opened ? '📂' : '📁' }}</span>
      {{ $t(section.name, section.name) }}
    </td>
    <td>
      <span v-if="print" class="print-weight">{{ asWeight(getValueAtPath(weights, [...path, 'weight']), 100) }}%</span>
      <WeightInput v-else :value="asWeight(getValueAtPath(weights, [...path, 'weight']), 100)"
        @change="updateWeight(null, $event)" />
    </td>
    <td v-for="(data, softwareId) in softwares" :key="softwareId">
      <Score :score="calcWeightedAverageForSection(data.evaluations, section, path, weights)" />
    </td>
  </tr>

  <template v-if="opened">
    <template v-for="(subsection, index) in section.sections" :key="subsection.name">
      <template v-if="isCriteria(subsection)">
        <tr class="criteria">
          <td><span class="path">{{ '&nbsp;'.repeat(path.length + 2) + '└&nbsp;&nbsp;' }}</span>{{ $t(subsection.name,
            subsection.name) }}
          </td>
          <td>
            <span v-if="print" class="print-weight">{{ asWeight(getValueAtPath(weights, [...path, 'sections',
            index.toString(), 'weight'])) }}%</span>
            <WeightInput v-else
              :value="asWeight(getValueAtPath(weights, [...path, 'sections', index.toString(), 'weight']), 100)"
              @change="updateWeight(index, $event)" />
          </td>
          <td v-for="(data, softwareId) in softwares" :key="softwareId">
            <Score :score="calcAverage(data.evaluations, [...path, 'sections', index.toString()])" />
          </td>
        </tr>
      </template>
      <CompareRow v-else :section="subsection" :softwares="softwares" :weights="weights"
        :path="[...path, 'sections', index.toString()]" :print="print" @change="emit('change', weights)" />
    </template>
  </template>
</template>

<script lang="ts" setup>
import type { Path } from '~/utils/path';
import { getValueAtPath, setValueAtPath } from '~/utils/path';
import { isCriteria, type EvaluationSection, type EvaluationListItem, type EvaluationCriteria, isSubsection } from '~~/types/evaluation';
import { asWeight, calcAverage, calcWeightedAverageForSection } from '~/utils/compare';
import Score from './Score.vue';
import WeightInput from './WeightInput.vue';
import { onMounted } from 'vue';

const { softwares, weights, section, path = [], print = false } = defineProps<{
  softwares: { [softwareUid: string]: { evaluations: EvaluationListItem[] } },
  weights: { [key: string]: any },
  section: EvaluationSection,
  path?: Path,
  print?: boolean
}>();
const emit = defineEmits(['change']);
const opened = ref(true);

onMounted(() => {
  function applyDefaultWeight(row: EvaluationSection | EvaluationCriteria, currentPath: Path) {
    const weightPath = [...currentPath, 'weight'];
    const currentWeight = getValueAtPath(weights, weightPath);
    if (currentWeight === undefined || currentWeight === null) {
      setValueAtPath(weights, weightPath, 100);
    }

    if (isSubsection(row)) {
      row.sections.forEach((subsection, index) => {
        const subPath = [...currentPath, 'sections', index.toString()];
        applyDefaultWeight(subsection, subPath);
      });
    }
  }

  applyDefaultWeight(section, path);
  emit('change', weights);
});

function updateWeight(index: number | null, value: number) {
  const newPath = index === null
    ? [...path, 'weight']
    : [...path, 'sections', index.toString(), 'weight'];
  setValueAtPath(weights, newPath, value);
  emit('change', weights);
}
</script>

<style scoped>
tr.section {
  cursor: pointer;
  background-color: var(--background-color-alt);
}

td {
  text-align: center;
}

td:first-child {
  text-align: left;
  position: sticky;
  left: 0;
  background: linear-gradient(to right, #fff 70%, transparent 100%);
}

.path {
  color: #ccc;
}
</style>