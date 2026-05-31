<template>
  <form @input="modified = true" @submit.prevent="handleSubmit" v-if="grid">
    <div v-if="!canEdit" class="info-message" role="status" aria-live="polite">
      <Icon name="uil:info-circle" />
      {{ !loggedIn ? $t('grid_edit.disabled_not_logged_in') : $t('grid_edit.disabled_not_owner') }}
    </div>
    <p>{{ $t('grid_form.evaluation_grid_type') }}
      <strong>{{ grid.softwareType.name }} ({{ grid.softwareType.uid }})</strong>.
    </p>
    <p>{{ $t('grid_form.author_email') }} {{ grid.creatorEmail }}</p>
    <p>{{ $t('grid_form.grid_version') }} <strong>{{ grid.gridVersion }}</strong> - <label for="qsosVersion"
        style="display:inline">{{ $t('grid_form.qsos_version') }}</label>
      <input type="string" id="qsosVersion" v-model="grid.qsosVersion" required
        style="display: inline-block; width: 4ch;" :disabled="!canEdit" />
    </p>
    <small v-if="hasNewQsos && canEdit">
      QSOS {{ latestQsosVersion }} available —
      <a class="action" href="#" @click.prevent="shouldUpdateMaturity = 'yes'">apply the update</a>
    </small>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h2 style="margin: 0;">{{ $t('grid_form.evaluation_criterias') }}</h2>
      <small style="color: var(--info-color); font-size: 0.85em;">
        <Icon name="uil:info-circle" /> {{ $t('grid_form.description_recommendation') }}
      </small>
    </div>
    <FileTreeDetailsView v-model="grid.sections" nameField="name" childrenField="sections" :is-readonly="isReadonly"
      ref="criteriatree">
      <template v-slot:tree-actions>
        <span v-if="canEdit" @click="addSection" class="action">
          <Icon name="uil:plus" />📁 {{ $t('grid_form.add_section') }}
        </span>
      </template>
      <template v-slot:subtree-actions="{ data, path }">
        <li v-if="canEdit && !isReadonly(path)" @click="addSubSection(data as EvaluationSection, path)" class="action">
          <Icon name="uil:plus" />📁 {{ $t('grid_form.add_subsection') }}
        </li>
        <li v-if="canEdit && !isReadonly(path)" @click="addCriteria(data as EvaluationSection, path)" class="action">
          <Icon name="uil:plus" />📄 {{ $t('grid_form.add_criteria') }}
        </li>
      </template>
      <template v-slot:node-actions="{ data, path }">
        <template v-if="canEdit && !isReadonly(path)">
          <Icon name="uil:trash-alt" title="Delete this section" @click.stop.prevent="deleteSection(path)"
            class="action" />
          <Icon name="uil:folder" @click.stop.prevent="addSubSection(data as EvaluationSection, path)"
            title="Add subsection" />
          <Icon name="uil:file" @click.stop.prevent="addCriteria(data as EvaluationSection, path)"
            title="Add criteria" />
        </template>
      </template>
      <template v-slot:file-actions="{ data, path }">
        <template v-if="canEdit && !isReadonly(path)">
          <Icon name="uil:trash-alt" @click.stop="deleteCriteria(path)" class="action" />
        </template>
      </template>
      <template v-slot:details="{ data, path }">
        <div v-if="data != null && isSubsection(data)">
          <label>Name</label>
          <input type="text" :value="$t(data.name, data.name)"
            @input="data.name = ($event.target as HTMLInputElement).value" required
            :disabled="!canEdit || isReadonly(path)" />
          <label>Description</label>
          <textarea :value="$t(data.description, data.description)"
            @input="data.description = ($event.target as HTMLTextAreaElement).value" placeholder="Describe the section"
            :disabled="!canEdit || isReadonly(path)"></textarea>

          <div class="actions" v-if="canEdit && !isReadonly(path)">
            <button type="button" @click="addSubSection(data, path)">
              <Icon name="uil:plus" />📁 {{ $t('grid_form.add_subsection') }}
            </button>
            <button type="button" @click="addCriteria(data, path)" class="action">
              <Icon name="uil:plus" />📄 {{ $t('grid_form.add_criteria') }}
            </button>
          </div>
        </div>
        <div v-else-if="data != null">
          <label>Label</label>
          <input type="text" :value="$t(data.name, data.name)"
            @input="data.name = ($event.target as HTMLInputElement).value" required
            :disabled="!canEdit || isReadonly(path)" />
          <label>Description</label>
          <textarea :value="$t(data.description, data.description)"
            @input="data.description = ($event.target as HTMLTextAreaElement).value"
            placeholder="Describe what is evaluated" :disabled="!canEdit || isReadonly(path)"></textarea>
          <table>
            <thead>
              <tr>
                <th style="width: 5ch;">Score</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border-left: 4px solid var(--danger-color);">0</td>
                <td><textarea :value="$t(data.desc0, data.desc0)"
                    @input="data.desc0 = ($event.target as HTMLTextAreaElement).value"
                    placeholder="Functionality not covered" :disabled="!canEdit || isReadonly(path)"></textarea></td>
              </tr>
              <tr>
                <td style="border-left: 4px solid var(--warning-color);">1</td>
                <td><textarea :value="$t(data.desc1, data.desc1)"
                    @input="data.desc1 = ($event.target as HTMLTextAreaElement).value"
                    placeholder="Functionality partially covered" :disabled="!canEdit || isReadonly(path)"></textarea>
                </td>
              </tr>
              <tr>
                <td style="border-left: 4px solid var(--success-color);">2</td>
                <td><textarea :value="$t(data.desc2, data.desc2)"
                    @input="data.desc2 = ($event.target as HTMLTextAreaElement).value"
                    placeholder="Functionality fully covered" :disabled="!canEdit || isReadonly(path)"></textarea></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </FileTreeDetailsView>

    <div class="actions" v-if="canEdit">
      <span class="error">{{ formError }}</span>
      <button type="submit" v-if="!initialVersion" :disabled="!validateGrid(grid)">{{ $t('grid_form.create_new_grid')
      }}</button>
      <template v-else-if="!showVersionChange">
        <button type="button" :disabled="!modified" @click="showVersionChange = true">{{ $t('grid_form.submit_changes')
        }}</button>
      </template>
    </div>

    <section class="version-change" v-if="initialVersion && showVersionChange">
      <div class="info">
        <h2>{{ $t('grid_form.maturity_update_title') }}</h2>
        <label>
          <input type="radio" name="qsosupdate" value="no" checked v-model="shouldUpdateMaturity" :disabled="!canEdit">
          {{ $t('grid_form.maturity_no') }}
        </label>
        <label>
          <input type="radio" name="qsosupdate" value="yes" v-model="shouldUpdateMaturity" :disabled="!canEdit">
          {{ $t('grid_form.maturity_yes') }}
        </label>
      </div>

      <h2>{{ $t('grid_form.push_new_version') }}</h2>
      <label><input type="radio" name="versionupdate" value="patch" checked v-model="versionUpdate"
          :disabled="shouldUpdateMaturity === 'yes' || !canEdit">
        <strong>{{ $t('grid_form.patch_label') }}</strong>: {{ $t('grid_form.patch_desc') }}</label>
      <label>
        <input type="radio" name="versionupdate" value="minor" v-model="versionUpdate"
          :disabled="shouldUpdateMaturity === 'yes' || !canEdit">
        <strong>{{ $t('grid_form.minor_label') }}</strong>: {{ $t('grid_form.minor_desc') }}</label>
      <label>
        <input type="radio" name="versionupdate" value="major" v-model="versionUpdate" :disabled="!canEdit">
        <strong>{{ $t('grid_form.major_label') }}</strong>: {{ $t('grid_form.major_desc') }}
      </label>

      <div class="changeLog" v-if="versionUpdate !== 'patch'">
        <h2>{{ $t('grid_form.changelog') }}</h2>
        <textarea v-model="grid.changeLog" :placeholder="$t('grid_form.changelog_placeholder')"
          :disabled="!canEdit"></textarea>
      </div>

      <div class="actions">
        <button type="submit">
          <template v-if="versionUpdate === 'major'">{{ $t('grid_form.publish_major', { version: newVersion }) }}</template>
          <template v-else-if="versionUpdate === 'minor'">{{ $t('grid_form.publish_minor', { version: newVersion }) }}</template>
          <template v-else>{{ $t('grid_form.save_version', { version: newVersion }) }}</template>
        </button>
      </div>
    </section>
  </form>
