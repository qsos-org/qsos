<template>
    <details v-if="childrenField in node.data" :open="isOpen">
        <summary @click="toggleOpenAndSelect"
            :class="{ 'missing-score': isMissingScore, 'has-child-with-missing-score': hasChildWithMissingScore }">
            <span :contenteditable="contenteditable" @dblclick="contenteditable = true" @blur="contenteditable = false"
                @keydown.enter.prevent="contenteditable = false; node.data[nameField] = ($event.target as HTMLElement).textContent">{{
                    $t(node.data[nameField])
                }}</span>
            <div class="actions">
                <slot name="node-actions" v-bind="node"></slot>
            </div>
        </summary>
        <ul>
            <draggable v-model="node.data[childrenField]" item-key="ref" :group="group" :move="onMove">
                <template #item="{ element: childNode, index }">
                    <li>
                        <FileTreeNode :node="{ path: [...node.path, childrenField, index], data: childNode }"
                            :name-field :children-field :selected :missing-score-refs :is-readonly="isReadonly"
                            @click.stop="emit('select', [...node.path, childrenField, index])"
                            @select="emit('select', $event)">
                            <template v-slot:node-actions="slotProps">
                                <slot name="node-actions" v-bind="slotProps"></slot>
                            </template>
                            <template v-slot:file-actions="slotProps">
                                <slot name="file-actions" v-bind="slotProps"></slot>
                            </template>
                        </FileTreeNode>
                    </li>
                </template>
            </draggable>
            <slot name="subtree-actions" v-bind="node"></slot>
        </ul>
    </details>
    <span v-else
        :class="{ file: true, selected: node.path.join('.') === selected?.path.join('.'), 'missing-score': isMissingScore }">
        <span :contenteditable @dblclick="contenteditable = true" @blur="contenteditable = false"
            @keydown.enter.prevent="contenteditable = false"
            @input.stop="node.data[nameField] = ($event.target as HTMLElement).textContent">{{
                $t(node.data[nameField])
            }}</span>
        <div class="actions">
            <slot name="file-actions" v-bind="node"></slot>
        </div>
    </span>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable';
type TreeNode = { path: Path, data: { [key: string]: any } };
const { node, selected, nameField = "name", childrenField = "nodes", missingScoreRefs, isReadonly } = defineProps<{
    node: TreeNode,
    selected?: TreeNode | null,
    nameField?: string,
    childrenField?: string,
    missingScoreRefs?: string[],
    isReadonly?: (path: Path) => boolean
}>();

const slots = defineSlots<{
    "node-actions": (props: TreeNode) => any,
    "file-actions": (props: TreeNode) => any,
    "subtree-actions": (props: TreeNode) => any
}>();

const emit = defineEmits(["select"])
const contenteditable = ref(false);

const locked = computed(() => !!isReadonly?.(node.path))

function onMove() {
    if (locked.value) return false
    return true
}

const group = computed(() => {
    if (locked.value) return { name: 'tree', pull: false, put: false }
    return { name: 'tree', pull: true, put: true }
})

const isOpen = ref(false);
function toggleOpenAndSelect(event: Event) {
    event.preventDefault();
    isOpen.value = !isOpen.value;
    emit('select', node.path);
}

const isMissingScore = computed(() => {
    return missingScoreRefs?.includes(node.data.ref) ?? false;
});

const hasChildWithMissingScore = computed(() => {
    if (!missingScoreRefs?.length) return false;
    const children = node.data[childrenField];
    if (!Array.isArray(children)) return false;

    const hasMissing = (items: any[]): boolean =>
        items.some(item =>
            missingScoreRefs.includes(item.ref) ||
            (Array.isArray(item[childrenField]) && hasMissing(item[childrenField]))
        );

    return hasMissing(children);
});
</script>

<style scoped>
summary,
span {
    display: inline-flex;
    align-items: center;
}

summary::before {
    content: '📁';
    vertical-align: baseline;
}

details {
    list-style: none;
}

details[open]>summary::before {
    content: '📂';
}

summary,
li {
    list-style: none;
    cursor: pointer;
}

ul {
    margin: 0;
    padding-left: 1em;
}

span.file::before {
    content: '📄';
    vertical-align: baseline;
}

.selected {
    font-weight: bold;
}

.missing-score {
    color: #c62828;
    font-weight: bold;
}

.has-child-with-missing-score {
    color: #d32f2f;
    font-weight: bold;
}

.missing-score::before {
    filter: hue-rotate(320deg) saturate(2);
}

.actions {
    display: inline-flex;
    align-content: center;
    opacity: 0;
    transition: opacity linear 200ms;
    gap: 5px;
    margin-left: 5px;
}

details[open]>summary .actions,
span:hover .actions {
    opacity: 1;
    visibility: visible;
}
</style>