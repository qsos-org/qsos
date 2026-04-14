<template>
    <form @submit.prevent="emit('submit')">
        <div v-if="!canEdit" class="info-message" role="status" aria-live="polite">
            <Icon name="uil:info-circle" />
            {{ !loggedIn ? $t('software_form.disabled_not_logged_in') : $t('software_form.disabled_not_owner') }}
        </div>
        <div>
            <label for="type">{{$t('software_form.type')}}</label>
            <template v-if="showTypeAsText && software.type && software.type.uid">
                <span>{{ software.type.name }}</span>
            </template>
            <template v-else>
                <select v-model="software.type.uid" :disabled="!canEdit">
                    <option v-for="type in softwareTypes" :key="type.uid" :value="type.uid">{{ type.name }}</option>
                </select>
                <i v-if="canEdit" style="margin-left:1em; font-size: 80%;">
                    {{$t('software_form.not_finding_type')}}
                    <NuxtLink to="/software-types/new">{{$t('software_form.create_new_type')}}</NuxtLink>
                </i>
            </template>
        </div>
        <div>
            <label for="name">{{$t('software_form.name')}} <i v-if="software.uid">({{$t('software_form.ref')}} {{ software.uid }})</i></label>
            <input type="text" id="name" v-model="software.name" required :disabled="!canEdit" />
        </div>
        <div>
            <label for="description">{{$t('software_form.description')}}</label>
            <textarea id="description" v-model="software.description" required :disabled="!canEdit"></textarea>
        </div>
        <LicenseSelect v-model="software.licenseId" :disabled="!canEdit" />
        <div>
            <label for="url">{{$t('software_form.url')}}</label>
            <input type="url" id="url" v-model="software.url" required :disabled="!canEdit" />
        </div>
        <div>
            <label for="demoUrl">{{$t('software_form.demo_url')}}</label>
            <input type="url" id="demoUrl" v-model="software.demoUrl" :disabled="!canEdit" />
        </div>
        <div>
            <label for="icon">{{$t('software_form.icon')}}</label>
            <ImageUpload id="icon" v-model="software.icon" :preview-height="48" :preview-width="48"
                :disabled="!canEdit" />
        </div>
        <div v-if="!hideSubmit">
            <p>{{$t('software_form.author_email')}} {{ software.creatorEmail || user?.email }}</p>
        </div>

        <div class="form-actions" v-if="!hideSubmit">
            <button type="submit" v-if="canEdit">
                <Icon name="uil:save" /> {{$t('software_form.save_changes')}}
            </button>
            <button class="button danger" @click.stop.prevent="deleteSoftware(software)"
                v-if="route.params.softwareUid && canEdit">
                <Icon name="uil:trash-alt" /> {{$t('software_form.delete_software')}}
            </button>
        </div>
    </form>
</template>

<script setup lang="ts">
import LicenseSelect from '~/components/LicenseSelect.vue';
import ImageUpload from '../forms/ImageUpload.vue';
import { getRefFromName } from '~/services/utils';
import type { Software, SoftwareType } from '~~/types/software';
import { useI18n } from 'vue-i18n';
const emit = defineEmits(['submit']);
const { hideSubmit = false, showTypeAsText = false } = defineProps<{ hideSubmit?: boolean, showTypeAsText?: boolean }>();

const { loggedIn, user, session } = useUserSession();
const { data: softwareTypes } = useFetch<SoftwareType[]>('/api/software-types');

const router = useRouter();
const route = useRoute();

const { t } = useI18n();
const software = defineModel<Software>({
    default: {
        uid: '',
        type: {
            name: '',
            uid: '',
            description: ''
        },
        name: '',
        description: '',
        licenseId: '',
        url: '',
        demoUrl: ''
    }
});

const isAdmin = computed(() => (session.value?.user?.roles || []).includes('admin'));
const isExisting = computed(() => !!software.value?.uid);
const isOwner = computed(() => {
    const me = (user.value?.email || '').toLowerCase();
    const owner = (software.value?.creatorEmail || (software.value as any)?.author?.email || '').toLowerCase();
    return !!me && !!owner && me === owner;
});

const canEdit = computed(() => {
    if (!isExisting.value) return loggedIn.value;
    return loggedIn.value && (isOwner.value || isAdmin.value);
});

watch(() => software.value.name, () => {
    software.value.uid = getRefFromName(software.value.name);
});

async function deleteSoftware(software: Software) {
    if (!software) return;
    const confirmed = confirm(
        t('software_form.delete_confirm', {name: software.name})
    )
    if(!confirmed) return 
    await $fetch(`/api/software-types/${software.type.uid}/softwares/${software.uid}`,
    {method: 'DELETE'}
    )
    router.push(`/software-types/${route.params.type}`);
}
</script>

<style scoped>
.form-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5em;
}
</style>