<template>
  <SortableTable :columns="columns" :rows="softwares" :rowKey="row => row.uid">
    <template #name="{ row }">
      <NuxtLink :to="`/software-types/${row.type.uid}/softwares/${row.uid}`">
        {{ row.name }}
      </NuxtLink>
    </template>

    <template #score="{ row }">
      <span v-if="row.score !== null && row.score !== undefined">
        <Score :score="row.score" />
      </span>
      <span v-else>—</span>
    </template>

    <template #url="{ row }"><a :href="row.url" target="_blank">{{ row.url }}</a></template>
    <template #demoUrl="{ row }"><a :href="row.demoUrl" target="_blank">{{ row.demoUrl }}</a></template>
    <template #selected="{ row }" v-if="intent === 'compare'">
      <input type="checkbox" :checked="selected.includes(row)" @change="() => emit('select', row)" />
    </template>
  </SortableTable>
</template>

<script lang="ts" setup>
import type { Software } from '~~/types/software';
import SortableTable from '~/components/SortableTable.vue';
import Score from '~/components/compare/Score.vue';
import {useI18n} from 'vue-i18n'

const {t} = useI18n();
const { softwares, selected, intent } = defineProps<{
  softwares: (Software & { score?: number | null })[];
  selected: Software[];
  intent?: string;
}>();

const emit = defineEmits<{
  (e: 'select', payload: Software): void;
}>();

const columns = computed(() => [
  ...(intent === 'compare' ? [{ key: 'selected', label: '', sortable: false }] : []),
  { key: 'name', label: t('software_table.name'), sortable: true },
  { key: 'score', label: t('software_table.score') , sortable: true },
  { key: 'description', label: t('software_table.description'), sortable: true },
  { key: 'licenseId', label: t('software_table.license'), sortable: true },
  { key: 'url', label: t('software_table.url'), sortable: false },
  { key: 'demoUrl', label: t('software_table.demo_url'), sortable: false },
]);
</script>

<style scoped>
tr.selected {
  background-color: color-mix(in srgb, var(--success-color), white 90%);
}
</style>