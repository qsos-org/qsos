<template>
    <div>
        <nav>
            <NuxtLink :to="`/software-types/${type}`" class="button">
                <Icon name="uil:arrow-left" :title="$t('evaluation_new.back')" />
                {{ $t('evaluation_new.back_to_type', { type: software?.type.name ?? type }) }}
            </NuxtLink>
        </nav>
        <div class="form-container">
            <div v-if="!isAuthenticated" class="info-message" role="status" aria-live="polite">
                <Icon name="uil:info-circle" />
                {{ $t('evaluation_new.login_required') }}
            </div>
            <div v-if="isAuthenticated">
                <h1 class="ribbon-evaluate">New Evaluation for {{ software?.name }} version {{ softwareVersion }}{{
                    gridVersion ? `- Evaluation grid
                    v${gridVersion}` : '' }} </h1>
                <LoadingHandler :status="status" :error="error" :refresh="refresh" />
                <p v-if="loading">{{ $t('evaluation_new.loading') }}</p>
                <EvaluationForm v-if="status === 'success' && evaluation?.grid && evaluation?.softwareVersion"
                    :evaluation="evaluation" @submit="createEvaluation" :validationError="validationError"
                    :canEdit="true" />
                <p v-else-if="software?.versions.length === 0">
                    {{ $t('evaluation_new.no_versions') }}
                    <NuxtLink :to="`/software-types/${type}/softwares/${softwareUid}/versions/new`">
                        {{ $t('evaluation_new.declare_version') }}
                    </NuxtLink>
                </p>
                <p v-else-if="!gridVersion && !loading">
                    {{ $t('evaluation_new.no_grids') }}
                    <NuxtLink :to="`/software-types/${type}/grids/new`">{{ $t('evaluation_new.create_grid') }}</NuxtLink>
                </p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import EvaluationForm from '~/components/evaluations/EvaluationForm.vue';
import type { EvaluationGrid, EvaluationDraft, EvaluationSection, EvaluationCriteriaRated } from '~~/types/evaluation';
import type { Software } from '~~/types/software';
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { user } = useUserSession();
const { loggedIn: isAuthenticated } = useUserSession();
const type = route.params.type?.toString() ?? '';
const softwareUid = route.params.softwareUid?.toString() ?? '';
const softwareVersion = route.params.version?.toString() ?? ''
const gridVersion = ref<string | undefined>();
const { data: software, status, error, refresh } = useFetch<Software>(`/api/software-types/${type}/softwares/${softwareUid}`);
const evaluation = ref<EvaluationDraft>({});
const validationError = ref<string>('');
const loading = ref(false);
import log from "loglevel";

const fetchLatestEvaluationGrid = async () => {
    loading.value = true;
    const response = await fetch(`/api/software-types/${route.params.type}/grids`);
    const grids: EvaluationGrid[] = await response.json();
    if (grids && grids.length > 0) {
        const latestGrid = grids.reduce((mostRecent, grid) => {
            return new Date(grid.createdAt) > new Date(mostRecent.createdAt) ? grid : mostRecent;
        });
        Object.assign(evaluation.value, { grid: latestGrid, sections: [] })
        if (gridVersion.value === undefined) gridVersion.value = latestGrid.gridVersion;
    }
    loading.value = false;
};

onMounted((): void => {
    const draftKey = `evaluation-new-${type}-${softwareUid}-${softwareVersion}`
    const draft = useDraft<EvaluationDraft>(draftKey)

    const saved = draft.load()
    if (saved) {
        evaluation.value = saved
        if (evaluation.value.grid) gridVersion.value = evaluation.value.grid.gridVersion
    } else {
        fetchLatestEvaluationGrid();
        if (user.value) {
            evaluation.value.authors = [{ email: user.value.email, name: user.value.name ?? '' }];
        }
    }

    watch(evaluation, (val: EvaluationDraft): void => {
        if (val?.sections || val?.language || (val?.authors?.length ?? 0) > 0) draft.save(val)
    }, { deep: true })
});

