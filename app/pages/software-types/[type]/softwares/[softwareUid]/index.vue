<template>
  <div>
    <nav>
      <NuxtLink :to="`/software-types/${route.params.type}`" class="button">
        <Icon name="uil:arrow-left" :title="$t('software.back')" />
        {{
          $t('software.back_to_type', {
            type:
              software?.type.name ?? route.params.type
          })
        }}
      </NuxtLink>
    </nav>
    <LoadingHandler :status="status" :error="error" :refresh="refresh" />
    <template v-if="software">
      <section class="software-card card">
        <div class="software-card-infos">
          <img :src="software.icon" alt="Icon" v-if="software.icon" />
          <h1>{{ software.name }}</h1>
          <NuxtLink :to="`/software-types/${software.type.uid}/softwares/${software.uid}/edit`" class="button">
            <Icon name="uil:edit" title="Edit" size="24" /><span>{{ $t('software.edit') }}</span>
          </NuxtLink>
          <a v-if="software.url" :href="software.url" target="_blank" rel="noopener noreferrer" class="button">
            <Icon name="uil:globe" title="Website" size="24" /><span>{{ $t('software.website') }}</span>
          </a>
          <a v-if="software.demoUrl" :href="software.demoUrl" target="_blank" rel="noopener noreferrer" class="button">
            <Icon name="uil:monitor" title="Demo" size="24" /> <span>{{ $t('software.demo') }}</span>
          </a>
          <span class="license">{{ $t('software.license') }}{{ software.licenseId }}</span>
        </div>
        <p class="software-card-description">{{ software.description }}</p>

        <div class="software-card-versions">
          <template v-if="software.versions.length > 0">
            <h2>
              {{ $t('software.version') }}
              <select v-model="currentVersion" @change="handleVersionChange">
                <option v-for="version in sortedVersions" :key="version.version" :value="version.version">
                  {{ version.version }}
                </option>
              </select>
            </h2>
            <NuxtLink :to="`/software-types/${software.type.uid}/softwares/${software.uid}/versions`">
              {{ $t('software.see_all_versions') }}
            </NuxtLink>
          </template>
          <template v-if="software.versions.length === 0">
            <p v-if="isAuthenticated">{{ $t('software.no_version') }}</p>
            <p v-else>{{ $t('software.no_version_login') }}</p>
            <NuxtLink v-if="isAuthenticated"
              :to="`/software-types/${software.type.uid}/softwares/${software.uid}/versions/new`">
              <Icon name="uil:plus" /> {{ $t('software.add_version') }}
            </NuxtLink>
          </template>
        </div>
      </section>

      <div class="cols">
        <section class="evaluations">
          <h2>{{ $t('software.evaluations') }}</h2>
          <NuxtLink v-if="isAuthenticated" class="button"
            :to="`/software-types/${route.params.type}/softwares/${route.params.softwareUid}/versions/${currentVersion ?? 'latest'}/evaluations/new`">
            <Icon name="uil:clipboard-notes" />{{ $t('software.add_evaluation') }}
          </NuxtLink>
          <EvaluationList v-if="evaluations && route.params.softwareUid && route.params.type" :evaluations="evaluations"
            :softwareId="route.params.softwareUid.toString()" :softwareType="route.params.type.toString()"
            :currentVersion="currentVersion ?? 'latest'" :isAuthenticated="isAuthenticated"
            @select="handleEvaluationSelect" />
        </section>

        <section class="comparison">
          <h2>{{ $t('software.compare_to_other', { name: software.name }) }}</h2>
          <div v-if="otherSoftwares.length > 0" class="comparison-list">
            <div class="software-selection-list">
              <div v-for="software in otherSoftwares" :key="software.uid" class="card link selectable"
                :class="{ selected: selectedSoftwaresForCompare.includes(software.uid) }"
                @click="toggleSoftwareSelection(software.uid)">
                <img :src="software.icon ?? DEFAULT_SOFTWARE_ICON" alt="" width="32" height="32" />
                <span>{{ software.name }}</span>
                <Icon name="uil:check"
                  :style="{ opacity: selectedSoftwaresForCompare.includes(software.uid) ? 1 : 0 }" />
              </div>
            </div>
            <NuxtLink v-if="selectedSoftwaresForCompare.length > 0" :to="getCompareLink()" class="button">
              <Icon name="uil:comparison" />
              {{ $t('software.compare', { count: selectedSoftwaresForCompare.length + 1 }) }}
            </NuxtLink>
          </div>
          <p v-else>{{ $t('software.no_other_for_comparison') }}</p>
        </section>
      </div>
    </template>
  </div>
