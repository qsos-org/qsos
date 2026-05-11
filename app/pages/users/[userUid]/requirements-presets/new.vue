<template>
    <div>
        <nav>
            <NuxtLink :to="`/users/${userUid}/requirements-presets`" class="button">
                <Icon name="uil:arrow-left" /> {{ $t('preset_create.back') }}
            </NuxtLink>
        </nav>

        <div class="form-container">
            <h1 class="ribbon-qualify">{{ $t('preset_create.title') }}</h1>

            <div class="form-section">
                <div class="form-group">
                    <label for="softwareType">{{ $t('preset_create.software_type') }}</label>
                    <select v-model="selectedSoftwareTypeUid" id="softwareType">
                        <option value="">{{ $t('preset_create.select_software_type') }}</option>
                        <option v-for="type in softwareTypes" :key="type.uid" :value="type.uid">
                            {{ type.name }}
                        </option>
                    </select>
                </div>
            </div>

            <template v-if="selectedSoftwareTypeUid">
                <div class="form-section">
                    <div class="form-group">
                        <label for="gridVersion">{{ $t('preset_create.grid_version') }}</label>
                        <select v-model="selectedGridVersion" id="gridVersion" :disabled="availableVersions.length === 0">
                            <option value="">{{ $t('preset_create.select_grid_version') }}</option>
                            <option v-for="version in availableVersions" :key="version" :value="version">
                                v{{ version }}
                            </option>
                        </select>
                        <p v-if="availableVersions.length === 0" class="error-message">{{ $t('preset_create.no_grids_available') }}</p>
                    </div>
                </div>
            </template>

            <div v-if="grid" class="form-section">
                <div class="table-scroll-container">
                    <table id="preset-weights-table" class="compare-table" v-if="grid">
                        <thead>
                            <tr>
                                <th>{{ $t('compare.criteria') }}</th>
                                <th>{{ $t('compare.weight') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <CompareRow 
                                v-for="(section, index) in grid?.sections" 
                                :key="section.name + '-' + index"
                                :section="section"
                                :softwares="{}"
                                :weights="weights"
                                :path="['sections', index.toString()]"
                                :print="false"
                                @change="onWeightsChange"
                            />
                        </tbody>
                    </table>
                </div>

                <div class="form-group">
                    <label for="label">{{ $t('preset_create.preset_name') }}</label>
                    <input v-model="label" id="label" type="text" required />
                </div>

                <div class="form-group">
                    <label for="description">{{ $t('preset_create.preset_description') }}</label>
                    <textarea v-model="description" id="description" rows="3"></textarea>
                </div>

                <div class="actions">
                    <button @click="goBack" class="button">
                        {{ $t('preset_create.cancel') }}
                    </button>
                    <button @click="savePreset" :disabled="!canSave" class="button button-primary">
                        <Icon name="uil:save" /> {{ $t('preset_create.save_preset') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { EvaluationGrid } from '~~/types/evaluation';
import type { SoftwareType } from '~~/types/software';
import { getEmailUser } from '~/services/user';

const route = useRoute();
const { t } = useI18n();
const { user } = useUserSession();

const userUid = route.params.userUid?.toString() ?? '';
if (!userUid || !getEmailUser(user.value)) {
    await navigateTo('/login');
}

const { data: softwareTypes } = await useFetch<SoftwareType[]>(`/api/software-types`);

const selectedSoftwareTypeUid = ref('');
const selectedGridVersion = ref('');
const grid = ref<EvaluationGrid | null>(null);
const availableVersions = ref<string[]>([]);
const weights = ref<{ [key: string]: any }>({});
const label = ref('');
const description = ref('');

watch(selectedSoftwareTypeUid, async (typeUid: string) => {
    if (!typeUid) {
        availableVersions.value = [];
        selectedGridVersion.value = '';
        grid.value = null;
        return;
    }
    try {
        // Fetch grid versions
        const grids = await $fetch<EvaluationGrid[]>(`/api/software-types/${typeUid}/grids`);
        availableVersions.value = grids
            .map(g => g.gridVersion)
            .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
    } catch (e) {
        console.error('Error loading grids:', e);
    }
});

watch(selectedGridVersion, async (version: string) => {
    grid.value = null;
    weights.value = {};
    if (selectedSoftwareTypeUid.value && version) {
        try {
            grid.value = await $fetch<EvaluationGrid>(`/api/software-types/${selectedSoftwareTypeUid.value}/grids/${version}`);
            if (grid.value) {
                weights.value = initWeights(grid.value);
            }
        } catch (err) {
            console.error('Error loading grid:', err);
        }
    }
});

const initWeights = (gridValue: EvaluationGrid) => {
    const INITIAL_WEIGHT = 100;
    const isSubsection = (section: any): boolean => "sections" in section;
    const traverse = (sections: any[], weightsNode: any[]): any[] => {
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
    return { sections: traverse(gridValue.sections, []) };
};

const canSave = computed(() => label.value.trim().length > 0 && selectedSoftwareTypeUid.value && selectedGridVersion.value);

const savePreset = async () => {
    if (!canSave.value) return;
    try {
        const presetData = {
            label: label.value.trim(),
            description: description.value.trim(),
            softwareTypeUid: selectedSoftwareTypeUid.value,
            gridVersion: selectedGridVersion.value,
            criteriaWeights: weights.value
        };
        //@ts-ignore: https://github.com/nuxt/nuxt/issues/19077#issuecomment-2887519760
        const savedPreset: any = await $fetch(`/api/users/${userUid}/requirements-presets`, {
            method: 'POST',
            body: presetData
        });
        alert(t('preset_create.saved_success'));
        // Redirect to preset detail page
        await navigateTo(`/users/${userUid}/requirements-presets/${savedPreset.presetUid}`);
    } catch (error) {
        console.error(t('preset_create.error_saving'), error);
        alert(t('preset_create.error_saving'));
    }
};

const goBack = () => navigateTo(`/users/${userUid}/requirements-presets`);
const onWeightsChange = (updatedWeights: any) => {
    weights.value = updatedWeights;
};
</script>

<style scoped>
.form-container {
    background-color: var(--background-color-alt);
    border: 1px solid var(--border-color);
    padding: 2em;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    margin: 2em auto;
}

.form-section {
    margin-bottom: 1.5rem;
}

nav { 
    margin-bottom: 1.5rem; 
}

.button { 
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
}

.button-primary { 
    background: var(--primary-color); 
    color: white; 
}

.button-secondary { 
    background: var(--background-color-lighter); 
    border: 1px solid var(--border-color-light); 
}

.button:disabled { 
    opacity: 0.5; 
    cursor: not-allowed; 
}

h2 { 
    margin-bottom: 1.5rem; 
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--border-color-light);
    border-radius: 4px;
    font-family: inherit;
}

.weights-table {
    width: 100%;
    margin-bottom: 2rem;
    border-collapse: collapse;
}

.table-scroll-container {
    width: 100%;
    overflow-x: auto;
    margin-bottom: 2rem;
    border: 1px solid var(--border-color-light);
    border-radius: 4px;
}

.compare-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
}

.compare-table th,
.compare-table td {
    border: 1px solid var(--border-color-light);
    padding: 0.75rem;
    text-align: left;
}

.compare-table th {
    background-color: var(--background-color-alt);
    font-weight: 600;
}

.compare-table tbody tr:nth-child(even) {
    background-color: rgba(0, 0, 0, 0.02);
}

.actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
}

.softwares-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.software-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.software-checkbox:hover {
    background-color: var(--background-color);
}

.software-checkbox input[type="checkbox"] {
    cursor: pointer;
}

.error-message {
    color: var(--danger-color, #dc3545);
    font-style: italic;
    margin: 0.5rem 0;
}

select:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: var(--background-color-lighter);
}

.button-primary {
    background-color: var(--brand-qualify);
    color: var(--foreground-color-contrast);
    font-weight: 600;
}

.button-primary:hover:not(:disabled) {
    background-color: #52a01d;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.button-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.button {
    background-color: var(--background-color-button);
    color: var(--foreground-color);
    border: 1px solid var(--border-color);
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
}

.button:hover {
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}
</style>
