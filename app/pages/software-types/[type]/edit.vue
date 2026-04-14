<template>
    <div class="form-container">
        <h1 class="ribbon-define">{{$t('software_type_edit.title_edit_type',{name: initialName})}}</h1>
        <LoadingHandler :status="status" :error="error" :refresh="refresh" />
        <SoftwareTypeForm v-if="status === 'success' && softwareType" v-model="softwareType"
            @submit="updateSoftwareType" />
    </div>
</template>

<script setup lang="ts">
import SoftwareTypeForm from '~/components/software-types/SoftwareTypeForm.vue';
import LoadingHandler from '~/components/LoadingHandler.vue';
import type { SoftwareType } from '~~/types/software';

const { t } = useI18n();
const route = useRoute();
const { data: softwareType, status, refresh, error } = useFetch<SoftwareType>(`/api/software-types/${route.params.type}`);
const initialName = computed(() => softwareType.value?.name)

async function updateSoftwareType() {
    try {
        const res = await $fetch(`/api/software-types/${route.params.type}`, {
            method: 'PUT',
            body: softwareType.value
        });
        navigateTo(`/software-types/${res.uid}`);
    } catch (error) {
        console.error(t('software_type_edit.error_updating'), error);
    }

}
</script>

<style scoped>
.form-container {
    background-color: var(--background-color-alt);
    border: 1px solid var(--border-color);
    padding: 2em;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    margin: 2em auto;
}
</style>