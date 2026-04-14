<template>
  <div class="software-list">
    <LoadingHandler :status="status" :error="error" :refresh="refresh" />
    <template v-if="status === 'success' && !softwares?.length">
      <p>{{ $t('software_list.no_software') }}</p>
      <div class="actions" v-if="isAuthenticated">
        <button class="link" @click="navigateTo(`/software-types/${type}/softwares/new`)">
          <Icon name="uil:plus" /> {{ $t('software_list.add_new_software') }}
        </button>
      </div>
    </template>
    <template v-else-if="status === 'success' && softwares">
      <div>
        <SwitchInput v-model="isTableView" :label="$t('software_list.show_as_table')" />
      </div>
      <template v-if="viewMode === 'table'">
        <SoftwareTable :softwares="softwareRows" :intent="intent" :selected="selected"
          @select="emit('select', $event)" />
        <div class="actions" v-if="isAuthenticated">
          <button class="link" @click="navigateTo(`/software-types/${type}/softwares/new`)">
            <Icon name="uil:plus" /> {{ $t('software_list.add_new_software') }}
          </button>
        </div>
      </template>
      <div class="card-container" v-else>
        <SoftwareCard v-for="software in softwares" :key="software.uid" :software="software" :link="true"
          :intent="intent" :selected="selected.includes(software)" :score="weightedAverages[software.uid]"
          @select="emit('select', $event)" />
        <div class="card link action" v-if="isAuthenticated"
          @click="navigateTo(`/software-types/${type}/softwares/new`)">
          <Icon name="uil:plus" /> {{ $t('software_list.add_new_software') }}
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { Software } from '~~/types/software';
import type { EvaluationListItem, EvaluationCriteriaRated, EvaluationGrid } from '~~/types/evaluation';
import SoftwareCard from '~/components/softwares/SoftwareCard.vue';
import SoftwareTable from '~/components/softwares/SoftwareTable.vue';
import SwitchInput from '~/components/forms/SwitchInput.vue';
import { getValueAtPath } from '~/utils/path';

const props = defineProps<{
  type: string;
  selected: Software[];
  intent?: string;
  grid: EvaluationGrid | null;
  weights: any;
  evaluationsMap: Record<string, EvaluationListItem[]>;
}>();

const emit = defineEmits<{
  (e: 'select', payload: Software): void;
}>();



const { loggedIn: isAuthenticated } = useUserSession();

const { data: softwares, status, error, refresh } = useFetch<Software[]>(
  `/api/software-types/${props.type}/softwares`
);

type ViewMode = 'table' | 'card';
const viewMode = ref<ViewMode>('card');
const isTableView = computed<boolean>({
  get: () => viewMode.value === 'table',
  set: (val: boolean) => {
    viewMode.value = val ? 'table' : 'card';
  }
});

function flattenWeights(node: any[], path: string[] = []): Array<{ path: string[]; weight: number }> {
  const out: Array<{ path: string[]; weight: number }> = [];
  node.forEach((entry, idx) => {
    const base = [...path, 'sections', String(idx)];
    if ('weight' in entry) {
      out.push({ path: [...base], weight: entry.weight });
    } else if (!entry.sections) {
      out.push({ path: [...base], weight: 100 });
    }
    if (entry.sections) {
      out.push(...flattenWeights(entry.sections, [...base]));
    }
  });
  return out;
}

function computeWeightedAverage(softwareUid: string): number | null {
  const evals = props.evaluationsMap[softwareUid] || [];
  if (!props.grid || !evals.length) return null;

  const topWeights = props.weights?.sections ?? props.grid.sections;
  const flat = flattenWeights(topWeights, []);

  let sumWeighted = 0;
  let sumWeights = 0;
  for (const { path, weight } of flat) {
    const evalPath = path;
    const scores = evals
      .map(e => getValueAtPath(e, evalPath) as EvaluationCriteriaRated | undefined)
      .map(c => c?.score)
      .filter((s): s is number => typeof s === 'number');

    if (!scores.length) continue;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const effectiveWeight = weight ?? 100;
    sumWeighted += avg * effectiveWeight;
    sumWeights += effectiveWeight;
  }
  return sumWeights ? sumWeighted / sumWeights : null;
}

const weightedAverages = computed<Record<string, number | null>>(() => {
  const map: Record<string, number | null> = {};
  softwares.value?.forEach(s => {
    map[s.uid] = computeWeightedAverage(s.uid);
  });
  return map;
});

const softwareRows = computed(() => {
  return (softwares.value || []).map(s => ({
    ...s,
    score: weightedAverages.value[s.uid]
  }));
});
</script>

<style scoped>
.software-list {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}
</style>