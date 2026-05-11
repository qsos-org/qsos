<template>
  <div id="software-type-page">
    <nav>
      <NuxtLink :to="`/software-types`" class="button">
        <Icon name="uil:arrow-left" :title="$t('software_type_detail.back')" /> {{
          $t('software_type_detail.back_software_types') }}
      </NuxtLink>
    </nav>
    <LoadingHandler :status="status" :error="error" :refresh="refresh" />
    <template v-if="softwareType">
      <section class="software-type-card card" v-if="intent !== 'evaluate' && intent !== 'compare'">
        <section class="software-type-card-infos">
          <img :src="softwareType.icon" alt="Icon" v-if="softwareType.icon" />
          <h1>{{ softwareType.name }}</h1>
          <NuxtLink :to="`/software-types/${softwareType.uid}/edit`" class="button">
            <Icon name="uil:edit" :title="$t('software_type_detail.edit')" /><span>{{ $t('software_type_detail.edit')
              }}</span>
          </NuxtLink>
        </section>
        <p class="software-type-card-description">{{ softwareType.description }}</p>
        <section class="software-type-card-grids" v-if="evaluationGrids"
          @click="navigateTo(`/software-types/${softwareType.uid}/grids`)">
          <h2>{{ $t('software_type_detail.evaluation_grid') }}</h2>
          <ul class="links" v-if="evaluationGrids.length > 0">
            <li>
              <NuxtLink :to="`/software-types/${softwareType.uid}/grids/${lastGridVersion}`">
                {{ $t('software_type_detail.last_version') }} {{ lastGridVersion }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="`/software-types/${softwareType.uid}/grids`">{{ $t('software_type_detail.older_versions') }}
              </NuxtLink>
            </li>
          </ul>
          <template v-else>
            <p>{{ $t('software_type_detail.no_grids') }}</p>
            <NuxtLink v-if="isAuthenticated" :to="`/software-types/${softwareType.uid}/grids/new`" class="button">
              <Icon name="uil:plus" /> {{ $t('software_type_detail.add_grid') }}
            </NuxtLink>
          </template>
        </section>
      </section>

      <div class="comparison-wrapper">
        <section class="software-type-softwares">
          <h1 v-if="intent === 'evaluate'" class="ribbon-evaluate">{{ $t('software_type_detail.what_evaluate') }}</h1>
          <h1 v-else-if="intent === 'compare'" class="ribbon-select">{{ $t('software_type_detail.select_compare') }}
          </h1>
          <h2 v-else class="ribbon-define">{{ $t('software_type_detail.softwares', { name: softwareType.name }) }}</h2>
          <PresetSelector v-if="lastGridVersion" :user="user" :softwareTypeUid="softwareType.uid"
            :gridVersion="lastGridVersion!" v-model="selectedPreset" @loadPresetWeights="onLoadPresetWeights" />
          <SoftwareList :type="softwareType.uid" :intent="intent" :selected="selectedSoftwares" :grid="grid"
            :weights="weights" :presetLabel="selectedPreset" :evaluationsMap="evaluationsMap"
            @select="toggleSoftwareSelection" />
        </section>

        <aside class="software-selection" v-if="intent === 'compare' && selectedSoftwares.length > 0">
          <h2 class="ribbon-select">{{ $t('software_type_detail.selection') }}</h2>
          <div class="selected-softwares-card">
            <ul>
              <li v-for="software in selectedSoftwares" :key="software.uid">
                {{ software.name }}
              </li>
            </ul>
          </div>
          <button class="button" :disabled="selectedSoftwares.length < 2"
            @click="navigateTo(`/software-types/${route.params.type}/compare?softwares=${selectedSoftwares.map(s => s.uid).join(',')}&preset=${selectedPreset}`)">
            {{ $t('software_type_detail.compare') }}
          </button>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Software, SoftwareType } from '~~/types/software';
import type { EvaluationGrid, EvaluationListItem } from '~~/types/evaluation';
import SoftwareList from '~/components/softwares/SoftwareList.vue';
import PresetSelector from '~/components/PresetSelector.vue';

