<template>
  <form @submit.prevent="handleSubmit" v-if="evaluation?.grid">
    <div v-if="!canEdit" class="info-message" role="status" aria-live="polite">
      <Icon name="uil:info-circle" />
      {{ $t('evaluation_form.disabled_not_allowed') }}
    </div>
    <fieldset>
      <legend>{{ $t('evaluation_form.authors_legend') }}</legend>
      <ul class="authors">
        <li v-for="(author, index) in evaluation.authors" :key="index">
          <label :for="'authorEmail' + index">{{ $t('evaluation_form.email') }}</label>
          <input type="email" :id="'authorEmail' + index" v-model="author.email" required :disabled="!canEdit" />
          <label :for="'authorName' + index">{{ $t('evaluation_form.name') }}</label>
          <input type="text" :id="'authorName' + index" v-model="author.name" required :disabled="!canEdit" />
          <button type="button" @click="removeAuthor(index)" class="delete-button" v-if="canEdit">
            <Icon name="uil:trash-alt" />{{ $t('evaluation_form.remove') }}
          </button>
        </li>
      </ul>
      <button type="button" @click="addAuthor" v-if="canEdit">
        <Icon name="uil:plus" />{{ $t('evaluation_form.add_author') }}
      </button>
    </fieldset>

    <div>
      <label for="language">{{ $t('evaluation_form.language') }}</label>
      <select id="language" v-model="evaluation.language" required :disabled="!canEdit">
        <option disabled value="">{{ $t('evaluation_form.select_language') }}</option>
        <option v-for="(lang, code) in Language" :key="code" :value="code">{{ lang.name }}</option>
      </select>
    </div>
    <div>
      <h3>{{ $t('evaluation_form.evaluation_sections') }}</h3>
      <p v-if="validationError" class="error">{{ validationError }}</p>
      <fieldset :disabled="!canEdit">
        <FileTreeDetailsView v-model="evaluation.grid.sections" nameField="name" childrenField="sections"
          :missing-score-refs="missingScoreRefs" ref="fileTree">
          <template #details="selected">
            <div v-if="selected?.path" class="details">
              <CriteriaRateForm :evaluation :criteria="(selected.data as EvaluationCriteria)" :path="selected.path" />
            </div>
          </template>
        </FileTreeDetailsView>
      </fieldset>
    </div>
    <div class="actions">
      <button type="submit" :disabled="!canEdit">{{ submitLabel || $t('evaluation_form.submit_evaluation') }}</button>
    </div>
  </form>
</template>

<script lang="ts" setup>
import { type EvaluationCriteria, type EvaluationDraft } from '~~/types/evaluation';
import CriteriaRateForm from './CriteriaRateForm.vue';
import FileTreeDetailsView from '@/components/forms/FileTreeDetailsView.vue';
import { Language } from '~/services/language';

const props = defineProps<{
  evaluation: EvaluationDraft;
  validationError: string;
  canEdit: boolean;
  missingScoreRefs?: string[];
  submitLabel?: string;
}>();

const emit = defineEmits(['submit']);
const canEdit = computed(() => !!props.canEdit);
function addAuthor() {
  props.evaluation.authors = [...(props.evaluation.authors ?? []), { email: '', name: '' }];
}

function removeAuthor(index: number) {
  props.evaluation.authors?.splice(index, 1);
}

function handleSubmit() {
  emit('submit');
}
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

ul.authors {
  list-style: none;
  padding: 0;
}

ul.authors li {
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding-bottom: 0.5em;
  border-bottom: 1px solid gray;
  margin-bottom: 0.5em;
}

ul.authors li input[type='text'],
ul.authors li input[type='email'] {
  flex: 1;
  margin: 0;
  max-width: 50ch;
}

.details {
  margin-top: 10px;
}

.error {
  color: red;
  font-size: 0.8rem;
}

.actions {
  display: flex;
  justify-content: center;
}
</style>