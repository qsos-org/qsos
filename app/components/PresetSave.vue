<template>
    <div v-if="show" class="dialog-overlay" @click="$emit('close')">
        <div class="dialog preset-save-dialog" @click.stop>
            <div class="dialog-header">
                <h3>{{ $t(dialogTitle) }}</h3>
            </div>

            <div class="dialog-content">
                <p v-if="mode === 'update' && isLabelChanged">
                    {{ $t('preset_save.changed_name') }}
                </p>
                <p v-else-if="mode === 'update'">
                    {{ $t('preset_save.update_existing') }}
                </p>

                <div class="form-group">
                    <label for="presetName">{{ $t('preset_save.preset_name') }}</label>
                    <input id="presetName" :value="label"
                        @input="$emit('update:label', ($event.target as HTMLInputElement).value)" type="text"
                        :placeholder="$t('preset_save.enter_name')" required />
                    <div v-if="mode === 'new' && labelExists" class="error-message">
                        {{ $t('preset_save.name_exists') }}
                    </div>
                </div>

                <div class="form-group">
                    <label for="presetDescription">{{ $t('preset_save.description') }}</label>
                    <textarea id="presetDescription" :value="description"
                        @input="$emit('update:description', ($event.target as HTMLTextAreaElement).value)"
                        :placeholder="$t('preset_save.enter_description')" rows="3"></textarea>
                </div>

                <div class="dialog-actions">
                    <button @click="$emit('close')" class="button-secondary">{{ $t('preset_save.cancel') }}</button>

                    <button @click="handleSave" :disabled="!canSave" class="button" :class="{ disabled: !canSave }">
                        {{ $t(actionLabel) }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { RequirementPreset } from '~~/types/requirements';

const { t } = useI18n();

const props = defineProps<{
    show: boolean;
    mode: 'new' | 'update';
    label: string;
    description: string;
    existingPresets: RequirementPreset[];
    originalLabel?: string;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'save'): void;
    (e: 'saveAsNew'): void;
    (e: 'update:label', value: string): void;
    (e: 'update:description', value: string): void;
}>();

const newLabel = computed(() => props.label.trim());
const originalLabel = computed(() => props.originalLabel?.trim() ?? '');

const isLabelChanged = computed(() => newLabel.value !== originalLabel.value);

const labelExists = computed(() =>
    props.existingPresets.some(
        (preset) =>
            preset.label.toLowerCase() === newLabel.value.toLowerCase() &&
            preset.label !== props.originalLabel
    )
);

const canSave = computed(() => {
    if (!newLabel.value) return false;
    if (labelExists.value && isLabelChanged.value) return false;
    return true;
});

const dialogTitle = computed(() =>
    props.mode === 'update' && isLabelChanged.value
        ? 'preset_save.save_as_new_preset'
        : props.mode === 'update'
            ? 'preset_save.update_preset'
            : 'preset_save.save_new_preset'
);

const actionLabel = dialogTitle;

function handleSave() {
    if (!canSave.value) return;

    if (props.mode === 'update' && isLabelChanged.value) {
        emit('saveAsNew');
    } else if (props.mode === 'update') {
        const confirmed = confirm(t('preset_save.confirm_update'));
        if (!confirmed) return;
        emit('save');
    } else {
        emit('save');
    }
}
</script>

<style scoped>
.preset-save-dialog {
    width: 500px;
    max-width: 90vw;
}
</style>