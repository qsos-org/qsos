<template>
  <div id="comparison-view">
    <div class="evaluations-data">
      <header>
        <h2>{{ $t('compare.title', { type: softwareTypeName }) }}</h2>
        <p>{{ $t('compare.grid_version') }}
          <select v-model="selectedGridVersion">
            <option v-for="grid in evaluationGrids" :key="grid.gridVersion" :value="grid.gridVersion">
              {{ grid.gridVersion }}
            </option>
          </select>
        </p>
      </header>
      <p class="legacy-info" v-if="grid && grid.sections.some(s => s.name === 'Section générique')">
        <span class="icon">ℹ️</span>
        {{ $t('compare.legacy_maturity_info') }}
      </p>
      <LoadingHandler :status="status" :error="error" :refresh="refresh" />
      <div class="table-scroll-container">
        <table id="compare-table" class="compare-table" v-if="softwares">
          <thead>
            <tr>
              <th>{{ $t('compare.criteria') }}</th>
              <th>{{ $t('compare.weight') }}
                <br />
                {{ $t('compare.preset') }} <select v-model="selectedPresetUid">
                  <option disabled value="">{{ $t('compare.select_preset') }}</option>
                  <option value="default">{{ $t('compare.default') }}</option>
                  <option v-for="preset in requirementPresets" :key="preset.presetUid" :value="preset.presetUid">
                    {{ preset.label }}{{ preset.description ? ` (${preset.description})` : '' }}
                  </option>
                </select>
                <br />
                <button @click="openSave">
                  <Icon name="uil:save" /> {{ $t('compare.save_weights') }}
                </button>
              </th>
              <th v-for="(data, softwareId) in softwares" :key="softwareId">
                {{ data.software.name }}
                <select v-model="selectedVersions[softwareId]" @change="onChangeVersion(softwareId)">
                  <option v-for="version in availableVersions[softwareId]" :key="version" :value="version">
                    {{ version }}
                  </option>
                </select>
                <br />
                {{ $t('compare.evaluations', data.evaluations?.length ?? 0) }}
              </th>
            </tr>
            <tr v-if="grid?.sections" class="computed-score">
              <th>{{ $t('compare.computed_score') }}</th>
              <th></th>
              <th v-for="(data, softwareId) in softwares" :key="softwareId">
                <Score :score="computedScores[softwareId] ?? null" />
              </th>
            </tr>
          </thead>
          <tbody>
            <CompareRow v-for="(section, index) in grid?.sections" :key="section.name + '-' + versionsKey" :section
              :softwares :weights :path="['sections', index.toString()]" @change="onWeightsChange" />
          </tbody>
        </table>
        <table id="cmp-table-print" class="compare-table table-for-pdf print-table" v-if="softwares">
          <thead>
            <tr>
              <th>{{ $t('compare.criteria') }}</th>
              <th>{{ $t('compare.weight_preset_label', { preset: SelectedPresetLabel }) }} </th>
              <th v-for="(data, softwareId) in softwares" :key="softwareId">
                {{ data.software.name }}
                {{ $t('compare.version_label') }} {{ selectedVersions[softwareId] }}
                {{ $t('compare.evaluations', data.evaluations?.length ?? 0) }}
              </th>
            </tr>
            <tr v-if="grid?.sections" class="computed-score">
              <th>{{ $t('compare.computed_score') }}</th>
              <th></th>
              <th v-for="(data, softwareId) in softwares" :key="softwareId">
                <Score :score="computedScores[softwareId] ?? null" />
              </th>
            </tr>
          </thead>
          <tbody>
            <CompareRow v-for="(section, index) in grid?.sections" :key="section.name + '-print-' + versionsKey"
              :section :softwares :weights :path="['sections', index.toString()]" :print="true"
              @change="onWeightsChange" />
          </tbody>
        </table>
      </div>
    </div>

    <div class="visualization" v-if="softwares && grid">
      <button class="action export_pdf_btn" @click="onExportPdf">
        <Icon name="uil:file-download" /> {{ $t('compare.export_pdf') }}
      </button>
      <menu>
        <li><button @click="visualization = 'radar'">
            <Icon name="uil:crosshairs" /> {{ $t('compare.radar') }}
          </button></li>
        <li><button @click="visualization = 'bubble'">
            <Icon name="uil:circle-layer" /> {{ $t('compare.bubble') }}
          </button></li>
      </menu>
      <RadarChart v-if="visualization === 'radar'" :key="'radar-' + versionsKey" :softwares :grid :weights="weights" />
      <BubbleChart v-if="visualization === 'bubble'" :key="'bubble-' + versionsKey" :softwares :grid
        :weights="weights" />
    </div>

    <PresetSave :show="showSave" :mode="saveMode" :label="presetLabel" :description="presetDescription"
      :existingPresets="requirementPresets" :originalLabel="originalLabel" @close="showSave = false" @save="savePreset"
      @saveAsNew="saveAsNew" @update:label="presetLabel = $event" @update:description="presetDescription = $event" />
  </div>