</template>

<script setup lang="ts">
import type { EvaluationGrid, EvaluationSection, EvaluationCriteria } from '~~/types/evaluation';
import FileTreeDetailsView from '~/components/forms/FileTreeDetailsView.vue';
import { ref } from 'vue';
import { QSOS_VERSIONS } from '~/services/qsos-versions/qsos-versions';
import log from 'loglevel';
import { nanoid } from 'nanoid';
const { t } = useI18n();
const emit = defineEmits(['submit']);
const grid = defineModel<EvaluationGrid>();
const { initialVersion } = defineProps<{ initialVersion?: string }>();
const modified = ref(false);
const criteriaTree = useTemplateRef<typeof FileTreeDetailsView>("criteriatree")
const showVersionChange = ref(false);
const shouldUpdateMaturity = ref('no');
const versionUpdate = ref('patch');
const changeLog = ref<string>('');
const formError = ref<string>('');
const { loggedIn, user, session } = useUserSession();
const prevQsos = ref<string | null>(null);
const prevMaturity = ref<any | null>(null);

const isAdmin = computed(() =>
  (session.value?.user?.roles || []).includes("admin")
);
const isOwner = computed(() => {
  const me = (user.value?.email || "").toLowerCase();
  const ownerEmail = (grid.value?.creatorEmail || (grid.value as any)?.author?.email || "").toLowerCase();
  return !!me && !!ownerEmail && me === ownerEmail;
});

