<template>
    <div>
        <div class="hero">
            <h1>{{ $t('import_legacy.title') }}</h1>
            <p>{{ $t('import_legacy.subtitle') }}</p>
        </div>
        <main>
            <div class="drop-area" @dragover.prevent @drop.prevent="handleDrop">
                <p>{{ $t('import_legacy.drop_file') }}</p>
            </div>
            <div class="logs" v-if="logs.length > 0">
                <ul>
                    <li v-for="(entry, i) in logs" :key="i" :class="`log-${entry.type}`">
                        {{ entry.message }}
                    </li>
                </ul>
            </div>
            
            <div v-if="isEditingScores && currentEvaluation" class="dialog-overlay" @click="cancelEdit">
                <div class="dialog" @click.stop>
                    <div class="dialog-header">
                        <h2>{{ getDialogInfo().title }}</h2>
                        <button @click="cancelEdit" class="close-button" aria-label="Close">x</button>
                    </div>
                    <p class="instruction">{{ getDialogInfo().message }}</p>
                    <div class="dialog-content">
                        <div class="warning-box">
                            <h3>{{ hasMissingVersion || !currentEvaluation?.software?.name || !currentEvaluation?.software?.licenseId ? $t('import_legacy.software_required_fields') : $t('import_legacy.software') }}</h3>
                            <SoftwareForm 
                                v-model="currentEvaluation.software" 
                                :can-edit="true" 
                                :hide-submit="true"
                                :show-type-as-text="false"
                            />
                        </div>
                        <div class="warning-box">
                            <h3>{{ hasMissingVersion ? $t('import_legacy.software_version_required') : $t('import_legacy.software_version') }}</h3>
                            <SoftwareVersionForm 
                                v-model="currentEvaluation.softwareVersion" 
                                :hide-submit="true"
                                :can-edit="true"
                            />
                        </div>
                        <EvaluationForm 
                            :evaluation="currentEvaluation" 
                            :validation-error="''"
                            :can-edit="true"
                            :missing-score-refs="missingScoreRefs"
                            :submit-label="missingScoreRefs.length > 0 ? t('import_legacy.submit_and_finalize') : (hasMissingVersion ? t('import_legacy.complete_and_finalize') : t('import_legacy.review_and_finalize'))"
                            @submit="finalizeImport"
                        />
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { parseLegacyXMLToEvaluation, validateAndFixQSOSXML, validateCriteriaScores, getMissingScoreRefs } from '~/services/converter';
import { isCriteria, type EvaluationCriteria, type EvaluationGrid, type EvaluationSection } from '~~/types/evaluation';
import type { Software, SoftwareType, SoftwareVersion } from '~~/types/software';
import EvaluationForm from '~/components/evaluations/EvaluationForm.vue';
import SoftwareVersionForm from '~/components/softwares/SoftwareVersionForm.vue';
import SoftwareForm from '~/components/softwares/SoftwareForm.vue';

type LogType = 'info' | 'success' | 'warning' | 'error';
type LogEntry = { message: string; type: LogType };

const { t } = useI18n();
const userSession = useUserSession();
const logs = ref<LogEntry[]>([]);
const isEditingScores = ref(false);
const currentEvaluation = ref<any>(null);
const missingScoreRefs = ref<string[]>([]);
const hasMissingVersion = ref(false);

function getDialogInfo() {
    const hasSoftwareMissing = !currentEvaluation.value?.software?.name || !currentEvaluation.value?.software?.licenseId;
    const hasVersion = !hasMissingVersion.value;
    const hasScores = missingScoreRefs.value.length === 0;
    
    let title = t('import_legacy.complete_missing_scores');
    let message = t('import_legacy.complete_scores_instruction');
    
    if (!hasSoftwareMissing && hasVersion && hasScores) {
        title = t('import_legacy.review_evaluation');
        message = t('import_legacy.review_evaluation_message');
    } else if (hasSoftwareMissing) {
        title = t('import_legacy.complete_software_fields');
        message = t('import_legacy.complete_required_fields');
    } else if (!hasVersion) {
        title = t('import_legacy.complete_software_version');
        message = t('import_legacy.complete_required_fields');
    } else if (!hasScores) {
        title = t('import_legacy.complete_missing_scores');
        message = t('import_legacy.complete_scores_instruction');
    }
    
    return { title, message };
}

