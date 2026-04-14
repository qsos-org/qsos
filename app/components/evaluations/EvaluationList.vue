<template>
  <div>
    <p v-if="!evaluations.length && isAuthenticated">{{ $t('evaluation_list.no_evaluations') }}</p>
    <p v-else-if="!evaluations.length">{{ $t('evaluation_list.no_evaluations_login') }}</p>
    <template v-else>
      <SwitchInput v-model="isTableView" @change="toggleViewMode" :label="$t('evaluation_list.show_as_table')" />
      <div v-if="isTableView">
        <EvaluationTable :evaluations="evaluations" @select="emit('select', $event)" />
      </div>

      <div v-else class="card-container">
        <EvaluationCard v-for="evaluation in evaluations" :key="evaluation.evaluationUid" :evaluation="evaluation"
          @select="emit('select', $event)" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EvaluationListItem } from '~~/types/evaluation'
import EvaluationCard from './EvaluationCard.vue'
import EvaluationTable from './EvaluationTable.vue'
import SwitchInput from '~/components/forms/SwitchInput.vue'

const props = defineProps<{
  evaluations: EvaluationListItem[]
  softwareId: string
  softwareType: string
  currentVersion: string
  isAuthenticated?: boolean
}>()

const emit = defineEmits(['select'])

type ViewMode = 'card' | 'table'
const viewMode = ref<ViewMode>('card')
const isTableView = computed(() => viewMode.value === 'table')

function toggleViewMode() {
  viewMode.value = viewMode.value === 'table' ? 'card' : 'table'
}
</script>

<style scoped></style>
