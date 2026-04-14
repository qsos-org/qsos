<template>
    <div class="form-container">
        <h1 class="ribbon-define">{{$t('software_version_edit.edit_title', {name: version?.version })}}</h1>
        <LoadingHandler :status="status" :error="error" :refresh="refresh" />
        <SoftwareVersionForm v-if="status === 'success' && version" v-model="version" @submit="updateVersion" />
    </div>
</template>

<script lang="ts" setup>
import type { SoftwareVersion } from '~~/types/software';
import SoftwareVersionForm from '~/components/softwares/SoftwareVersionForm.vue';

const { t } = useI18n();
const route = useRoute();
const type = route.params.type?.toString() ?? '';
const softwareUid = route.params.softwareUid?.toString() ?? '';
const versionStr = route.params.version?.toString() ?? '';

const { data: version, status, error, refresh } = useFetch<SoftwareVersion>(`/api/software-types/${type}/softwares/${softwareUid}/versions/${versionStr}`);

async function updateVersion() {
    try {
        if (!version?.value) return;
        const res = await $fetch<SoftwareVersion>(`/api/software-types/${type}/softwares/${softwareUid}/versions/${versionStr}`, {
            method: 'PUT',
            body: JSON.stringify(version.value),
        });
        navigateTo(`/software-types/${type}/softwares/${softwareUid}`);
    } catch (error) {
        console.error(t('software_version_edit.error_updating'), error);
    }
};
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