</template>


<script lang="ts" setup>
import type { Software } from '~~/types/software';
import type { EvaluationListItem } from '~~/types/evaluation';
import EvaluationList from '~/components/evaluations/EvaluationList.vue';
import log from 'loglevel';
import DEFAULT_SOFTWARE_ICON from '~/assets/images/default_software_icon.svg';

const route = useRoute();

const { data: software, status, error, refresh } = useFetch<Software>(`/api/software-types/${route.params.type}/softwares/${route.params.softwareUid}`);
const { data: allSofwares } = useFetch<Software[]>(`/api/software-types/${route.params.type}/softwares`);

const otherSoftwares = computed(() => {
  if (!allSofwares.value || !software.value) return [];
  return allSofwares.value.filter(s => s.uid !== software.value?.uid);
});

const selectedSoftwaresForCompare = ref<string[]>([]);

function toggleSoftwareSelection(uid: string) {
  const index = selectedSoftwaresForCompare.value.indexOf(uid);
  if (index === -1) {
    selectedSoftwaresForCompare.value.push(uid);
  } else {
    selectedSoftwaresForCompare.value.splice(index, 1);
  }
}

function getCompareLink(): string {
  const currentSoftwareUid = route.params.softwareUid as string;
  const allSelectedIds = [currentSoftwareUid, ...selectedSoftwaresForCompare.value];
  const idsParam = allSelectedIds.map(id => encodeURIComponent(id)).join(',');
  let url = `/software-types/${route.params.type}/compare?softwares=${idsParam}`;
  if (currentVersion.value) {
    url += `&version_${currentSoftwareUid}=${currentVersion.value}`;
  }
  return url;
}

const sortedVersions = computed(() => {
  if (!software.value?.versions) return [];
  return [...software.value.versions].sort((a, b) => {
    const dateA = a.createdAt || a.dateAdded || '';
    const dateB = b.createdAt || b.dateAdded || '';
    return dateB.localeCompare(dateA);
  });
});

const currentVersion = ref<string | null>(null);
const { loggedIn: isAuthenticated } = useUserSession();
const { data: evaluations, refresh: refreshEvaluations } = useFetch<EvaluationListItem[]>(() => {
  const version = currentVersion.value ?? 'latest';
  log.trace(`Fetching evaluations for version: ${version}`);
  return `/api/software-types/${route.params.type}/softwares/${route.params.softwareUid}/evaluations?softwareVersion=${version}`;
});

const handleVersionChange = () => {
  refreshEvaluations();
};

const handleEvaluationSelect = (evaluation: EvaluationListItem) => {
  log.info('Selected evaluation:', evaluation);
};

watch(sortedVersions, (versions) => {
  if (!versions || versions.length === 0) return;
  if (!currentVersion.value || !versions.find(v => v.version === currentVersion.value)) {
    currentVersion.value = versions[0]!.version;
    refreshEvaluations();
  }
}, { immediate: true });


watch(currentVersion, (newVersion) => {
  if (newVersion) {
    log.info('New version selected:', newVersion);
    refreshEvaluations();
  }
});
</script>

<style scoped>
.software-card {
  display: grid;
  gap: 1rem 2rem;
  grid-template-areas: "infos versions" "description versions";
  grid-template-columns: 1fr auto;
  align-items: start;
}

.software-card-infos {
  grid-area: infos;
  display: flex;
  align-items: center;
  gap: 1em;
}

.software-card-description {
  grid-area: description;
  margin: 0;
}

.software-card-versions {
  grid-area: versions;
}

h1 {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.cols {
  display: grid;
  margin-top: 1em;
  grid-template-columns: 1fr 400px;
  gap: 1em;
}

.comparison-list {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.software-selection-list {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  max-height: 400px;
  overflow-y: auto;
}

.software-selection-list .card {
  display: flex;
  align-items: center;
  gap: 0.75em;
  padding: 0.75em;
}

.software-selection-list .card span {
  flex: 1;
}

.software-selection-list .card .i-uil\:check {
  color: var(--success-color);
  font-size: 1.5em;
  transition: opacity 0.2s;
  flex: 0 0 24px;
}

.comparison-list>.button {
  align-self: flex-start;
}

.card.selected {
  border-color: var(--success-color);
  background-color: color-mix(in srgb, var(--success-color), white 90%);
}
</style>