</template>

<script lang="ts" setup>
import type { Evaluation, EvaluationCriteria, EvaluationGrid, EvaluationListItem, EvaluationSection } from '~~/types/evaluation';
import type { Software, SoftwareType } from '~~/types/software';
import RadarChart from '~/components/charts/RadarChart.vue';
import BubbleChart from '~/components/charts/BubbleChart.vue';
import Score from '~/components/compare/Score.vue';
import type { RequirementPreset } from '~~/types/requirements';
import { getEmailUser } from '~/services/user';
import PresetSave from '~/components/PresetSave.vue';
import { computed, nextTick, ref } from 'vue'
import { exportPDF } from '@/services/export/exportPDF'
import { calcWeightedAverageForGrid } from '~/utils/compare';

const { t } = useI18n();

const route = useRoute();
const softwareTypeUid = route.params.type?.toString();

const { user } = useUserSession();

const { data: softwareType } = await useFetch<SoftwareType>(`/api/software-types/${softwareTypeUid}`);
const { data: evaluationGrids, status, error, refresh } = await useFetch<EvaluationGrid[]>(`/api/software-types/${softwareTypeUid}/grids`);
const selectedSoftwares = ref<string[]>(route.query.softwares?.toString().split(',') || []);
const lastGridVersion = computed(() => {
  if (!evaluationGrids.value || evaluationGrids.value.length === 0) return null;
  // Grid list is already sorted by createdAt (newest first), so just take the first one
  return evaluationGrids.value?.[0]?.gridVersion ?? null;
});

const softwareTypeName = computed(() => grid.value ? grid.value.softwareType.name : softwareType)

const selectedGridVersion = ref(route.query.gridVersion?.toString() || lastGridVersion.value);
const grid = computed(() => evaluationGrids.value?.find(g => g.gridVersion === selectedGridVersion.value));
const selectedVersions = ref({} as any);
const versionsKey = computed(() => JSON.stringify(selectedVersions.value));
const availableVersions = ref({} as any);

// Update selectedGridVersion when evaluationGrids is loaded
watch(evaluationGrids, () => {
  if (!selectedGridVersion.value && lastGridVersion.value) {
    selectedGridVersion.value = lastGridVersion.value;
  }
});

const requirementPresets = ref<RequirementPreset[]>([]);
const selectedPresetUid = ref<string>('');
const presetLabel = ref('');
const presetDescription = ref('');
const originalLabel = ref('');
const saveMode = ref<'new' | 'update'>('new');
const showSave = ref(false);

const selectedPreset = ref(null);
const weights = ref<{ [key: string]: any }>({});

const computedScores = computed(() => {
  if (!softwares.value || !grid.value?.sections) return {} as Record<string, number | null>;
  const result: Record<string, number | null> = {};
  Object.entries(softwares.value).forEach(([softwareId, data]) => {
    result[softwareId] = calcWeightedAverageForGrid(data.evaluations, grid.value!.sections, weights.value);
  });
  return result;
});

const SelectedPresetLabel = computed(() => {
  if (selectedPresetUid.value === 'default') return 'Default';
  const preset = requirementPresets.value.find(p => p.presetUid === selectedPresetUid.value);
  return preset ? preset.label : 'Default';
});

