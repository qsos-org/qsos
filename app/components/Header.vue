<template>
  <header>
    <nav>
      <NuxtLink to="/" id="#qsos-logo" class="logo">
        <img id="qsos-logo" src="@/assets/images/logo-qsos-white.png" alt="Logo QSOS" />
        <!-- <span>QSOS</span> -->
      </NuxtLink>
      <ul>
        <li>
          <NuxtLink to="/software-types/">
            <Icon name="uil:book-alt" /> {{ $t('header.types_of_software') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/software-types?intent=evaluate">
            <Icon name="uil:pen" /> {{ $t('header.evaluate_software') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/software-types?intent=compare">
            <Icon name="uil:comparison" /> {{ $t('header.compare_softwares') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/import-legacy">
            <Icon name="uil:import" /> {{ $t('header.import_legacy') }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
    <div class="header-right">
      <LanguageSwitcher />
      <div v-if="loggedIn">
        <NuxtLink to="/profile">
          <Icon name="uil:user-circle" /> {{ user.email }}
        </NuxtLink>
      </div>
      <div v-else>
        <NuxtLink to="/auth/">
          <Icon name="uil:user" /> {{ $t('header.login') }}
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup>
import LanguageSwitcher from './LanguageSwitcher.vue';
const { loggedIn, user } = useUserSession();
</script>

<style scoped>
header {
  background-color: var(--background-color-contrast, #333);
  color: var(--foreground-color-contrast, #fff);
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  height: 40px;
  margin-right: 10px;
}

header nav {
  display: flex;
  flex-grow: 1;
  justify-content: flex-start;
  align-items: center;
}

header ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

header li {
  margin: 0 25px;
}

header a {
  color: var(--foreground-color-contrast, white);
  text-decoration: none;
  padding: 5px;
  white-space: nowrap;
}

header a:hover {
  text-decoration: underline;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}
</style>