const canEdit = computed(() => loggedIn.value && (isOwner.value || isAdmin.value));
watch(() => grid.value, () => modified.value = true, { deep: true });

const latestQsosVersion = computed(() => {
  const keys = Object.keys(QSOS_VERSIONS);
  if (keys.length === 0) return grid.value?.qsosVersion ?? '2.0';
  return keys.sort((a, b) => b.localeCompare(a))[0]!;
});

const hasNewQsos = computed(() => {
  if (!grid.value?.qsosVersion) return false;
  return latestQsosVersion.value.localeCompare(grid.value.qsosVersion) > 0;
});

watch(() => shouldUpdateMaturity.value, async (val, prev) => {
  if (!grid.value) return

  if (val === 'no') {
    if (prevQsos.value != null) {
      grid.value.qsosVersion = prevQsos.value
      if (prevMaturity.value) {
        if (Array.isArray(grid.value.sections) && grid.value.sections.length > 0) {
          grid.value.sections.splice(0, 1, prevMaturity.value)
        } else {
          grid.value.sections = [prevMaturity.value]
        }
      }
      modified.value = true
      prevQsos.value = null
      prevMaturity.value = null
    }
    return
  }

  if (val !== 'yes') return

  try {
    const typeUid = grid.value.softwareType?.uid || grid.value.softwareType?.name || ''
    if (!typeUid) return

    if (prevQsos.value === null) {
      prevQsos.value = grid.value.qsosVersion ?? null
      prevMaturity.value = Array.isArray(grid.value.sections) ? structuredClone(grid.value.sections[0]) : null
    }
    const resp = await $fetch(`/api/software-types/${typeUid}/grids/initial?version=${latestQsosVersion.value}`)
    const maturitySection = resp?.maturitySection

    const genericIndex = grid.value.sections?.findIndex(
      s => s.name === "Section générique" || s.name === "generic"
    ) ?? -1;

    if (genericIndex >= 0) {
      grid.value.sections.splice(genericIndex, 1, maturitySection)
    } else if (Array.isArray(grid.value.sections) && grid.value.sections.length > 0) {
      grid.value.sections.splice(0, 1, maturitySection)
    } else {
      grid.value.sections = [maturitySection]
    }

    if (latestQsosVersion.value) {
      grid.value.qsosVersion = latestQsosVersion.value
    }
    versionUpdate.value = 'major'
    showVersionChange.value = true
    modified.value = true

    if (criteriaTree.value) {
      criteriaTree.value.select([0])
    }
  } catch (e) {
    log.error(t('grid_edit.error_updating_maturity'), e)

    shouldUpdateMaturity.value = prev ?? 'no'
  }
})

const newVersion = computed(() => {
  if (!grid.value) return null;
  const [major = 0, minor = 0] = grid.value.gridVersion.split('.').map(Number);
  if (versionUpdate.value === 'major') return `${major + 1}.0`;
  if (versionUpdate.value === 'minor') return `${major}.${minor + 1}`;
  return grid.value.gridVersion;
})

function handleSubmit() {
  if (modified.value === false || !grid.value || !newVersion.value) return;
  grid.value.gridVersion = newVersion.value;
  const evaluation = {
    ...grid.value,
    initialVersion,
    changeLog: changeLog.value,
  };

  const isValid = validateGrid(grid.value);

  if (isValid) {
    emit('submit', evaluation);
    modified.value = false;
  }
}

