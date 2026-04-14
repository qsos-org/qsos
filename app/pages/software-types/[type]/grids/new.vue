<template>
    <div>
        <nav>
            <NuxtLink :to="`/software-types/${route.params.type}`" class="button">
                <Icon name="uil:arrow-left" :title="$t('grid_new.back')" />{{ $t('grid_new.back_to_type', {
                    type: softwareTypeName
                }) }}
            </NuxtLink>
        </nav>
        <div class="form-container">
            <div v-if="!isAuthenticated" class="info-message" role="status" aria-live="polite">
                <Icon name="uil:info-circle" />
                {{ $t('grid_new.login_required') }}
            </div>
            <div v-if="isAuthenticated">
                <h1 class="ribbon-evaluate">{{ $t('grid_new.add_grid_title') }}</h1>
                <LoadingHandler :status="status" :error="error" :refresh="refresh" />
                <EvaluationGridForm v-if="status === 'success'" v-model="newEvaluationGrid"
                    @submit="createEvaluationGrid" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { EvaluationGrid } from '~~/types/evaluation';
import EvaluationGridForm from '~/components/evaluation-grids/EvaluationGridForm.vue';
import type { SoftwareType } from '~~/types/software';
import { QSOS_VERSIONS } from '~/services/qsos-versions/qsos-versions';

const { t } = useI18n();
const route = useRoute();
const { data: softwareType, status, error, refresh } = useFetch<SoftwareType>(`/api/software-types/${route.params.type}`);
const { user } = useUserSession();
const { loggedIn: isAuthenticated } = useUserSession();

const latestQsosVersion = Object.keys(QSOS_VERSIONS).sort((a, b) => b.localeCompare(a))[0] ?? '2.0';

const softwareTypeName = computed(() => softwareType.value ? softwareType.value.name : route.params.type)

const newEvaluationGrid = ref<EvaluationGrid>({
    softwareType: {
        name: '',
        uid: '',
        description: ''
    },
    createdAt: '',
    creatorEmail: '',
    updatedAt: '',
    gridVersion: '1.0',
    qsosVersion: latestQsosVersion,
    sections: [],
    changeLog: '',
});

watch(softwareType, () => {
    if (softwareType.value) {
        newEvaluationGrid.value.softwareType = softwareType.value;
    }
}, { immediate: true });

const draftKey = computed(() => `grid-new-${route.params.type}`)
const draft = useDraft<EvaluationGrid>(draftKey.value)

watch(newEvaluationGrid, (val) => {
  if (val?.sections?.length) draft.save(val)
}, { deep: true })


onMounted(async () => {
  const saved = draft.load()
  if (saved) {
    newEvaluationGrid.value = saved
    return
  }

  if (!user.value) {
    navigateTo('/auth');
  } else {
    newEvaluationGrid.value.creatorEmail = user.value!.email;
    try {
      const response = await $fetch(`/api/software-types/${route.params.type}/grids/initial?version=${newEvaluationGrid.value.qsosVersion}`);
      newEvaluationGrid.value.sections = [response.maturitySection];
    } catch (error) {
      console.error(t('grid_new.error_fetching_initial'), error);
    }
  }
});

watch(() => newEvaluationGrid.value.qsosVersion, async (newVersion) => {
    if (newVersion) {
        try {
            const response = await $fetch(`/api/software-types/${route.params.type}/grids/initial?version=${newVersion}`);
            newEvaluationGrid.value.sections = [response.maturitySection];
        } catch (error) {
            console.error(t('grid_new.error_updating_qsos_version'), error);
        }
    }
});


const createEvaluationGrid = async () => {
    try {
        const res = await $fetch<EvaluationGrid>(`/api/software-types/${newEvaluationGrid.value.softwareType.uid}/grids`, {
            method: 'POST',
            body: newEvaluationGrid.value
        });

        draft.clear()
        navigateTo(`/software-types/${newEvaluationGrid.value.softwareType.uid}/grids/${res.gridVersion}`);
    } catch (error) {
        console.error(t('grid_new.error_creating'), error);
        alert(t('grid_new.error_creating'));
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
    width: 1280px;
    margin: auto;
}
</style>