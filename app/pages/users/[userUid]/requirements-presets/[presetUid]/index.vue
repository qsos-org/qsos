<template>
    <div class="preset-view">
        <nav class="top-nav">
            <div class="nav-left">
                <NuxtLink :to="`/users/${userUid}/requirements-presets`" class="button back-btn">
                    <Icon name="uil:arrow-left" /> {{$t('preset_detail.back')}}
                </NuxtLink>
            </div>
            <div class="nav-right" v-if="preset">
                <NuxtLink :to="`/software-types/${preset.softwareTypeUid}?intent=compare&preset=${presetUid}`" class="button button-primary">
                    <Icon name="uil:comparison" /> {{ $t('preset_detail.comparison_view') }}
                </NuxtLink>
            </div>
        </nav>

        <section v-if="preset" class="preset-container">
            <header>
                <h1 class="preset-title">{{ preset.label }}</h1>
            </header>

            <ul class="preset-info">
                <li><strong>{{ $t('preset_detail.software_type') }}</strong> {{ preset.softwareTypeUid }}</li>
                <li><strong>{{ $t('preset_detail.grid_version') }}</strong> v{{ preset.gridVersion }}</li>
                <li><strong>{{ $t('preset_detail.created') }}</strong> {{ formatDate(preset.createdAt) }}</li>
                <li><strong>{{ $t('preset_detail.modified') }}</strong> {{ formatDate(preset.updatedAt) }}</li>
                <li v-if="preset.description"><strong>{{ $t('preset_detail.description') }}</strong> {{ preset.description }}</li>
            </ul>

            <div class="actions">
                <NuxtLink :to="`/users/${userUid}/requirements-presets/${presetUid}/edit`" class="button button-secondary">
                    <Icon name="uil:edit" /> {{ $t('preset_detail.edit') }}
                </NuxtLink>
                <button @click="deletePreset" class="button button-danger">
                    <Icon name="uil:trash" /> {{ $t('preset_detail.delete') }}
                </button>
            </div>
        </section>

        <div v-else class="not-found">
            <p>{{ $t('preset_detail.not_found') }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { RequirementPreset } from '~~/types/requirements';
import { getEmailUser } from '~/services/user';

const route = useRoute();
const { user } = useUserSession();

const loggedInUserUid = getEmailUser(user.value);

const { t } = useI18n();
const userUid = route.params.userUid?.toString() ?? '';
const presetUid = route.params.presetUid?.toString() ?? '';

if (!userUid || !presetUid) {
    throw createError({ statusCode: 404, statusMessage: t('preset_detail.not_found') });
}

if (!loggedInUserUid) {
    await navigateTo('/login');
}

const { data: preset } = await useFetch<RequirementPreset>(`/api/users/${userUid}/requirements-presets/${presetUid}`);

const deletePreset = async () => {
    if (!preset.value) return;
    if (!confirm(t('preset_detail.delete_confirm', {label: preset.value.label}))) return;
    try {
        await $fetch(`/api/users/${userUid}/requirements-presets/${presetUid}`, {
            method: 'DELETE',
        });
        await navigateTo(`/users/${userUid}/requirements-presets`);
    } catch (error) {
        console.error(t('preset_detail.error_deleting'), error);
        alert(t('preset_detail.error_deleting'));
    }
};

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString();
}
</script>

<style scoped>
.preset-view {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
}

.top-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    gap: 1rem;
}

.nav-left,
.nav-right {
    display: flex;
    gap: 0.5rem;
}

.nav-right .button-primary {
    font-weight: 600;
}

.back-btn {
    margin-bottom: 0;
}

.preset-container {
    background: var(--background-color-alt);
    border: 1px solid var(--border-color-light);
    border-radius: 8px;
    padding: 2rem;
}

.preset-title {
    font-size: 1.75rem;
    margin-bottom: 0.25rem;
}

.preset-subtext {
    color: var(--text-color-secondary);
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
}

.preset-info {
    list-style: none;
    padding: 0;
    margin: 0 0 1.5rem 0;
}

.preset-info li {
    margin-bottom: 0.5rem;
    font-size: 1rem;
}

.button {
    background-color: var(--background-color-button);
    color: var(--foreground-color);
    border: 1px solid var(--border-color);
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    transition: all 0.2s;
}

.button:hover {
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}

.button-danger {
    background-color: var(--danger-color);
    color: white;
    border: none;
    font-weight: 600;
}

.button-danger:hover {
    background-color: #a0313b;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
}

.button-secondary {
    background-color: var(--background-color-alt);
    color: var(--foreground-color);
    border: 1px solid var(--border-color-light);
    font-weight: 500;
}

.button-secondary:hover {
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}

.not-found {
    text-align: center;
    color: var(--text-color-secondary);
    padding: 2rem;
}
</style>