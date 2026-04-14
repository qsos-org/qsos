<template>
    <div>
        <nav>
            <NuxtLink :to="`/`" class="button">
                <Icon name="uil:arrow-left" :title="$t('licenses.back')" />{{ $t('licenses.back_homepage') }}
            </NuxtLink>
        </nav>
        <h1 class="ribbon-define">{{ $t('licenses.title') }}</h1>
        <p v-if="loading">{{ $t('licenses.loading') }}</p>
        <p v-else-if="licenses.length === 0">{{ $t('licenses.no_data') }}</p>
        <table v-else>
            <thead>
                <tr>
                    <th>{{ $t('licenses.ref') }}</th>
                    <th>{{ $t('licenses.license_id') }}</th>
                    <th>{{ $t('licenses.name') }}</th>
                    <th>{{ $t('licenses.osi_approved') }}</th>
                    <th>{{ $t('licenses.see_also') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="license in licenses" :key="license.licenseId">
                    <td><a :href="license.reference" target="_blank">{{ license.referenceNumber }}</a></td>
                    <td>{{ license.licenseId }}</td>
                    <td>{{ license.name }}</td>
                    <td class="centered">{{ license.isOsiApproved ? $t('licenses.yes') : $t('licenses.no') }}</td>
                    <td><a v-for="link in license.seeAlso" target="_blank" :key="link" :href="link">{{ link }}</a></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import type { LicenseInfo, LicenseExceptionInfo } from '~~/types/license'
const licenses = ref<LicenseInfo[]>([])
const loading = ref(true)

onMounted(async () => {
    loading.value = true
    try {
        const response = await $fetch<{ licenses: LicenseInfo[], exceptions: LicenseExceptionInfo[] }>('/api/licenses')
        licenses.value = response.licenses
    } catch {
        licenses.value = []
    } finally {
        loading.value = false
    }
})
</script>

<style scoped>
table td:last-child a {
    display: block;
    font-size: small;
    word-break: break-word;
}
</style>