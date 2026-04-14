<template>
    <div v-if="!criteria.desc0 && !criteria.desc1 && !criteria.desc2">
        <p><strong>{{ $t('criteria_rate_form.name') }}:</strong> {{ $t(criteria.name) }}</p>
        <p><strong>{{ $t('criteria_rate_form.description') }}:</strong> {{ $t(criteria.description) }}</p>
    </div>
    <div v-else>
        <label><strong>{{ $t('criteria_rate_form.criteria') }}:</strong> {{ $t(criteria.name) }}</label>
        <label><strong>{{ $t('criteria_rate_form.description') }}:</strong> {{ $t(criteria.description) }}</label>

        <label><strong>{{ $t('criteria_rate_form.score') }}:</strong></label>
        <div>
            <label>
                <input type="radio" :checked="criteriaRated.score === 0" @change="rateCriteria('score', 0)" value="0" />
                0 -
                <span>{{ $t(criteria.desc0) }}</span>
            </label>
            <label>
                <input type="radio" :checked="criteriaRated.score === 1" @change="rateCriteria('score', 1)" value="1" />
                1 -
                <span>{{ $t(criteria.desc1) }}</span>
            </label>
            <label>
                <input type="radio" :checked="criteriaRated.score === 2" @change="rateCriteria('score', 2)" value="2" />
                2 -
                <span>{{ $t(criteria.desc2) }}</span>
            </label>
            <div v-if="criteriaRated.score === undefined" class="error">{{ $t('criteria_rate_form.score_required') }}
            </div>
        </div>

        <label for="justification"><strong>{{ $t('criteria_rate_form.justification') }}:</strong></label>
        <textarea id="justification" :value="criteriaRated.comment"
            @change="rateCriteria('comment', ($event.target as HTMLTextAreaElement).value)"
            :placeholder="$t('criteria_rate_form.justification_placeholder')"></textarea>
        <div v-if="criteriaRated.score !== undefined && !criteriaRated.comment" class="warning">{{
            $t('criteria_rate_form.justification_recommended') }}</div>
    </div>
</template>

<script lang="ts" setup>
import type { EvaluationDraft, EvaluationCriteria, EvaluationCriteriaRated } from '~~/types/evaluation';
import { getValueAtPath, setValueAtPath, type Path } from '~/utils/path';

const { evaluation, criteria, path } = defineProps<{ evaluation: EvaluationDraft, criteria: EvaluationCriteria; path: Path }>();

const criteriaRated = computed(() => getValueAtPath(evaluation.sections ?? [], path) as EvaluationCriteriaRated);

function rateCriteria<Prop extends keyof EvaluationCriteriaRated>(
    prop: Prop, value: EvaluationCriteriaRated[Prop]
) {
    setValueAtPath(evaluation.sections ?? [], [...path, prop], value)
}
</script>

<style scoped>
.error {
    color: #c62828;
    font-weight: bold;
}

.warning {
    color: #f57c00;
    font-weight: 500;
    font-style: italic;
}
</style>