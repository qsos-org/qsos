<template>
    <div class="file-tree-details-view">
        <div class="file-tree">
            <draggable v-model="nodeList" item-key="ref" :group="{ name: 'tree', pull: true, put: true }"
                :move="onRootMove" @change="$emit('update:modelValue', nodeList)">
                <template #item="{ element, index }">
                    <FileTreeNode :node="{ path: [index], data: element }" :selected :name-field :children-field
                        :missing-score-refs :is-readonly="isReadonly" @select="select($event)">
                        <template v-slot:node-actions="slotProps">
                            <slot name="node-actions" v-bind="slotProps"></slot>
                        </template>
                        <template v-slot:file-actions="slotProps">
                            <slot name="file-actions" v-bind="slotProps"></slot>
                        </template>
                        <template v-slot:subtree-actions="slotProps">
                            <slot name="subtree-actions" v-bind="slotProps"></slot>
                        </template>
                    </FileTreeNode>
                </template>
            </draggable>
            <slot name="tree-actions"></slot>
        </div>
        <div class="file-tree-details">
            <slot v-if="selected" name="details" :data="selected.data" :path="selected.path"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import FileTreeNode from './FileTreeNode.vue';
import draggable from 'vuedraggable';

const nodeList = defineModel<({ [key: string]: any })[]>();
const { nameField, childrenField, missingScoreRefs, isReadonly } = defineProps<{ nameField?: string, childrenField?: string, missingScoreRefs?: string[], isReadonly?: (path: Path) => boolean }>();
const selected = ref<{ path: Path; data: { [key: string]: any } } | null>(null);

const childrenKey = childrenField ?? 'nodes';

function onRootMove(evt: any): boolean {
    const dragged = evt.draggedContext?.element
    const fromIndex = evt.draggedContext?.index
    const toIndex = evt.draggedContext?.futureIndex

    const isSection = dragged && Array.isArray(dragged[childrenKey])
    if (!isSection) return false

    const isMaturitylocked = isReadonly?.(["0"]) ?? false
    if (isMaturitylocked) {
        if (fromIndex === 0) return false
        if (toIndex === 0) return false
    }
    return true
}

const select = (path: Path | null) => {
    if (path && nodeList.value) {
        selected.value = { path, data: getValueAtPath(nodeList.value, path) };
    } else {
        selected.value = null;
    }
};

const nameKey = nameField ?? 'name';

watch(() => selected.value?.data?.[nameKey], (newName) => {
    if (!selected.value || !nodeList.value) return
    const targetNode = getValueAtPath(nodeList.value, selected.value.path)
    if (targetNode && newName != null) {
        ; (targetNode as any)[nameKey] = newName
    }
});

defineExpose({ select })
</script>

<style scoped>
.file-tree-details-view {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 1em;
}

.file-tree {
    display: flex;
    flex-direction: column;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 1em;
    background-color: #f9f9f9;
    max-height: 60vh;
    overflow-y: auto;
}

.file-tree-details {
    border: 1px solid #ccc;
    padding: 1em;
    background-color: #f9f9f9;
    border-radius: 4px;
}
</style>