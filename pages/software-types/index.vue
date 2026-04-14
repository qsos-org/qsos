<template>
  <div>
    <nav>
      <NuxtLink :to="`/`" class="button">
        <Icon name="uil:arrow-left" title="Back" />Back to homepage
      </NuxtLink>
    </nav>
    <h1 v-if="intent === 'evaluate'" class="ribbon-evaluate">What type of software do you want to evaluate ?</h1>
    <h1 v-else-if="intent === 'compare'" class="ribbon-select">What type of software do you want to compare ?</h1>
    <h1 v-else-if="intent === 'grids'" class="ribbon-evaluate">What type of software do you want to consult or create a
      grid for?</h1>
    <h1 v-else class="ribbon-define">Types of Software</h1>
    <LoadingHandler :status="status" :error="error" :refresh="refresh" />
    <p v-if="!softwareTypes?.length">No Software Types have been defined yet.</p>
    <p v-if="!softwareTypes?.length && !isAuthenticated"><NuxtLink to="/auth">Login</NuxtLink> to add one.</p>
    <div class="card-container" v-if="status === 'success' && softwareTypes">
      <SoftwareTypeCard v-for="type in softwareTypes" :key="type.uid" :type="type" link />
      <div class="card link action" @click="navigateTo('/software-types/new')" v-if="isAuthenticated">
        <Icon name="uil:plus" /> Add a new type of Software
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SoftwareType } from '~/types/software';
import SoftwareTypeCard from '~/components/software-types/SoftwareTypeCard.vue';

const route = useRoute();
const intent = ref<string>(route.query.intent?.toString() ?? '');
watch(() => route.query?.intent?.toString(), (newIntent) => { intent.value = newIntent?.toString() ?? ''; });

const { loggedIn: isAuthenticated } = useUserSession();
const { data: softwareTypes, status, error, refresh } = useFetch<SoftwareType[]>('/api/software-types');
</script>

<style scoped></style>
