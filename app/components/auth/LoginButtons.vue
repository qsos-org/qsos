<template>
  <nav>
    <button @click="loginWithGitHub">
      <Icon size="1.5em" name="uil:github" title="GitHub" />
      {{ $t('auth.signin_github') }}
    </button>
    <button @click="loginWithGitLab">
      <Icon size="1.5em" name="uil:gitlab" title="Gitlab" />
      {{ $t('auth.signin_gitlab') }}
    </button>
  </nav>
</template>

<script setup>


const loginWithGitHub = () => {
  window.location.href = '/auth/github';
};

const loginWithGitLab = () => {
  window.location.href = '/auth/gitlab';
};
</script>

<style scoped>
nav {
  display: flex;
  gap: 1em;
  justify-content: center;
  margin-top: 2em;
}
</style>