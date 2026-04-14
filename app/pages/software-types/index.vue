<template>
  <div>
    <nav>
      <NuxtLink :to="`/`" class="button">
        <Icon name="uil:arrow-left" :title="$t('software_types_index.back')" />{{ $t('software_types_index.back_homepage') }}
      </NuxtLink>
    </nav>
    <h1 v-if="intent === 'evaluate'" class="ribbon-evaluate">{{ $t('software_types_index.what_evaluate') }}</h1>
    <h1 v-else-if="intent === 'compare'" class="ribbon-select">{{ $t('software_types_index.what_compare') }}</h1>
    <h1 v-else-if="intent === 'grids'" class="ribbon-evaluate">{{ $t('software_types_index.what_grids') }}</h1>
    <h1 v-else class="ribbon-define">{{ $t('software_types_index.software_types_title') }}</h1>
    <LoadingHandler :status="status" :error="error" :refresh="refresh" />
    <p v-if="!softwareTypes?.length">{{ $t('software_types_index.no_software_types') }}</p>
    <p v-if="!softwareTypes?.length && !isAuthenticated"><NuxtLink to="/auth">{{ $t('software_types_index.login') }}</NuxtLink> {{ $t('software_types_index.to_add_one') }}</p>
    <div class="card-container" v-if="status === 'success' && softwareTypes">
      <SoftwareTypeCard v-for="type in softwareTypes" :key="type.uid" :type="type" link />
      <div class="card link action" @click="navigateTo('/software-types/new')" v-if="isAuthenticated">
        <Icon name="uil:plus" /> {{ $t('software_types_index.add_new_software_type') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SoftwareType } from '~~/types/software';
import SoftwareTypeCard from '~/components/software-types/SoftwareTypeCard.vue';

const route = useRoute();
const intent = ref<string>(route.query.intent?.toString() ?? '');
watch(() => route.query?.intent?.toString(), (newIntent) => { intent.value = newIntent?.toString() ?? ''; });

const { loggedIn: isAuthenticated } = useUserSession();
const { data: softwareTypes, status, error, refresh } = useFetch<SoftwareType[]>('/api/software-types');
</script>

<style scoped></style>
