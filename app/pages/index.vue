<template>
  <div>
    <h1 style="display: flex; align-items: center; justify-content: center; gap: .5em;">
      <img src="@/assets/images/icon-qsos.png" alt="QSOS" height="40" />
      <span>
        {{ $t('home.title') }}
      </span>
    </h1>
    <p>{{ $t('home.subtitle') }}</p>
    <div class="hero">
      <aside>
        <h2>{{ $t('home.make_choice') }}</h2>
        <p>{{ $t('home.make_choice_desc') }}</p>
      </aside>
      <MenuProcess />
      <aside>
        <h2>{{ $t('home.pool_effort') }}</h2>
        <p>{{ $t('home.pool_effort_desc') }}</p>
      </aside>
    </div>
  </div>
</template>

<script setup>
import MenuProcess from '@/components/MenuProcess.vue'
</script>

<style scoped>
div {
  text-align: center;
}

p {
  max-width: 800px;
  margin: 0 auto;
}

.hero {
  display: flex;
  gap: 1em;
  margin-top: 1em;
  justify-content: center;
}

aside {
  background-color: var(--background-color-alt);
  padding: 1rem;
}

aside {
  --c: 4em;
  padding: var(--c) 0.5em;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

aside:first-child {
  clip-path: polygon(0 var(--c), var(--c) 0, 100% 0, 100% 100%, var(--c) 100%,
      0 calc(100% - var(--c)), 0 0);
}

aside:last-child {
  clip-path: polygon(0 0, calc(100% - var(--c)) 0, 100% var(--c), 100% calc(100% - var(--c)), calc(100% - var(--c)) 100%, 0 100%);
}
</style>