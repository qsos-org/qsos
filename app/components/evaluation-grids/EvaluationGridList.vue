<template>
    <div class="evaluation-grid-list">
        <LoadingHandler :status="status" :error="error" :refresh="refresh" />
        <template v-if="status === 'success'">
            <p v-if="!evaluationGrids?.length">{{$t('evaluation_grid_list.no_grids')}} </p>
            <template v-else>
                <div>
                    <SwitchInput v-model="isTableView" @change="toggleViewMode" :label="$t('evaluation_grid_list.show_as_table')" />
                </div>
                <EvaluationGridTable v-if="isTableView" :evaluationGrids="evaluationGrids" :type="type" />
                <div class="card-container" v-else>
                    <EvaluationGridCard v-for="grid in evaluationGrids" :key="grid.gridVersion" :evaluationGrid="grid"
                        :type="type" link />
                </div>
            </template>
            <div class="actions" v-if="isAuthenticated">
                <button class="link" @click="navigateTo(`/software-types/${type.uid}/grids/new`)">
                    <Icon name="uil:plus" /> {{$t('evaluation_grid_list.add_new_grid')}}
                </button>
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup>
import type { EvaluationGrid } from '~~/types/evaluation';
import type { SoftwareType } from '~~/types/software';
import EvaluationGridCard from '~/components/evaluation-grids/EvaluationGridCard.vue';
import SwitchInput from '~/components/forms/SwitchInput.vue';
import EvaluationGridTable from '~/components/evaluation-grids/EvaluationGridTable.vue';

const { type } = defineProps<{ type: SoftwareType }>();
const { loggedIn: isAuthenticated } = useUserSession();

const { data: evaluationGrids, status, error, refresh } = useFetch<EvaluationGrid[]>('/api/software-types/' + type.uid + '/grids');

type ViewMode = "table" | "card";
const viewMode = ref<ViewMode>('card');
const isTableView = computed(() => viewMode.value === 'table');
function toggleViewMode() {
    viewMode.value = viewMode.value === 'table' ? 'card' : 'table';
}
</script>

<style scoped>
.evaluation-grid-list {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
}
</style>