function validateGrid(grid: EvaluationGrid): boolean {
  if (!grid.softwareType) {
    formError.value = 'Software type is required.';
    return false;
  }
  if (!grid.gridVersion) {
    formError.value = 'Grid version is required.';
    return false;
  }
  if (!grid.qsosVersion) {
    formError.value = 'QSOS version is required.';
    return false;
  }

  if (!grid.sections || grid.sections.length < 3) {
    formError.value = 'You must add at least 3 sections to create an evaluation grid.';
    return false;
  }

  const validateSections = (sections: (EvaluationSection | EvaluationCriteria)[]): boolean => {
    if (!sections || sections.length === 0) {
      formError.value = 'Some sections or criteria are empty. Please ensure each section contains at least one complete criterion.';
      return false;
    }
    for (const section of sections) {
      if (!section.name?.trim()) {
        formError.value = 'Some sections or criteria are missing a name.';
        return false;
      }

      if (isSubsection(section)) {
        if (!validateSections(section.sections)) return false;
      } else {
        // It's a criteria
        const criteria = section as EvaluationCriteria;

        const scoreDescriptions = [
          criteria.desc0?.trim(),
          criteria.desc1?.trim(),
          criteria.desc2?.trim()
        ].filter(Boolean);

        if (!criteria.name?.trim() || scoreDescriptions.length < 3) {
          formError.value = 'Some criteria are missing a name or score descriptions. Please ensure every criterion has a name and all 3 score descriptions (0, 1, 2).';
          return false;
        }
      }
    }
    return true;
  };

  const ok = validateSections(grid.sections);
  if (ok) formError.value = '';
  return ok;

}

function addSection() {
  if (!grid.value) return
  const newLength = grid.value.sections.push({
    ref: nanoid(),
    name: 'New section',
    description: '',
    sections: []
  });
  if (criteriaTree.value) criteriaTree.value.select([newLength - 1]);
}

function addSubSection(section: EvaluationSection, path: Path) {
  if (!section) return
  const newLength = section.sections.push({
    ref: nanoid(),
    name: 'New subsection',
    description: '',
    sections: []
  });
  if (criteriaTree.value) criteriaTree.value.select([...path, "sections", newLength - 1]);
}

const isSubsection = (section: { [key: string]: any }): section is EvaluationSection => {
  return (section as EvaluationSection).sections !== undefined;
};

const isReadonly = (path: Path) => {
  return path[0]?.toString() == "0" && grid.value?.sections?.[0]?.ref === "qsos_maturity_2_0.maturity"
};

const addCriteria = (section: EvaluationSection, path: Path) => {
  if (!section) return
  const newLength = section.sections.push({
    name: 'New criteria',
    description: '',
    desc0: '',
    desc1: '',
    desc2: ''
  } as EvaluationCriteria);
  if (criteriaTree.value) criteriaTree.value.select([...path, "sections", newLength - 1]);
};

const deleteCriteria = (path: Path) => {
  if (!grid.value) return
  const criteria = getValueAtPath(grid.value.sections, path);
  const parent = getParentForPath(grid.value.sections, path);
  const sections = Array.isArray(parent) ? parent : parent ? parent.sections : grid.value?.sections;
  if (!sections || !criteria) return
  if (confirm(`Are you sure you want to delete this criteria ?`)) {
    sections.splice(sections.indexOf(criteria), 1);
    if (criteriaTree.value && parent) criteriaTree.value.select(parent)
  }
}

const deleteSection = (path: Path) => {
  if (!grid.value) return
  const section = getValueAtPath(grid.value.sections, path);
  const parent = getParentForPath(grid.value.sections, path);
  const sections = Array.isArray(parent) ? parent : parent ? parent.sections : grid.value?.sections;
  if (!sections || !section) return
  if (confirm(`Are you sure you want to delete this ${parent ? 'subsection' : 'section'} and all its subsections and criterias ?`)) {
    sections.splice(sections.indexOf(section), 1);
    if (criteriaTree.value && parent) criteriaTree.value.select(parent)
  }
};
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h2 {
  margin: 0;
}

p {
  margin: 0;
}

ul.authors {
  list-style: none;
  padding: 0;
}

ul.authors li {
  display: grid;
  grid-template-columns: min-content 1fr;
  align-items: center;
  gap: 0 0.5em;
  border-bottom: 1px solid gray;
  margin-bottom: 0.5em;
}

.file-tree li {
  list-style: none;
}

.actions {
  border-top: 1px solid gray;
  padding-top: 0.5em;
  display: flex;
  gap: 1em;
  justify-content: end;
  align-items: center;
}

.action {
  cursor: pointer;
  color: var(--primary-color);
}

.sections {
  display: flex;
  flex-direction: column;
  gap: 2em;
}

.version-change {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.version-change label::after {
  content: none;
}

.info {
  padding: 1em;
  border: 1px solid var(--info-color);
  border-radius: 5px;
  color: var(--info-color);
  font-size: 0.9em;
}
</style>