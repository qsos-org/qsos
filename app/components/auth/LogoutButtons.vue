<template>
  <button @click="logout" class="logout-button">
    {{$t('auth.logout')}}
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useNuxtApp } from '#app';
const { t } = useI18n(); 

const router = useRouter();
const { $auth } = useNuxtApp();

const logout = async () => {
  try {
    await $auth.logout();

    router.push('/');
  } catch (error) {
    console.error(t('auth.error_logout'), error.message);
  }
};
</script>

<style scoped>
.logout-button {
  padding: 10px 15px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.logout-button:hover {
  background-color: #d32f2f;}
</style>