const setSoftwareVersion = (version: string) => {
    if (software.value && version) {
        const softwareVersion = software.value.versions.find(v => v.version === version);
        if (softwareVersion) {
            evaluation.value.softwareVersion = {
                version: softwareVersion.version,
                dateAdded: softwareVersion.dateAdded ?? new Date().toISOString(),
                summary: softwareVersion.summary ?? ''
            };
        }
    }
};

watch(software, () => {
    if (software.value) {
        evaluation.value.software = software.value;
        if (softwareVersion === "latest") {
            const lastVersion = software.value.versions.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())[0];
            if (lastVersion) {
                router.replace(`/software-types/${type}/softwares/${softwareUid}/versions/${lastVersion.version}/evaluations/new`);
            }
        } else {
            setSoftwareVersion(softwareVersion);
        }
    }
}, { immediate: true });

watch(() => route.params.version, (newVersion) => {
    if (newVersion) setSoftwareVersion(newVersion?.toString());
}, { immediate: true });


const createEvaluation = async () => {
    let isValid = true;
    const requiredAuthorsFilled = (evaluation.value.authors ?? []).filter((author) => !author.email || !author.name).length === 0;
    const languageSelected = Boolean(evaluation.value.language);
    const versionSelected = Boolean(softwareVersion);
    const validateSections = (gridSections: EvaluationSection[], sectionRatings: any) => {
        if (!gridSections || gridSections.length === 0) return true;
        let localIsValid = true;

        const validateCriteria = (criteriaRated: EvaluationCriteriaRated, criteriaName: string) => {
            const hasScore = criteriaRated?.score !== undefined;
            const hasJustification = criteriaRated?.comment && criteriaRated.comment.trim() !== '';
            if (!hasScore) {
                localIsValid = false;
                log.warn(t('evaluation_new.criteria_no_score', { name: criteriaName }));
            }
            if (!hasJustification) {
                log.info(t('evaluation_new.criteria_no_justification', { name: criteriaName }));
            }
        };
        const validateSection = (section: EvaluationSection, ratings: any) => {
            if (!section.name && !section.description) {
                localIsValid = false;
                log.warn(t('evaluation_new.section_invalid', { name: section.name }));
            }
            if (section.sections && Array.isArray(section.sections)) {
                section.sections.forEach((subSection, index) => {
                    validateSection(subSection as EvaluationSection, ratings?.[index]?.sections);
                    if ('desc0' in subSection) {
                        const criteriaRated = ratings?.[index];
                        if (criteriaRated) {
                            validateCriteria(criteriaRated, subSection.name);
                        } else {
                            console.error(t('evaluation_new.no_rated_criteria', { name: subSection.name }));
                            localIsValid = false;
                        }
                    }
                });
            }
        };

        gridSections.forEach((section, index) => {
            validateSection(section, sectionRatings?.[index]?.sections);
        });

        return localIsValid;
    };
    const sectionsValid = validateSections(evaluation.value.grid?.sections ?? [], evaluation.value.sections);
    if (!requiredAuthorsFilled || !versionSelected || !sectionsValid) {
        isValid = false;
    }
    if (!isValid) {
        validationError.value = t('evaluation_new.validation_error');
        return;
    }
    validationError.value = '';
    try {
        log.trace('Sending evaluation:', evaluation.value);
        const res = await $fetch(`/api/software-types/${type}/softwares/${softwareUid}/evaluations`, {
            method: 'POST',
            body: JSON.stringify(evaluation.value),
        });
        const draftKey = `evaluation-new-${type}-${softwareUid}-${softwareVersion}`
        useDraft<EvaluationDraft>(draftKey).clear()
        navigateTo(`/software-types/${type}/softwares/${softwareUid}/versions/${softwareVersion}/evaluations/${res.grid.gridVersion}/${res.evaluationUid}`);
    } catch (error) {
        console.error(t('evaluation_new.error_publishing'), error);
    }
};

</script>


<style scoped>
.form-container {
    background-color: var(--background-color-alt);
    border: 1px solid var(--border-color);
    padding: 2em;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    max-width: 980px;
    margin: 2em auto;
}
</style>