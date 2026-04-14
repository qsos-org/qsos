<template>
  <div>
    <nav>
      <NuxtLink :to="`/`" class="button">
        <Icon name="uil:arrow-left" :title="$t('about.back')" />{{ $t('about.back_homepage') }}
      </NuxtLink>
    </nav>
    <h1>{{ $t('about.title') }}</h1>
    <h2>{{ $t('about.need_method_subtitle') }}</h2>
    <p>{{ $t('about.need_method_paragraph1') }}</p>
    <p>
      {{ $t('about.need_method_paragraph2') }}
    </p>
    <p>
      {{ $t('about.need_method_paragraph3') }}
    </p>
    <p>{{ $t('about.p4_natural_questions') }}</p>
    <ul>
      <li>{{ $t('about.q1_natural_questions') }} </li>
      <li> {{ $t('about.q2_natural_questions') }}</li>
    </ul>
    <p>
      {{ $t('about.p5_company_questions') }}
    </p>
    <ul>
      <li>{{ $t('about.q1_company_questions') }}</li>
      <li>{{ $t('about.q2_company_questions') }}</li>
      <li>{{ $t('about.q3_company_questions') }}</li>
      <li>{{ $t('about.q4_company_questions') }}</li>
    </ul>
    <p>
      {{ $t('about.paragraph6') }}
    </p>
    <ul>
      <li>{{ $t('about.qualify_requirement') }}</li>
      <li>{{ $t('about.compare_requirement') }}</li>
    </ul>
    <p>{{ $t('about.p7_conclusion') }}</p>

    <h2>{{ $t('about.free_method_subtitle') }}</h2>
    <p>{{ $t('about.free_method_paragraph1') }}</p>
    <ul>
      <li>{{ $t('about.free_method_benefit1') }}</li>
      <li>{{ $t('about.free_method_benefit2') }}</li>
    </ul>
    <p>{{ $t('about.paragraph8') }}</p>
    <p>{{ $t('about.paragraph9') }}</p>
  </div>
</template>
<script>
export default {
  name: 'AboutPage'
}
</script>