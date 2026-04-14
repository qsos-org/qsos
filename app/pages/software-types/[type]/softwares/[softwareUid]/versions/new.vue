<template>
    <div class="form-container">
        <div v-if="!isAuthenticated" class="info-message" role="status" aria-live="polite">
            <Icon name="uil:info-circle" />
            {{ $t('software_version_new.login_required') }}
        </div>
        <div v-if="isAuthenticated">
            <h1 class="ribbon-define">{{ $t('software_version_new.add_new_version_software', { uid: softwareUid }) }}</h1>
            <SoftwareVersionForm v-model="newVersion" @submit="addVersion" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { SoftwareVersion } from '~~/types/software';
import SoftwareVersionForm from '~/components/softwares/SoftwareVersionForm.vue';

const { t } = useI18n();
const route = useRoute();
const { loggedIn: isAuthenticated } = useUserSession();
const type = route.params.type?.toString() ?? '';
const softwareUid = route.params.softwareUid?.toString() ?? '';

const newVersion = ref<SoftwareVersion>({
    version: '',
    summary: '',
    dateAdded: new Date().toISOString()
})

async function addVersion() {
    try {
        if (!newVersion.value.version) return;
        const res = await $fetch<SoftwareVersion>(`/api/software-types/${type}/softwares/${softwareUid}/versions`, {
            method: 'POST',
            body: JSON.stringify(newVersion.value),
        });
        navigateTo(`/software-types/${type}/softwares/${softwareUid}`);
    } catch (error) {
        console.error(t('software_version_new.error_adding'), error);
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