<template>
  <SortableTable :columns="columns" :rows="evaluationGrids" :rowKey="row => row.gridVersion">
    <template #gridVersion="{ row }">
      <NuxtLink :to="`/software-types/${row.softwareType.uid}/grids/${row.gridVersion}`">
        {{$t('evaluation_grid_table.grid_link')}} {{ row.gridVersion }}
      </NuxtLink>
    </template>
  </SortableTable>
</template>

<script lang="ts" setup>
import type { EvaluationGrid } from '~~/types/evaluation';
import SortableTable from '~/components/SortableTable.vue';
import { useI18n } from 'vue-i18n'
const { evaluationGrids } = defineProps<{ evaluationGrids: EvaluationGrid[] }>();
const { t } = useI18n()

const columns = computed(() =>[
  { key: 'gridVersion', label: t('evaluation_grid_table.grid_version'), sortable: true },
  { key: 'creatorEmail', label: t('evaluation_grid_table.author'), sortable: true },
  { key: 'createdAt', label: t('evaluation_grid_table.creation_date'), sortable: true },
  { key: 'updatedAt', label: t('evaluation_grid_table.modification_date'), sortable: true },
  { key: 'changeLog', label: t('evaluation_grid_table.changelog'), sortable: false },
]);
</script>