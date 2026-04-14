<template>
  <div>
    <NuxtLink :to="`/software-types/${route.params.type}`" class="button">
      <Icon name="uil:arrow-left" :title="$t('evaluation_detail.back')" />{{ $t('evaluation_detail.back_to_type', {
        type:
          evaluation?.software.type.name ?? route.params.type
      }) }}
    </NuxtLink>
    <LoadingHandler :status="status" :error="error" :refresh="refresh" />
    <div class="form-container" v-if="status === 'success' && evaluation">
      <h1 class="ribbon-evaluate">{{$t('evaluation_detail.title', {
        name: evaluation.software.name, version:
          evaluation.softwareVersion.version, authors: evaluation.authors && Array.isArray(evaluation.authors) ?
            evaluation.authors.map(a => a.name).join(", ") : ''
      })}}
      </h1>
      <button v-if="canEdit" class="link" @click.stop="deleteEvaluation(evaluation)">
        <Icon name="uil:trash-alt" /> {{ $t('evaluation_detail.delete') }}
      </button>
      <EvaluationForm :evaluation="evaluation" :validationError="validationError" :canEdit="canEdit"
        @submit="updateEvaluation" />
    </div>
  </div>
</template>


<script lang="ts" setup>
import type { Evaluation } from '~~/types/evaluation';
import EvaluationForm from '~/components/evaluations/EvaluationForm.vue';
const { t } = useI18n();
const route = useRoute();
const { data: evaluation, status, refresh, error } = useFetch<Evaluation>(`/api/software-types/${route.params.type}/softwares/${route.params.softwareUid}/versions/${route.params.version}/evaluations/${route.params.gridVersion}/${route.params.evaluation}`);
const validationError = ref('');
const { loggedIn, user, session } = useUserSession()
const isAdmin = computed(() => (session.value?.user?.roles || []).includes('admin'))
const isOwner = computed(() => {
  const me = (user.value?.email || '').toLowerCase()
  const authors = Array.isArray(evaluation.value?.authors) ? evaluation.value.authors : []
  return authors.some(a => (a.email || '').toLowerCase() === me)

})

const canEdit = computed(() => loggedIn.value && (isOwner.value || isAdmin.value))

const draftKey = computed(() => `evaluation-edit-${route.params.evaluation}`)
const draft = useDraft<Evaluation>(draftKey.value)

watch(evaluation, val => {
  if (val?.evaluationUid) draft.save(val)
}, { deep: true })

async function updateEvaluation() {
  if (!canEdit.value)
    return alert(t('evaluation_detail.owner_or_admin_required'))
  try {
    const res = await $fetch<Evaluation>(`/api/software-types/${route.params.type}/softwares/${route.params.softwareUid}/versions/${route.params.version}/evaluations/${route.params.gridVersion}/${route.params.evaluation}`, {
      method: 'PUT',
      body: evaluation.value
    });
    draft.clear()
    navigateTo(`/software-types/${route.params.type}/softwares/${route.params.softwareUid}/versions/${route.params.version}/evaluations/${route.params.gridVersion}/${res.evaluationUid}`);
  } catch (error) {
    console.error(t('evaluation_detail.error_updating'), error);
  }

}

async function deleteEvaluation(evaluation: Evaluation) {
  if (!canEdit.value)
    return alert(t('evaluation_detail.owner_or_admin_required'))
  const router = useRouter();

  if (!evaluation) return;

  if (confirm(t('evaluation_detail.delete_confirm'))) {
    try {
      await $fetch(`/api/software-types/${route.params.type}/softwares/${route.params.softwareUid}/versions/${route.params.version}/evaluations/${evaluation.grid.gridVersion}/${evaluation.evaluationUid}`, {
        //@ts-ignore: https://github.com/nuxt/nuxt/issues/19077#issuecomment-2887519760
        method: 'DELETE',
      });
      router.push(`/software-types/${route.params.type}/softwares/${route.params.softwareUid}`);
    } catch (error) {
      console.error(t('evaluation_detail.error_deleting'), error);
      alert(t('evaluation_detail.error_deleting'));
    }
  }
}

</script>

<style scoped>
/* Add your styles here */
</style>