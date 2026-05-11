<template>
    <div>
        <nav>
            <NuxtLink :to="`/`" class="button">
                <Icon name="uil:arrow-left" :title="$t('requirements_presets.back')" />{{ $t('requirements_presets.back_homepage') }}
            </NuxtLink>
        </nav>
        <h1 v-if="intent === 'manage'" class="ribbon-qualify">{{ $t('requirements_presets.my_presets') }}</h1>
        <h1 v-else class="ribbon-qualify">{{ $t('requirements_presets.title') }}</h1>
        <div class="filters">
            <div class="filter-group">
                <label for="softwareTypeFilter">{{ $t('requirements_presets.software_type') }}</label>
                <select id="softwareTypeFilter" v-model="selectedSoftwareType" class="filter-select">
                    <option value="">{{ $t('requirements_presets.all_software_types') }}</option>
                    <option v-for="type in availableSoftwareTypes" :key="type" :value="type">
                        {{ type }}
                    </option>
                </select>
            </div>
            <div class="filter-group">
                <label for="gridVersionFilter">{{ $t('requirements_presets.grid_version') }}</label>
                <select id="gridVersionFilter" v-model="selectedGridVersion" class="filter-select" :disabled="!selectedSoftwareType">
                    <option value="">{{ $t('requirements_presets.all_versions') }}</option>
                    <option v-for="version in availableGridVersions" :key="version" :value="version">
                        v{{ version }}
                    </option>
                </select>
            </div>
            <button @click="clearFilters" class="clear-filters-btn" v-if="selectedSoftwareType || selectedGridVersion">
                <Icon name="uil:times" /> {{ $t('requirements_presets.clear_filters') }}
            </button>
        </div>
        <LoadingHandler :status="status" :error="error" :refresh="refresh" />
        <div v-if="status === 'success'">
            <template v-if="!filteredPresets || filteredPresets.length === 0">
                <p v-if="selectedSoftwareType || selectedGridVersion">{{ $t('requirements_presets.no_presets_filtered') }}</p>
                <p v-else>{{ $t('requirements_presets.no_presets') }}</p>
                <p>{{ $t('requirements_presets.create_hint') }}</p>
                <div class="actions" v-if="isAuthenticated">
                    <NuxtLink :to="`/users/${userUid}/requirements-presets/new`" class="button">
                        <Icon name="uil:plus" /> {{ $t('requirements_presets.create_preset') }}
                    </NuxtLink>
                </div>
            </template>
            <div v-else class="card-container">
                <RequirementPresetCard v-for="preset in filteredPresets" :key="preset.presetUid" :preset="preset"
                    :userUid="userUid" link />
                <NuxtLink v-if="isAuthenticated" :to="`/users/${userUid}/requirements-presets/new`" class="card action">
                    <Icon name="uil:plus" /> {{ $t('requirements_presets.create_preset') }}
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { RequirementPreset } from '~~/types/requirements';
import { getEmailUser } from '~/services/user';
import RequirementPresetCard from '~/components/requirements-presets/RequirementPresetCard.vue';

const route = useRoute();
const intent = ref<string>(route.query.intent?.toString() ?? '');
watch(() => route.query?.intent?.toString(), (newIntent: string | undefined) => { intent.value = newIntent?.toString() ?? ''; });

const { user, loggedIn: isAuthenticated } = useUserSession();
const loggedInUserUid = getEmailUser(user.value);

const userUid = route.params.userUid?.toString() ?? '';

if (!userUid && loggedInUserUid) {
    await navigateTo(`/users/${loggedInUserUid}/requirements-presets`);
}

if (!userUid && !loggedInUserUid) {
    await navigateTo('/login');
}

const { data: presets, status, error, refresh } = await useFetch<RequirementPreset[]>(`/api/users/${userUid}/requirements-presets?softwareTypeUid=*`);

const selectedSoftwareType = ref<string>('');
const selectedGridVersion = ref<string>('');

const availableSoftwareTypes = computed(() => {
    if (!presets.value) return [];
    const types = [...new Set(presets.value.map((preset: RequirementPreset) => preset.softwareTypeUid))];
    return types.sort();
});

const availableGridVersions = computed(() => {
    if (!presets.value) return [];
    let filteredPresets = presets.value;
    if (selectedSoftwareType.value) {
        filteredPresets = presets.value.filter((preset: RequirementPreset) =>
            preset.softwareTypeUid === selectedSoftwareType.value
        );
    }
    const versions = [...new Set(filteredPresets.map((preset: RequirementPreset) => preset.gridVersion))];
    return versions.sort();
});

watch(selectedSoftwareType, () => {
    selectedGridVersion.value = '';
});

const filteredPresets = computed(() => {
    if (!presets.value) return [];
    return presets.value.filter((preset: RequirementPreset) => {
        const matchesSoftwareType = !selectedSoftwareType.value || preset.softwareTypeUid === selectedSoftwareType.value;
        const matchesGridVersion = !selectedGridVersion.value || preset.gridVersion === selectedGridVersion.value;
        return matchesSoftwareType && matchesGridVersion;
    });
});

const clearFilters = () => {
    selectedSoftwareType.value = '';
    selectedGridVersion.value = '';
};

// Reload presets on mount to catch newly created presets
onMounted(() => {
    refresh();
});
</script>

<style scoped>
.filters {
    display: flex;
    gap: 1rem;
    align-items: end;
    margin-bottom: 2rem;
    padding: 1rem;
    background: var(--background-color-alt);
    border-radius: 0.4em;
    border: 1px solid var(--border-color-light);
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.filter-group label {
    font-weight: 500;
    margin-bottom: 0;
}

.filter-group label::after {
    content: ":";
    display: inline;
}

.filter-select {
    padding: 0.5em;
    border: 1px solid var(--border-color);
    border-radius: 0.4em;
    background: var(--background-color);
    font-family: inherit;
    min-width: 180px;
}

.filter-select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.clear-filters-btn {
    margin: 0.5em 0;
    padding: 0.25em 0.5em;
    border-radius: 0.4em;
    border: 1px solid var(--danger-color);
    background: var(--danger-color);
    color: white;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5em;
    font-family: inherit;
    white-space: nowrap;
}

nav {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1.5rem;
}

.button-primary {
    background: var(--primary-color);
    color: white;
    border: none;
}

.button-primary:hover {
    background: var(--primary-color-hover);
}
</style>