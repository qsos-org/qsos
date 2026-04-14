<template>
  <div class="card" :class="{ link, selected, selectable: intent === 'compare' }" @click="link && onClick()">
    <div class="software-card-score">
      <img :src="software.icon ?? DEFAULT_SOFTWARE_ICON" alt="Icon" width="48" height="48" />
      <div v-if="score !== null && score !== undefined" style="margin-top: 0.25em;">
        <Score :score="score" />
      </div>
    </div>
    <div class="info">
      <h2>{{ software.name }}</h2>
      <p>{{ truncateText(software.description, 300) }}</p>
      <Icon name="uil:check" v-if="intent === 'compare' && selected" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Software } from '~~/types/software';
import DEFAULT_SOFTWARE_ICON from '~/assets/images/default_software_icon.svg';
import Score from '~/components/compare/Score.vue';
import { truncateText } from '~/utils/string';

const { software, link = false, selected = false, score, intent } = defineProps<{ software: Software, link?: boolean, selected?: boolean, score?: number | null, intent?: string }>();
const emit = defineEmits<{
  (e: 'select', payload: Software): void;
}>();

function onClick() {
  if (intent === 'compare') {
    emit('select', software);
  } else if (intent === 'evaluate') {
    navigateTo({ path: `/software-types/${software.type.uid}/softwares/${software.uid}/versions/latest/evaluations/new` });
  } else {
    navigateTo({ path: `/software-types/${software.type.uid}/softwares/${software.uid}`, query: { intent: intent } });
  }
}
</script>
<style scoped>
.card {
  display: grid;
  grid-template-columns: 48px 1fr;
  align-items: center;
  gap: 2px 8px;
  position: relative;
  min-width: 0;
}

.card.selectable {
  grid-template-columns: 48px 1fr 24px;
}

.card.selected {
  border-color: var(--success-color);
  background-color: color-mix(in srgb, var(--success-color), white 90%);
}

.software-card-score {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info {
  min-width: 0;
  overflow: hidden;
}

h2 {
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

p {
  grid-column: 1/3;
  word-wrap: break-word;
  overflow-wrap: break-word;
  margin: 0.25em 0;
}

.i-uil\:check {
  position: absolute;
  right: 8px;
  top: 8px;
  color: var(--success-color);
  font-size: 1.5em;
}

.actions {
  display: flex;
  gap: 0.5em;
}
</style>