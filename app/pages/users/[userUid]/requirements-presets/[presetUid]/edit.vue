<template>
    <div class="preset-edit">
        <nav class="top-nav">
            <div class="nav-left">
                <NuxtLink :to="`/users/${userUid}/requirements-presets/${presetUid}`" class="button">
                    <Icon name="uil:arrow-left" /> {{ $t('preset_edit.back') }}
                </NuxtLink>
            </div>
            <div class="nav-right" v-if="preset">
                <NuxtLink 
                    :to="`/software-types/${preset.softwareTypeUid}?intent=compare&preset=${presetUid}`" 
                    class="button"
                >
                    <Icon name="uil:comparison" /> {{ $t('preset_edit.go_to_comparison') }}
                </NuxtLink>
            </div>
        </nav>

        <h1 v-if="preset">{{ $t('preset_edit.title', { label: preset.label }) }}</h1>

        <div v-if="preset && grid" class="panel">
            <h2>{{ $t('preset_edit.configure_weights') }}</h2>
            <table class="weights-table">
                <thead>
                    <tr>
                        <th>{{ $t('compare.criteria') }}</th>
                        <th>{{ $t('compare.weight') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <CompareRow 
                        v-for="(section, index) in grid.sections" 
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

            <div class="form-group">
                <label for="label">{{ $t('preset_edit.preset_name') }}</label>
                <input v-model="label" id="label" type="text" required />
            </div>

            <div class="form-group">
                <label for="description">{{ $t('preset_edit.preset_description') }}</label>
                <textarea v-model="description" id="description" rows="3"></textarea>
            </div>

            <div class="actions">
                <button @click="goBack" class="button">
                    {{ $t('preset_edit.cancel') }}
                </button>
                <button @click="saveChanges" :disabled="!hasChanges" class="button button-primary">
                    <Icon name="uil:save" /> {{ $t('preset_edit.save_changes') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { EvaluationGrid } from '~~/types/evaluation';
import type { RequirementPreset } from '~~/types/requirements';
import { getEmailUser } from '~/services/user';
import CompareRow from '~/components/compare/CompareRow.vue';

const route = useRoute();
const { t } = useI18n();
const { user } = useUserSession();

const userUid = route.params.userUid?.toString() ?? '';
const presetUid = route.params.presetUid?.toString() ?? '';
if (!userUid || !presetUid || !getEmailUser(user.value)) {
    await navigateTo('/login');
}

const { data: preset } = await useFetch<RequirementPreset>(
    `/api/users/${userUid}/requirements-presets/${presetUid}`
);

const grid = ref<EvaluationGrid | null>(null);
const weights = ref({});
const label = ref('');
const description = ref('');
const initialLabel = ref('');
const initialDescription = ref('');
const initialWeights = ref({});

watch(preset, async (p: any) => {
    if (!p) return;
    try {
        grid.value = await $fetch(`/api/software-types/${p.softwareTypeUid}/grids/${p.gridVersion}`);
        weights.value = JSON.parse(JSON.stringify(p.criteriaWeights || {}));
        initialWeights.value = JSON.parse(JSON.stringify(p.criteriaWeights || {}));
        label.value = p.label;
        description.value = p.description || '';
        initialLabel.value = p.label;
        initialDescription.value = p.description || '';
    } catch (e) {
        console.error('Error loading grid:', e);
    }
}, { immediate: true });

const hasChanges = computed(() => 
    label.value !== initialLabel.value 
    || description.value !== initialDescription.value 
    || JSON.stringify(weights.value) !== JSON.stringify(initialWeights.value)
);

const saveChanges = async () => {
    if (!hasChanges.value || !preset.value) return;
    try {
        await $fetch(`/api/users/${userUid}/requirements-presets/${presetUid}`, {
            method: 'PUT',
            body: { label: label.value, description: description.value, criteriaWeights: weights.value }
        });
        initialLabel.value = label.value;
        initialDescription.value = description.value;
        initialWeights.value = JSON.parse(JSON.stringify(weights.value));
        alert(t('preset_edit.saved_success'));
    } catch (error) {
        console.error(t('preset_edit.error_saving'), error);
        alert(t('preset_edit.error_saving'));
    }
};

const goBack = () => navigateTo(`/users/${userUid}/requirements-presets/${presetUid}`);
const onWeightsChange = (updatedWeights: any) => {
    weights.value = updatedWeights;
};
</script>

<style scoped>
.preset-edit {
    padding: 2rem;
    max-width: 1000px;
    margin: 0 auto;
}

.top-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    gap: 1rem;
}

.nav-left,
.nav-right {
    display: flex;
    gap: 0.5rem;
}

.nav-right .button-primary {
    font-weight: 600;
}

nav { margin-bottom: 1.5rem; }

.button { 
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    background-color: var(--background-color-button);
    color: var(--foreground-color);
    font-weight: 500;
    transition: all 0.2s;
}

.button:hover:not(:disabled) {
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}

.button-primary { 
    background-color: var(--brand-qualify);
    color: var(--foreground-color-contrast);
    font-weight: 600;
    border: none;
}

.button-primary:hover:not(:disabled) {
    background-color: #52a01d;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.button:disabled { 
    opacity: 0.5; 
    cursor: not-allowed; 
}

.panel {
    background: var(--background-color-alt);
    border: 1px solid var(--border-color-light);
    border-radius: 8px;
    padding: 2rem;
    margin-top: 1.5rem;
}

h2 { margin-bottom: 1.5rem; }

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.form-group input,
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

.actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
}
</style>

