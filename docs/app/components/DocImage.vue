<template>
  <figure class="doc-figure">
    <div class="doc-image-container" :style="{ maxWidth: maxWidth }">
      <img :src="src" :alt="alt" :style="{ maxWidth: maxWidth }" />
    </div>
    <figcaption v-if="caption">{{ caption }}</figcaption>
  </figure>
</template>

<script setup>
defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    default: null
  },
  maxWidth: {
    type: String,
    default: '350px'
  }
})
</script>

<style scoped>
.doc-figure {
  text-align: center;
  margin: 1.5em auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.doc-image-container {
  width: 100%;
  aspect-ratio: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.doc-image-container img {
  width: 100%;
  height: auto;
  object-fit: contain;
}

figcaption {
  font-size: 0.85em;
  color: #64748b;
  margin-top: 0.5em;
}
</style>