function sortVersions(versions: string[]): string[] {
  return [...versions].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function initWeights(grid: EvaluationGrid) {
  const INITIAL_WEIGHT = 100;
  const isSubsection = (section: EvaluationSection | EvaluationCriteria): section is EvaluationSection => "sections" in section;
  const traverse = (sections: (EvaluationSection | EvaluationCriteria)[], weightsNode: any[]) => {
    sections.forEach((section, index) => {
      if (isSubsection(section)) {
        weightsNode[index] = { sections: [] };
        traverse(section.sections, weightsNode[index].sections);
      } else {
        weightsNode[index] = { weight: INITIAL_WEIGHT };
      }
    });
    return weightsNode;
  };
  return { sections: traverse(grid.sections, []) };
}

watch([user, selectedGridVersion], async () => {
  // Only load presets if selectedGridVersion is set
  if (!selectedGridVersion.value) return;
  
  await loadPresets();
  // If a preset is specified in the URL, use it; otherwise select the most recent or default
  const presetFromUrl = route.query.preset?.toString();
  if (presetFromUrl && requirementPresets.value.some((p: RequirementPreset) => p.presetUid === presetFromUrl)) {
    selectedPresetUid.value = presetFromUrl;
  } else if (requirementPresets.value.length > 0) {
    selectedPresetUid.value = requirementPresets.value[0]!.presetUid;
  } else {
    selectedPresetUid.value = 'default';
  }
}, { immediate: true });

// Force reload presets when route changes (e.g., after creating a preset)
watch(() => route.query, async () => {
  await loadPresets();
}, { deep: true });

watch(grid, newGrid => {
  if (newGrid) weights.value = initWeights(newGrid);
}, { immediate: true });

watch(selectedPresetUid, (newPresetUid) => {
  if (!newPresetUid || newPresetUid === 'default') {
    if (grid.value) weights.value = initWeights(grid.value);
    return;
  }
  const preset = requirementPresets.value.find(p => p.presetUid === newPresetUid);
  if (preset) loadPresetWeights(preset);
});

onMounted(async () => {
  const presetFromQuery = route.query.preset?.toString();
  const gridVersionFromQuery = route.query.gridVersion?.toString();
  
  // If gridVersion is in query but not set yet, set it
  if (gridVersionFromQuery && gridVersionFromQuery !== selectedGridVersion.value) {
    selectedGridVersion.value = gridVersionFromQuery;
  }
  
  // Force reload presets on mount to catch newly created presets
  await loadPresets();
  
  // Wait a bit for the watcher to load presets, then try to set preset from query
  if (presetFromQuery) {
    // Give the watcher a chance to load presets
    await new Promise(resolve => setTimeout(resolve, 50));
    if (presetFromQuery !== selectedPresetUid.value) {
      selectedPresetUid.value = presetFromQuery;
    }
  }
});

async function loadPresets() {
  const userUid = getEmailUser(user.value);
  if (!userUid) return;
  // Load all presets for this software type, regardless of grid version
  const allPresets = await $fetch<RequirementPreset[]>(`/api/users/${userUid}/requirements-presets?softwareTypeUid=${softwareTypeUid}`);
  // Filter by current grid version
  const filteredPresets = allPresets.filter(p => p.gridVersion === selectedGridVersion.value);
  requirementPresets.value = filteredPresets.sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return dateB - dateA;
  });
}

function loadPresetWeights(preset: RequirementPreset) {
  if (preset.criteriaWeights) {
    weights.value = JSON.parse(JSON.stringify(preset.criteriaWeights));
  }
}

function openSave() {
  const preset = requirementPresets.value.find(p => p.presetUid === selectedPresetUid.value);
  if (preset) {
    saveMode.value = 'update';
    presetLabel.value = preset.label;
    presetDescription.value = preset.description ?? '';
    originalLabel.value = preset.label;
  } else {
    saveMode.value = 'new';
    presetLabel.value = '';
    presetDescription.value = '';
    originalLabel.value = '';
  }
  showSave.value = true;
}

