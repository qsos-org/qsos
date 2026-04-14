<template>
    <table>
        <thead>
            <tr>
                <th v-for="col in columns" :key="col.key" @click="sort(col)"
                    :class="{ sortable: col.sortable, sorted: sortKey === col.key }">
                    {{ col.label }}
                    <span v-if="col.sortable">
                        <span v-if="sortKey === col.key && sortOrder === 'asc'">▲</span>
                        <span v-else-if="sortKey === col.key && sortOrder === 'desc'">▼</span>
                        <span v-else style="opacity:0.3">▲▼</span>
                    </span>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="row in sortedRows" :key="rowKey(row)">
                <td v-for="col in columns" :key="col.key">
                    <slot :name="col.key" :row="row">{{ row[col.key] }}</slot>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

type Column = {
    key: string
    label: string
    sortable?: boolean
}

const props = defineProps<{
    columns: Column[]
    rows: any[]
    rowKey?: (row: any) => string | number
}>()

const sortKey = ref<string>('')
const sortOrder = ref<'asc' | 'desc'>('asc')

function sort(col: Column) {
    if (!col.sortable) return
    if (sortKey.value === col.key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
        sortKey.value = col.key
        sortOrder.value = 'asc'
    }
}

const sortedRows = computed(() => {
    if (!sortKey.value) return props.rows
    return [...props.rows].sort((a, b) => {
        const aVal = a[sortKey.value]
        const bVal = b[sortKey.value]
        if (aVal === bVal) return 0
        if (sortOrder.value === 'asc') return aVal > bVal ? 1 : -1
        return aVal < bVal ? 1 : -1
    })
})

function rowKey(row: any) {
    return props.rowKey ? props.rowKey(row) : row.id || row.uid || row.key || JSON.stringify(row)
}
</script>

<style scoped>
th.sortable {
    cursor: pointer;
    user-select: none;
}

th.sorted {
    text-decoration: underline;
}
</style>
