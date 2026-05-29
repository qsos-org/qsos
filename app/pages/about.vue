<template>
  <div>
    <nav>
      <NuxtLink :to="`/`" class="button">
        <Icon name="uil:arrow-left" :title="$t('about.back')" />{{ $t('about.back_homepage') }}
      </NuxtLink>
    </nav>
    <h1>{{ $t('about.title') }}</h1>
    <p>{{ $t('about.tool_description') }}</p>
    <p>
      <a :href="docsUrl + '/en/methodology/qsos-manifesto'" target="_blank">
        {{ $t('about.read_manifesto') }}
      </a>
    </p>
    <p>
      <a :href="docsUrl + '/en/methodology/introduction'" target="_blank">
        {{ $t('about.read_docs') }}
      </a>
    </p>
  </div>
</template>
<script>
export default {
  name: 'AboutPage',
  data() {
    return {
      docsUrl: 'http://localhost:3000/docs'
    }
  }
}
</script>