const route = useRoute();
const intent = route.query.intent as string;
const { loggedIn: isAuthenticated, user } = useUserSession();
const { data: softwareType, status, error, refresh } = await useFetch<SoftwareType>(`/api/software-types/${route.params.type}`);
const { data: evaluationGrids } = await useFetch<EvaluationGrid[]>(`/api/software-types/${route.params.type}/grids`);
const lastGridVersion = computed<string | null>(() => {
  if (!evaluationGrids.value?.length) return null;
  return evaluationGrids.value
    .reduce((prev, g) =>
      new Date(g.createdAt) > new Date(prev.createdAt) ? g : prev
    )
    .gridVersion;
});

const grid = computed<EvaluationGrid | null>(() => {
  if (!lastGridVersion.value) return null;
  return (
    evaluationGrids.value?.find((g) => g.gridVersion === lastGridVersion.value) ??
    null
  );
});

const { data: softwaresList } = await useFetch<Software[]>(`/api/software-types/${route.params.type}/softwares`);

const { data: evaluationsMapRaw } = await useAsyncData<
  Record<string, EvaluationListItem[]>
>(async () => {
  if (!softwaresList.value?.length || !lastGridVersion.value) {
    return {};
  }
  const entries = await Promise.all(
    softwaresList.value.map((s) =>
      $fetch<EvaluationListItem[]>(
        `/api/software-types/${route.params.type}/softwares/${s.uid}/evaluations?gridVersion=${lastGridVersion.value}`
      ).then((ev) => [s.uid, ev] as [string, EvaluationListItem[]])
    )
  );
  return Object.fromEntries(entries);
});
const evaluationsMap = computed(() => evaluationsMapRaw.value ?? {});

const selectedSoftwares = ref<Software[]>([]);
const toggleSoftwareSelection = (software: Software) => {
  const idx = selectedSoftwares.value.findIndex((s) => s.uid === software.uid);
  if (idx !== -1) selectedSoftwares.value.splice(idx, 1);
  else selectedSoftwares.value.push(software);
};

const selectedPreset = ref<string>(route.query.preset?.toString() || '');
const weights = ref<any>(null);
function onLoadPresetWeights(pw: any) {
  weights.value = pw;
}
</script>

<style scoped>
.preset-container {
  display: inline-flex;
  justify-content: flex-end;
  align-items: center;
  margin: -2em 0.5em 0 0.5em;
  float: right;
}

#preset-select {
  margin-left: 0.5em;
  padding: 0.25em 0.5em;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1em;
}

.software-type-card {
  display: grid;
  gap: 1rem 2rem;
  grid-template-areas: "infos grids" "description grids";
  grid-template-columns: 1fr auto;
  align-items: start;
}

.software-type-card-infos {
  grid-area: infos;
  display: flex;
  align-items: center;
  gap: 1em;
}

.software-type-card-infos h1 {
  margin: 0;
}

.software-type-card-description {
  grid-area: description;
  margin: 0;
}

.software-type-card-grids {
  grid-area: grids;
  display: flex;
  flex-direction: column;
  align-items: end;
}

.software-type-card-grids .links {
  margin: 0;
  list-style: none;
}

.software-type-card-grids h2 {
  margin-top: 0;
}

.software-type-card-grids p {
  grid-column: span 2;
}

section+section {
  margin-top: 1em;
}

h1 {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-top: 0;
}

p {
  margin: 0;
}

.comparison-wrapper {
  display: flex;
  gap: 2em;
  align-items: flex-start;
}

.software-type-softwares {
  flex: 1;
}

.selected-softwares-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 300px;
  border: 1px solid #ececec;
  margin-top: 1em;
}

.selected-softwares-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.selected-softwares-card li {
  padding: 0.5em 0;
  border-bottom: 1px solid #ddd;
}

.selected-softwares-card li:last-child {
  border-bottom: none;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>