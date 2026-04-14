<template>
  <NuxtRouteAnnouncer />
  <Header />
  <main id="page">
    <NuxtPage />
  </main>
  <Footer />
</template>

<style>
#page {
  padding: 0 2em calc(0.5em + 48px) 2em;
  /* 48px = footer height */
  max-width: 100%;
  overflow: auto;
}

.page-leave-active {
  transition: opacity 150ms;
}

.page-enter-active {
  transition: all 300ms;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.page-leave-to {
  opacity: 0;
}
</style>
