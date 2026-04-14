<template>
    <div>
        <nav>
            <NuxtLink :to="`/software-types/${route.params.type}`" class="button">
                <Icon name="uil:arrow-left" :title="$t('grid_edit.back')" />
                {{ $t('grid_edit.back_to_type', { type: softwareTypeName }) }}
            </NuxtLink>
        </nav>
        <div class="form-container">
            <LoadingHandler :status="status" :error="error" :refresh="refresh" />
            <template v-if="grid">
                <h1 class="ribbon-evaluate">
                    {{
                        $t('grid_edit.title', {
                            version: grid?.gridVersion,
                            type: grid.softwareType?.name ?? route.params.type
                        })
                    }}
                </h1>
                <EvaluationGridForm v-model="grid" @submit="updateEvaluationGrid" :initialVersion="grid.gridVersion" />
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
import EvaluationGridForm from '~/components/evaluation-grids/EvaluationGridForm.vue';
import type { EvaluationGrid } from '~~/types/evaluation';

const { t } = useI18n();
const route = useRoute();

const { data: grid, status, error, refresh } = useFetch<EvaluationGrid>(`/api/software-types/${route.params.type}/grids/${route.params.gridVersion}`)

const draftKey = computed(() => `grid-edit-${route.params.type}-${route.params.gridVersion}`)
const draft = useDraft<EvaluationGrid>(draftKey.value)

watch(grid, val => {
    if (val) draft.save(val)
}, { deep: true })

const softwareTypeName = computed(() => grid.value ? grid.value.softwareType.name : route.params.type)

const updateEvaluationGrid = async (updatedGrid: EvaluationGrid & { initialVersion: string }) => {
    if (!grid.value) return console.error(t('grid_edit.error_not_loaded'));
    try {
        if (updatedGrid.gridVersion !== updatedGrid.initialVersion) {
            grid.value.createdAt = new Date().toISOString();
            grid.value.updatedAt = new Date().toISOString();
            await $fetch(`/api/software-types/${grid.value.softwareType.uid}/grids`, {
                method: 'POST',
                body: grid.value
            });
        } else {
            grid.value.updatedAt = new Date().toISOString();
            await $fetch(`/api/software-types/${grid.value.softwareType.uid}/grids/${grid.value.gridVersion}`, {
                //@ts-ignore: https://github.com/nuxt/nuxt/issues/19077#issuecomment-2887519760
                method: 'PUT',
                body: grid.value
            });
        }
        draft.clear()
        navigateTo(`/software-types/${grid.value.softwareType.uid}/grids`);
    } catch (error) {
        console.error(t('grid_edit.error_creating'), error);
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

h1 {
    display: flex;
    align-items: center;
    gap: 0.5em;
}
</style>