function log(message: string, type: LogType = 'info') {
    logs.value.push({ message, type })
}

function resetImportState() {
    isEditingScores.value = false;
    currentEvaluation.value = null;
    missingScoreRefs.value = [];
    hasMissingVersion.value = false;
}

function handleDrop(event: DragEvent) {
    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) {
        log(t('import_legacy.no_files_dropped'), 'warning');
        return;
    }
    
    logs.value = [];
    resetImportState();

    for (const file of Array.from(files)) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            convertEvaluationToLegacyXML(content);
        };
        reader.readAsText(file, 'UTF-8');
    }
}

function cancelEdit() {
    resetImportState();
    log(t('import_legacy.edit_cancelled'), 'warning');
}

async function ensureResourcesExist(evaluation: any) {
    const type = evaluation.software.type.uid;
    const softwareUid = evaluation.software.uid;
    const softwareVersion = evaluation.softwareVersion.version;
    let gridVersion = evaluation.grid.gridVersion;

    log(t('import_legacy.checking_software_exists') + ' ' + type, 'info');
    try {
        await $fetch<SoftwareType>(`/api/software-types/${encodeURIComponent(type)}/softwares/${encodeURIComponent(softwareUid)}`, {
            method: 'GET'
        });
        log(t('import_legacy.software_type_found'), 'success');
    } catch (error) {
        log(t('import_legacy.software_type_not_found'), 'info');
        try {
            await $fetch('/api/software-types', {
                method: 'POST',
                body: evaluation.software.type,
            });
            log(t('import_legacy.software_type_created') + ' ' + evaluation.software.type.uid, 'success');
        } catch (createError: any) {
            if (createError.statusCode === 409) {
                log(t('import_legacy.software_type_created') + ' ' + evaluation.software.type.uid, 'success');
            } else {
                throw createError;
            }
        }
    }

    log(t('import_legacy.checking_software') + ' ' + evaluation.software.uid, 'info')
    try {
        const softwares = await $fetch<Software[]>(`/api/software-types/${encodeURIComponent(type)}/softwares`, {
            method: 'GET'
        });
        const softwareExists = softwares.find(s => s.name === evaluation.software.name);
        if (!softwareExists) {
            throw new Error('Software not found');
        }
        log(t('import_legacy.software_found'), 'success');
    } catch (error) {
        log(t('import_legacy.software_not_found') + ' ' + evaluation.software.uid, 'info');
        try {
            await $fetch(`/api/software-types/${encodeURIComponent(type)}/softwares`, {
                method: 'POST',
                body: evaluation.software,
            });
            log(t('import_legacy.software_created') + ' ' + evaluation.software.uid, 'success');
        } catch (createError: any) {
            if (createError.statusCode === 409) {
                log(t('import_legacy.software_found') + ' ' + evaluation.software.uid, 'success');
            } else {
                throw createError;
            }
        }
    }

    log(t('import_legacy.checking_version') + ' ' + softwareVersion, 'info');
    try {
        const versions = await $fetch<SoftwareVersion[]>(`/api/software-types/${encodeURIComponent(type)}/softwares/${encodeURIComponent(softwareUid)}/versions`, {
            method: 'GET'
        });
        const versionExists = versions.find(v => v.version === softwareVersion);
        if (!versionExists) {
            throw new Error('Version not found');
        }
        log(t('import_legacy.version_exists') + ' ' + versionExists.version, 'success');
    } catch (error) {
        log(t('import_legacy.version_not_found') + ' ' + evaluation.softwareVersion.version, 'info');
        try {
            await $fetch(`/api/software-types/${encodeURIComponent(type)}/softwares/${encodeURIComponent(softwareUid)}/versions`, {
                method: 'POST',
                body: evaluation.softwareVersion,
            });
            log(t('import_legacy.version_created') + ' ' + evaluation.softwareVersion.version, 'success');
        } catch (createError: any) {
            if (createError.statusCode === 409) {
                log(t('import_legacy.version_exists') + ' ' + evaluation.softwareVersion.version, 'success');
            } else {
                throw createError;
            }
        }
    }

    log(t('import_legacy.checking_grid') + ' ' + (evaluation.grid.gridVersion || ''), 'info')
    if (!gridVersion) {
        log(t('import_legacy.no_grid_version'), 'warning')
        gridVersion = "1.0"
    }
    let grid: EvaluationGrid | null = null;
    try {
        grid = await $fetch<EvaluationGrid>(`/api/software-types/${encodeURIComponent(type)}/grids/${encodeURIComponent(gridVersion)}`, {
            method: 'GET'
        });
        log(t('import_legacy.grid_exists') + ' ' + grid.gridVersion, 'success');
    } catch (error) {
        log(t('import_legacy.grid_not_found') + ' ' + gridVersion, 'info');
        grid = await $fetch<EvaluationGrid>(`/api/software-types/${encodeURIComponent(type)}/grids`, {
            method: 'POST',
            params: { type },
            body: evaluation.grid,
        });
        log(t('import_legacy.grid_created') + ' ' + gridVersion, 'success');
    }

    return grid;
}

