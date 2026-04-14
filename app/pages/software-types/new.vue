<template>
  <div>
    <nav>
      <NuxtLink :to="`/software-types`" class="button">
        <Icon name="uil:arrow-left" :title="$t('software_types_new.back')" />{{
          $t('software_types_new.back_software_types') }}
      </NuxtLink>
    </nav>
    <div class="form-container">
      <div v-if="!isAuthenticated" class="info-message" role="status" aria-live="polite">
        <Icon name="uil:info-circle" />
        {{ $t('software_types_new.login_required') }}
      </div>
      <div v-if="isAuthenticated">
        <h1 class="ribbon-define">{{ $t('software_types_new.add_new_software_type') }}</h1>
        <SoftwareTypeForm v-model="newSoftwareType" @submit="createSoftwareType" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { SoftwareType } from '~~/types/software';
import SoftwareTypeForm from '~/components/software-types/SoftwareTypeForm.vue';

const { t } = useI18n();
const { loggedIn: isAuthenticated } = useUserSession();
const { user } = useUserSession();
const newSoftwareType = ref<SoftwareType>({
  uid: '',
  name: '',
  description: '',
  icon: '',
  creatorEmail: '',
  createdAt: '',
  updatedAt: '',
});

onMounted(() => {
  if (!user.value) {
    navigateTo('/auth');
  } else {
    newSoftwareType.value.creatorEmail = user.value!.email;
  }
});

const createSoftwareType = async () => {
  try {
    const res = await $fetch<SoftwareType>('/api/software-types', {
      method: 'POST',
      body: newSoftwareType.value
    });
    navigateTo(`/software-types/${res.uid}`);
  } catch (error) {
    console.error(t('software_types_new.error_creating'), error);
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
  max-width: 400px;
  margin: 2em auto;
}
</style>