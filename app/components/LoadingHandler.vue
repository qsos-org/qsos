<template>
    <p v-if="status === 'pending'">{{ $t('loading.pending') }}</p>
    <template v-else-if="status === 'error'">
        <p class="error">{{ error }}</p>
        <button @click="ev => refresh()">{{ $t('loading.retry') }}</button>
    </template>
</template>

<script setup lang="ts">
import type { FetchError } from 'ofetch';
const { status, error, refresh } = defineProps<{ status: string, error: FetchError<any> | undefined | null, refresh: () => void }>();
</script>