async function finalizeImport() {
    if (!currentEvaluation.value) return;
    
    const evaluation = currentEvaluation.value;
    const scoreMessages = validateCriteriaScores(evaluation);

    if (scoreMessages.some((m) => m.type === 'error')) {
        missingScoreRefs.value = getMissingScoreRefs(evaluation);
        return;
    }
    
    const type = evaluation.software.type.uid;
    const softwareUid = evaluation.software.uid;
    const softwareVersion = evaluation.softwareVersion.version;
    
    try {
        await ensureResourcesExist(evaluation);
        
        log(t('import_legacy.uploading_evaluation'), 'info');
        await $fetch(`/api/software-types/${type}/softwares/${softwareUid}/evaluations`, {
            method: 'POST',
            params: { type, softwareUid },
            body: evaluation,
        })
        log(`${t('import_legacy.uploading_evaluation_success')} ${softwareUid} v${softwareVersion}`, 'success');
        resetImportState();
    } catch (error) {
        log(`${t('import_legacy.error_uploading')} ${error}`, 'error');
    }
}

function matchesGridContent(grid: EvaluationGrid, existingGrid: EvaluationGrid): boolean {
    if (grid.gridVersion !== existingGrid.gridVersion) {
        throw new Error(t('import_legacy.mismatch_grid_version', { expected: existingGrid.gridVersion, got: grid.gridVersion }));
    }
    if (grid.sections.length !== existingGrid.sections.length) {
        throw new Error(t('import_legacy.mismatch_sections_length', { expected: existingGrid.sections.length, got: grid.sections.length }));
    }
    grid.sections.forEach((section, index) => {
        try {
            matchesGridSection(section, existingGrid.sections[index]!);
        } catch (error: any) {
            throw new Error(t('import_legacy.mismatch_sections', { index, error: error.message }));
        }
    });
    return true;
}

function matchesGridSection(section: EvaluationSection, existingSection: EvaluationSection): boolean {
    if (section.name !== existingSection.name) {
        throw new Error(t('import_legacy.mismatch_section_name', { expected: existingSection.name, got: section.name }));
    }
    if (section.sections.length !== existingSection.sections.length) {
        throw new Error(t('import_legacy.mismatch_subsections_length', { expected: existingSection.sections.length, got: section.sections.length }));
    }
    section.sections.forEach((subsection, index) => {
        const existingSubsection = existingSection.sections[index]!;
        if (isCriteria(subsection) !== isCriteria(existingSubsection)) {
            throw new Error(t('import_legacy.mismatch_criteria_type', { index }));
        }
        if (isCriteria(subsection)) {
            try {
                matchesGridCriteria(subsection, existingSubsection as EvaluationCriteria);
            } catch (error: any) {
                throw new Error(t('import_legacy.mismatch_subsections', { index, error: error.message }));
            }
        } else {
            try {
                matchesGridSection(subsection as EvaluationSection, existingSubsection as EvaluationSection);
            } catch (error: any) {
                throw new Error(t('import_legacy.mismatch_subsections', { index, error: error.message }));
            }
        }
    });
    return true;
}

