<template>
    <form @submit.prevent="emit('submit')">
        <div v-if="!canEdit" class="info-message" role="status" aria-live="polite">
            <Icon name="uil:info-circle" />
            {{ !loggedIn ? $t('software_type_form.disabled_not_logged_in') : $t('software_type_form.disabled_not_owner')
            }}
        </div>
        <label for="name">{{ $t('software_type_form.name') }} <i v-if="softwareType.uid">({{
            $t('software_type_form.ref') }}
                {{ softwareType.uid }})</i></label>
        <input type="text" id="name" v-model="softwareType.name" required :disabled="!canEdit" />

        <label for="description">{{ $t('software_type_form.description') }}</label>
        <textarea id="description" v-model="softwareType.description" required :disabled="!canEdit"></textarea>

        <label for="icon">{{ $t('software_type_form.icon') }}</label>
        <ImageUpload id="icon" v-model="softwareType.icon" :preview-height="48" :preview-width="48"
            :disabled="!canEdit" />
        <label for="creator-email">{{ $t('software_type_form.author_email') }} {{ softwareType.creatorEmail ?? "unknown"
        }}</label>
        <div class="actions">
            <button type="submit" v-if="canEdit">
                <Icon name="uil:save" :title="$t('software_type_form.submit')" />
                {{ $t('software_type_form.submit') }}
            </button>
        </div>
    </form>
</template>

<script setup lang="ts">
import ImageUpload from '~/components/forms/ImageUpload.vue';
import { getRefFromName } from '~/services/utils';
import type { SoftwareType } from '~~/types/software';

const emit = defineEmits(['submit']);
//const {session} = useUserSession();
const softwareType = defineModel<SoftwareType>({ default: { uid: '', name: '', description: '' } });


const { loggedIn, user, session } = useUserSession();

const isAdmin = computed(() => (session.value?.user?.roles || []).includes('admin'));
const isExisting = computed(() => !!softwareType.value?.uid);
const isOwner = computed(() => {
    const me = (user.value?.email || '').toLowerCase();
    const owner = (softwareType.value?.creatorEmail || (softwareType.value as any)?.author?.email || '').toLowerCase();
    return !!me && !!owner && me === owner;
});


const canEdit = computed(() => {
    if (!isExisting.value) return loggedIn.value;
    return loggedIn.value && (isOwner.value || isAdmin.value);
});


watch(() => softwareType.value.name, () => {
    softwareType.value.uid = getRefFromName(softwareType.value.name);
});

</script>

<style scoped>
form .actions {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 1em;
}
</style>