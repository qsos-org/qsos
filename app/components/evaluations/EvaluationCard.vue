<template>
  <div class="evaluation-card card link" @click="navigateToDetail">
    <p>
      <i18n-t keypath="evaluation_card.title">
        <template #authors>
          <strong>{{ formatAuthors(evaluation.authors) }}</strong>
        </template>
        <template #date>
          <strong>{{ formatDate(evaluation.createdAt) }}</strong>
        </template>
      </i18n-t>
    </p>
  </div>
</template>

<script>
import { useRoute } from 'vue-router'

export default {
  props: {
    evaluation: {
      type: Object,
      required: true,
    },
    link: {
      type: Boolean,
      default: false,
    }
  },
  setup() {
    const route = useRoute()
    return { route }
  },
  computed: {
    evaluationUrl() {
      const type = this.route.params.type
      const softwareUid = this.route.params.softwareUid
      const version = this.evaluation.softwareVersion
      const gridVersion = this.evaluation.gridVersion
      const uid = this.evaluation.evaluationUid
      return `/software-types/${type}/softwares/${softwareUid}/versions/${version}/evaluations/${gridVersion}/${uid}`
    }
  },
  methods: {
    navigateToDetail() {
      this.$router.push(this.evaluationUrl);
    },
    formatAuthors(authors) {
      if (!authors || !Array.isArray(authors)) return '—';
      return authors.map(author => author.name || '').join(', ') || '—';
    },
    formatDate(date) {
      if (!date) return '—';
      return new Date(date).toLocaleDateString(this.$i18n.locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  },
};
</script>

<style scoped>
.evaluation-card {
  margin: 8px 0;
  cursor: pointer;
}
</style>