function matchesGridCriteria(criteria: EvaluationCriteria, existingCriteria: EvaluationCriteria): boolean {
    if (criteria.name !== existingCriteria.name) {
        throw new Error(t('import_legacy.mismatch_criteria_name', { expected: existingCriteria.name, got: criteria.name }));
    }
    if (criteria.description !== existingCriteria.description) {
        throw new Error(t('import_legacy.mismatch_criteria_description', { expected: existingCriteria.description, got: criteria.description }));
    }
    if (criteria.desc0 !== existingCriteria.desc0) {
        throw new Error(t('import_legacy.mismatch_criteria_desc0', { expected: existingCriteria.desc0, got: criteria.desc0 }));
    }
    if (criteria.desc1 !== existingCriteria.desc1) {
        throw new Error(t('import_legacy.mismatch_criteria_desc1', { expected: existingCriteria.desc1, got: criteria.desc1 }));
    }
    if (criteria.desc2 !== existingCriteria.desc2) {
        throw new Error(t('import_legacy.mismatch_criteria_desc2', { expected: existingCriteria.desc2, got: criteria.desc2 }));
    }
    if (criteria.ref !== existingCriteria.ref) {
        throw new Error(t('import_legacy.mismatch_criteria_ref', { expected: existingCriteria.ref, got: criteria.ref }));
    }
    return true;
}

async function convertEvaluationToLegacyXML(content: string) {
    log(t('import_legacy.converting'), 'info');
    try {
        const evaluation = parseLegacyXMLToEvaluation(content);
        
        const importerEmail = userSession.user.value?.email as string | undefined;
        const validationMessages = validateAndFixQSOSXML(evaluation, importerEmail);
        validationMessages.forEach((m) => log(m.message, m.type));
        
        const scoreMessages = validateCriteriaScores(evaluation);
        scoreMessages.forEach((m) => log(m.message, m.type));
        
        const hasVersionError = validationMessages.some((m) => m.type === 'error');
        const hasScoreError = scoreMessages.some((m) => m.type === 'error');
        
        hasMissingVersion.value = !evaluation.softwareVersion?.version || evaluation.softwareVersion.version.trim() === '';
        missingScoreRefs.value = hasScoreError ? getMissingScoreRefs(evaluation) : [];
        currentEvaluation.value = evaluation;
        isEditingScores.value = true;
        
        if (!hasVersionError && !hasScoreError) {
            log(t('import_legacy.review_before_import'), 'info');
        }
    } catch (error) {
        error && log(`${t('import_legacy.error_parsing')} ${error.toString()}`, 'error');
    }
}
</script>

<style scoped>
.logs {
    margin-top: 20px;
    background-color: #f9f9f9;
    padding: 10px;
    border-radius: 5px;
    max-height: 300px;
    overflow-y: auto;
}

.logs ul {
    list-style: none;
    padding: 0;
    margin: 0;
    font-family: monospace;
}

.logs li {
    padding: 6px 8px;
    border-radius: 4px;
    margin-bottom: 6px;
}

.log-info {
    color: #0d47a1;
}

.log-success {
    color: #2e7d32;
}

.log-warning {
    color: #ff6f00;
}

.log-error {
    color: #c62828;
}

.drop-area {
    border: 2px dashed #ccc;
    display: grid;
    place-content: center;
    border-radius: 5px;
    background-color: #f0f0f0;
    height: 200px;
    width: 400px;
    margin: 0 auto;
}

.instruction {
    padding: 1rem 2rem;
    margin: 0;
    background-color: #fffbf0;
    border-bottom: 1px solid #ddd;
}
</style>