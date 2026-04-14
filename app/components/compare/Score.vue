<template>
    <span class="score" :style="{ color: getColor(score) }">{{ score === null ? '-' : score.toFixed(2) }}</span>
</template>

<script lang="ts" setup>
const { score } = defineProps<{ score: number | null }>();

function getColor(score: number | null): string {
    if (score === null) return "black";
    return `hsl(${(score * 40)}, 100%, 40%)`;
}
</script>

<style scoped>
.score {
    text-shadow: 0 1px 0px rgba(0, 0, 0, 0.2);
}
</style>