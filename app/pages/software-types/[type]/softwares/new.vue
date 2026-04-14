<template>
  <div>
    <nav>
      <NuxtLink :to="`/software-types/${route.params.type}`" class="button">
        <Icon name="uil:arrow-left" :title="$t('software.edit.back')" />
        {{
          $t('software_new.back_to_type', {
            type: softwareTypeName
          })
        }}
      </NuxtLink>
    </nav>
    <div class="form-container">
      <div v-if="!isAuthenticated" class="info-message" role="status" aria-live="polite">
        <Icon name="uil:info-circle" />
        {{ $t('software_new.login_required') }}
      </div>
      <div v-if="isAuthenticated">
        <h1 class="ribbon-define">{{ $t('software_new.add_new_software') }}</h1>
        <SoftwareForm v-model="newSoftware" @submit="createSoftware" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Software, SoftwareType } from '~~/types/software';
import SoftwareForm from '~/components/softwares/SoftwareForm.vue';

const { t } = useI18n();
const route = useRoute()
const type = route.params.type?.toString() ?? '';
const { loggedIn: isAuthenticated } = useUserSession();
const newSoftware = ref<Software>({
  uid: '',
  type: {
    name: '',
    uid: type,
    description: ''
  },
  name: '',
  description: '',
  licenseId: '',
  url: '',
  demoUrl: '',
  versions: []
})

const { data: softwareType, status, error, refresh } = useFetch<SoftwareType>(`/api/software-types/${route.params.type}`);
const softwareTypeName = computed(() => softwareType.value ? softwareType.value.name : route.params.type)

const createSoftware = async () => {
  try {
    const res = await $fetch<Software>(`/api/software-types/${type}/softwares`, {
      method: 'POST',
      body: newSoftware.value
    });
    navigateTo(`/software-types/${type}/softwares/${res.uid}`);
  } catch (error) {
    console.error(t('software_new.error_creating'), error);
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