async function savePreset() {
  const userUid = getEmailUser(user.value);
  if (!presetLabel.value.trim()) return alert(t('compare.enter_preset_name'));
  const presetData = {
    label: presetLabel.value.trim(),
    description: presetDescription.value.trim() || undefined,
    gridVersion: selectedGridVersion.value,
    softwareTypeUid: softwareTypeUid,
    criteriaWeights: weights.value,
  };
  try {
    let savedPreset;
    if (saveMode.value === 'update' && selectedPresetUid.value) {
      savedPreset = await fetch(`/api/users/${userUid}/requirements-presets/${selectedPresetUid.value}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(presetData)
      }).then(r => r.json());
    } else {
      savedPreset = await $fetch(`/api/users/${userUid}/requirements-presets`, {
        method: 'POST', body: presetData
      });
    }
    showSave.value = false;
    await loadPresets();
    if (savedPreset?.presetUid) {
      selectedPresetUid.value = savedPreset.presetUid;
    }
  } catch (error) {
    console.error(t('compare.error_saving_preset'), error);
  }
}
const saveAsNew = () => {
  saveMode.value = 'new';
  originalLabel.value = '';
  savePreset();
}

function onWeightsChange(updatedWeights: { [key: string]: any }) {
  // Replace the root object to trigger reactive updates in computed scores.
  weights.value = { ...updatedWeights };
}

const { data: softwares } = await useAsyncData(async () => {
  const result: Record<string, { softwareUid: string; software: Software; evaluations: EvaluationListItem[] }> = {};
  await Promise.all(selectedSoftwares.value.map(async uid => {
    const software = await $fetch(`/api/software-types/${softwareTypeUid}/softwares/${uid}`);
    const versions = sortVersions(software.versions.map(v => v.version));
    const lastVersion = versions.at(-1) || '';
    availableVersions.value[uid] = versions;
    const versionFromUrl = route.query[`version_${uid}`]?.toString();
    if (versionFromUrl && versions.includes(versionFromUrl)) {
      selectedVersions.value[uid] = versionFromUrl;
    } else {
      if (uid === selectedSoftwares.value[0] && route.query[`version_${uid}`]) {
        selectedVersions.value[uid] = route.query[`version_${uid}`];
      } else {
        selectedVersions.value[uid] = versions.at(-1) || '';
      }
    }
    const evaluations = await $fetch(`/api/software-types/${softwareTypeUid}/softwares/${uid}/versions/${selectedVersions.value[uid]}/evaluations/${selectedGridVersion.value}/evaluations`);
    result[uid] = { softwareUid: uid, software, evaluations };
  }));
  return result;
});

async function onChangeVersion(softwareId: string) {
  const evaluations = await $fetch(`/api/software-types/${softwareTypeUid}/softwares/${softwareId}/versions/${selectedVersions.value[softwareId]}/evaluations/${selectedGridVersion.value}/evaluations`);
  const software = softwares.value?.[softwareId]
  if (software) {
    software.evaluations = evaluations;
    softwares.value = { ...softwares.value }; // Trigger reactivity
  }
}

watch(selectedGridVersion, async () => {
  const updatedSoftwares = await Promise.all(selectedSoftwares.value.map(async uid => {
    const software = await $fetch(`/api/software-types/${softwareTypeUid}/softwares/${uid}`);
    const versions = sortVersions(software.versions.map(v => v.version));
    const lastVersion = versions.at(-1) || '';
    availableVersions.value[uid] = versions;
    selectedVersions.value[uid] = lastVersion;
    const evaluations = await $fetch(`/api/software-types/${softwareTypeUid}/softwares/${uid}/versions/${lastVersion}/evaluations/${selectedGridVersion.value}/evaluations`);
    return { softwareUid: uid, software, evaluations };
  }));
  softwares.value = updatedSoftwares.reduce((acc, software) => ({ ...acc, [software.softwareUid]: software }), {})
});

//const visualization = ref('radar');
const visualization = ref<'radar' | 'bubble'>('radar')

const setVisualization = async (kind: 'radar' | 'bubble') => {
  visualization.value = kind
  await nextTick()
}

async function onExportPdf() {
  await exportPDF({
    tableId: 'cmp-table-print',
    vizSelector: '.visualization',
    title: `QSOS - Comparison (${grid?.value?.gridVersion ?? ''})`,
    softwareType: softwareTypeUid ?? '',
    setVisualization
  });
}
</script>

<style scoped>
#comparison-view {
  display: grid;
  grid-template-columns: 1fr 400px;
}

.visualization {
  padding: 0.5rem 1rem 1rem 1rem;
  position: relative;
}

.export_pdf_btn {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  display: inline-block;
  align-items: center;
  gap: 0.3em;
}

.visualization menu {
  margin-top: 40px;
}

.evaluations-data {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.evaluations-data header {
  display: flex;
  justify-content: space-between;
  align-items: top;
}

.evaluations-data header>* {
  margin-block: 0.5em;
}

menu {
  justify-self: end;
  display: flex;
  gap: 0.5em;
  align-items: start;
  padding: 0;
}

menu li {
  list-style: none;
}

.visualization:deep(canvas) {
  margin: 0 auto;
}

.table-scroll-container {
  overflow-x: auto;
  overflow-y: auto;
  max-height: 80vh;
}

.table-scroll-container table {
  min-width: 1000px;
  width: max-content;
  border-collapse: collapse;
}

.table-scroll-container th,
.table-scroll-container td {
  white-space: nowrap;
  padding: 0.5em;
}

.table-scroll-container::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.table-scroll-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.table-for-pdf {
  position: absolute;
  top: -9999px;
  left: -9999px;
  width: auto;
  height: auto;
  overflow: visible;
  opacity: 0;
  pointer-events: none;
}

.print-table input {
  display: none;
}

.print-table .print-weight {
  display: inline;
}


.table-for-pdf button,
.table-for-pdf select,
.table-for-pdf .path {
  display: none;
}

.table-for-pdf {
  display: block !important;
  text-align: center !important;
}

.compare-table :deep(th:first-child, td:first-child) {
  max-width: 40ch;
  text-overflow: ellipsis;
  word-break: break-word;
}

tr.computed-score th:not(:first-child) {
  font-weight: bold;
  font-size: 1.5rem;
  text-align: center;
}

#compare-table thead {
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: var(--background-color-alt);
}

#compare-table thead th {
  border: 1px solid var(--border-color-light);
}

#compare-table tbody:nth-of-type(1) tr:nth-of-type(1) td {
  border-top: none !important;
}

#compare-table thead th {
  border-top: none !important;
  border-bottom: none !important;
  box-shadow: inset 0 1px 0 #ccc, inset 0 -1px 0 #ccc;
  padding: 2px 0;
}
</style>