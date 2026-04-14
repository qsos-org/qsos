<template>
  <footer>
    <NuxtLink to="/about">
      <Icon name="uil:info-circle" />
      {{ $t('footer.about') }}
    </NuxtLink>
    <!--<a href="/docs/en/" target="_blank" rel="noopener">
      <Icon name="uil:book" /> {{ $t('footer.documentation') }}
    </a>-->
    <a>
      <Icon name="uil:github" /> {{ $t('footer.github') }}
    </a>
    <a>
      <Icon name="uil:share-alt" />
      {{ $t('footer.social') }}
    </a>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
footer {
  background-color: #333;
  color: white;
  text-align: center;
  padding: 1rem 0;
  position: fixed;
  width: 100%;
  bottom: 0;
  display: flex;
  gap: 1em;
  padding: 0.5em 1em;
}

footer a {
  color: white;
  text-decoration: none;
  padding: 0 5px;
}

footer a .iconify {
  vertical-align: text-bottom;
  height: 1.25em;
}

footer a:hover {
  text-decoration: underline;
}
</style>