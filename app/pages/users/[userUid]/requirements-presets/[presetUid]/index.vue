<template>
    <div class="preset-view">
        <nav>
            <NuxtLink :to="`/users/${userUid}/requirements-presets`" class="button back-btn">
                <Icon name="uil:arrow-left" /> {{$t('preset_detail.back')}}
            </NuxtLink>
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

            <div class="preset-message">
                <Icon name="uil:info-circle" />
                {{ $t('preset_detail.modify_hint') }} <NuxtLink
                    :to="`/software-types/${preset.softwareTypeUid}?intent=compare`">{{ $t('preset_detail.comparison_view') }}</NuxtLink>
            </div>

            <button @click="deletePreset" class="button button-danger">
                <Icon name="uil:trash" /> {{ $t('preset_detail.delete') }}
            </button>
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

.back-btn {
    margin-bottom: 1rem;
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

.preset-message {
    margin-bottom: 1.5rem;
    padding: 1rem;
    border-left: 4px solid var(--primary-color);
    background-color: var(--background-color-light);
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.preset-message a {
    font-weight: 500;
    text-decoration: underline;
}

.button-danger {
    background-color: var(--danger-color);
    color: white;
    border: none;
    padding: 0.5em 1em;
    border-radius: 6px;
    font-size: 0.95rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5em;
}

.button-danger:hover {
    background-color: var(--danger-color-hover);
}

.not-found {
    text-align: center;
    color: var(--text-color-secondary);
    padding: 2rem;
}
</style>