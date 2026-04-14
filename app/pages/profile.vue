<template>
  <div v-if="loggedIn" class="profile-container">
    <header>
      <h1 class="ribbon-define">{{ $t('profile.title') }}</h1>
      <div class="user-info">
        <h2 class="email"> {{ user.email }}</h2>
        <span v-if="isAdmin" class="badge-admin" :title="$t('profile.admin_access')">
          <Icon name="uil:shield-check" />
          {{ $t('profile.admin') }}
        </span>
        <p v-if="session.loggedInAt" class="login-time">
          {{ $t('profile.logged_in_since') }} {{ new Date(session.loggedInAt).toLocaleString() }}
        </p>
      </div>
    </header>

    <div class="profile-sections">
      <section v-if="isAdmin" class="profile-section admin-note">
        <h3>{{ $t('profile.admin') }}</h3>
        <p>{{ $t('profile.admin_desc') }}</p>
      </section>
      <section class="profile-section">
        <h3>{{ $t('profile.my_presets') }}</h3>
        <p>{{ $t('profile.my_presets_desc') }}</p>
        <NuxtLink :to="`/users/${userUid}/requirements-presets?intent=manage`" class="button button-primary">
          {{ $t('profile.manage_presets') }}
        </NuxtLink>
      </section>
    </div>
    <div class="logout-section">
      <!-- <p>Logged in since {{ session.loggedInAt }}</p> -->
      <button @click="clear">
        {{ $t('profile.logout') }}
      </button>
    </div>
  </div>
  <div v-else class="login-prompt">
    <h1>{{ $t('profile.please_login') }}</h1>
    <NuxtLink to="/auth/" class="button button-primary">
      {{ $t('profile.login') }}
    </NuxtLink>
  </div>
</template>

<script setup>
const { loggedIn, user, session, clear } = useUserSession()
import { getEmailUser} from '~/services/user';

const userUid = getEmailUser(user.value);
const isAdmin = computed(() => user.value?.roles?.includes('admin'));
</script>

<style>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  margin-bottom: 2rem;
}

.user-info {
  background: var(--background-color-alt);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-top: 1rem;
}

.user-info h2 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.email {
  color: var(--text-color-muted);
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
}

.login-time {
  color: var(--text-color-muted);
  font-size: 0.9rem;
  margin: 0;
}

.badge-admin {
  background: var(--brand-define);
  color: var(--foreground-color-contrast);
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin: 0 0 0.5rem 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: "Noto Sans", sans-serif;
}

.badge-admin .iconify {
  font-size: 0.9rem;
}

.admin-note {
  border-left: 4px solid var(--brand-define);
  background: linear-gradient(90deg, rgba(202, 27, 27, 0.1), transparent);
}

.admin-note h3 {
  color: #f39c12;
}

.profile-sections {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}


.profile-section {
  background: var(--background-color-alt);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.profile-section h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.profile-section p {
  color: var(--text-color-muted);
  margin: 0 0 1rem 0;
}


.logout-section {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.login-prompt {
  text-align: center;
  padding: 3rem;
  max-width: 400px;
  margin: 0 auto;
}

.login-prompt h1 {
  margin-bottom: 1.5rem;
  color: var(--text-color);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>