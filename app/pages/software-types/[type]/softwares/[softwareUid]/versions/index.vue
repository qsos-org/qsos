<template>
    <div>
        <nav>
            <NuxtLink :to="`/software-types/${type}/softwares/${softwareUid}`" class="button">
                <Icon name="uil:arrow-left" :title="$t('software_versions.back')" />{{ $t('software_versions.back_to_software', {name: software?.name ?? softwareUid })}}
            </NuxtLink>
        </nav>
        <LoadingHandler :status="status" :error="error" :refresh="refresh" />
        <template v-if="status === 'success' && software">
            <h2>{{$t('software_versions.title', {name: software?.name })}}</h2>
            <p v-if="!software.versions?.length">{{$t('software_versions.no_versions')}}</p>
            <template v-else>
                <table>
                    <thead>
                        <tr>
                            <th>{{$t('software_versions.versions')}}</th>
                            <th>{{$t('software_versions.summary')}}</th>
                            <th>{{$t('software_versions.date_added')}}</th>
                            <th v-if="canEdit">{{$t('software_versions.actions')}}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="version in software.versions" :key="version.version">
                            <td>{{ version.version }}</td>
                            <td>{{ version.summary }}</td>
                            <td>{{ new Date(version.dateAdded).toLocaleString() }}</td>
                            <td v-if="canEdit" class="actions">
                                <button class="link"
                                    @click="navigateTo(`/software-types/${software.type.uid}/softwares/${software.uid}/versions/${version.version}`)" :disabled="isDisabled(version)">
                                    <Icon name="uil:edit" /> {{$t('software_versions.edit')}}
                                </button>
                                <button class="link" @click="deleteVersion(version)" :disabled="isDisabled(version)">
                                    <Icon name="uil:trash-alt" /> {{$t('software_versions.delete')}}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </template>
            <div class="actions">
                <button class="link"
                    @click="navigateTo(`/software-types/${software.type.uid}/softwares/${software.uid}/versions/new`)">
                    <Icon name="uil:plus" /> {{$t('software_versions.add_version')}}
                </button>
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup>
import type { Software, SoftwareVersion } from '~~/types/software';

const {t} = useI18n();
const route = useRoute();
const type = route.params.type?.toString() ?? '';
const softwareUid = route.params.softwareUid?.toString() ?? '';

const { data: software, status, error, refresh } = await useFetch<Software>(`/api/software-types/${type}/softwares/${softwareUid}`);

const { loggedIn, user, session } = useUserSession();
const isAdmin = computed(() => (session.value?.user?.roles || []).includes('admin'));
const meEmail = computed(() => (user.value?.email || '').toLowerCase());

const canEdit = computed(() => {
  if (!loggedIn.value) return false;
  if (isAdmin.value) return true;
  const versions = software.value?.versions || [];
  return versions.some(v => (v.creatorEmail || '').toLowerCase() === meEmail.value);
});

const isDisabled = computed(() => (version: SoftwareVersion) => {
  return !isAdmin.value && (version.creatorEmail || '').toLowerCase() !== meEmail.value;
});


async function deleteVersion(version: SoftwareVersion) {
    if (!software.value) return;
    if (confirm(t('software_versions.delete_confirm'))) {
        await $fetch(`/api/software-types/${type}/softwares/${softwareUid}/versions/${version.version}`, {
            method: 'DELETE',
        });
        refresh();
    }
};
</script>

<style scoped>
table {
    margin-bottom: 0.5em;
}

td {
    text-align: center;
}

.actions {
    display: flex;
    gap: 0.5em;
}
</style>