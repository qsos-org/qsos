<template>
    <div>
        <NuxtLink :to="`/software-types/${route.params.type}`" class="button">
            <Icon name="uil:arrow-left" :title="$t('software_edit.back')" /> {{$t('software_edit.back_to_type', {type: software?.type.name ?? route.params.type})}}
        </NuxtLink>
        <div class="form-container">
            <h1 class="ribbon-define">{{ $t('software_edit.edit_title', {name : initialName}) }}</h1>
            <LoadingHandler :status="status" :error="error" :refresh="refresh" />
            <SoftwareForm v-if="status === 'success' && software" v-model="software" @submit="updateSoftware" />
        </div>
    </div>
</template>

<script setup lang="ts">
import SoftwareForm from '~/components/softwares/SoftwareForm.vue';
import LoadingHandler from '~/components/LoadingHandler.vue';
import type { Software } from '~~/types/software';

const { t } = useI18n();
const route = useRoute();
const { data: software, status, refresh, error } = useFetch<Software>(`/api/software-types/${route.params.type}/softwares/${route.params.softwareUid}`);
const initialName = computed(() => software.value?.name)

async function updateSoftware() {
    try {
        const res = await $fetch(`/api/software-types/${route.params.type}/softwares/${route.params.softwareUid}`, {
            method: 'PUT',
            body: software.value
        });
        navigateTo(`/software-types/${route.params.type}/softwares/${res.uid}`);
    } catch (error) {
        console.error(t('software_edit.error_updating'), error);
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
    max-width: 480px;
    margin: 2em auto;
}
</style>