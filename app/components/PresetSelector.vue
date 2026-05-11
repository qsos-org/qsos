<template>
    <div class="preset-container">
        <label for="preset-select">{{ $t('preset_selector.preset') }}</label>
        <select id="preset-select" v-model="internalSelectedPreset">
            <option disabled value="">{{ $t('preset_selector.please_select') }}</option>
            <option value="default">{{ $t('preset_selector.default') }}</option>
            <option v-for="preset in presets" :key="preset.presetUid" :value="preset.presetUid">
                {{ preset.label }}{{ preset.description ? ` (${preset.description})` : '' }}
            </option>
        </select>
    </div>
</template>

<script setup lang="ts">
import type { RequirementPreset } from '~~/types/requirements';
const { t } = useI18n();
import { getEmailUser } from '~/services/user';

const props = defineProps<{
    user: any;
    softwareTypeUid: string;
    gridVersion: string;
    modelValue: string;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'loadPresetWeights', weights: any): void;
}>();

const internalSelectedPreset = ref(props.modelValue);
const presets = ref<RequirementPreset[]>([]);

watch(() => props.modelValue, value => {
    internalSelectedPreset.value = value;
});

watch(internalSelectedPreset, (newVal) => {
    emit('update:modelValue', newVal);
    const preset = presets.value.find(p => p.presetUid === newVal);
    if (preset?.criteriaWeights) {
        emit('loadPresetWeights', JSON.parse(JSON.stringify(preset.criteriaWeights)));
    } else if (newVal === 'default') {
        emit('loadPresetWeights', null);
    }
});

onMounted(async () => {
    const userUid = getEmailUser(props.user);
    if (!userUid) return;
    try {
        const res = await $fetch(`/api/users/${userUid}/requirements-presets?softwareTypeUid=${props.softwareTypeUid}&gridVersion=${props.gridVersion}`);
        presets.value = res
        if (props.modelValue && props.modelValue !== '' && props.modelValue !== 'default') {
            const existing = presets.value.find((p: RequirementPreset) => p.presetUid === props.modelValue);
            if (existing?.criteriaWeights) {
                emit('loadPresetWeights', JSON.parse(JSON.stringify(existing.criteriaWeights)));
            }
        } else if (presets.value.length > 0 && props.modelValue === '') {
            const first = presets.value[0]!.presetUid;
            emit('update:modelValue', first);
            emit('loadPresetWeights', JSON.parse(JSON.stringify(presets.value[0]!.criteriaWeights)));
        } else if (presets.value.length === 0 && props.modelValue === '') {
            emit('update:modelValue', 'default');
        }
    } catch (e) {
        console.error(t('preset_detail.error_loading'), e);
    }
});
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
</style>