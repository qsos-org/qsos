<template>
    <div class="language-switcher">
        <Icon name="uil:language" />
        <select id="lang-select" v-model="currentLocale" @change="onLocaleChange">
            <option value="en">{{ t('language.english') }}</option>
            <option value="fr">{{ t('language.french') }}</option>
        </select>
    </div>
</template>

<script setup lang="ts">
const { t, locale, setLocale } = useI18n();
const currentLocale = ref(locale.value);

const onLocaleChange = async () => {
    await setLocale(currentLocale.value as 'en' | 'fr');
    localStorage.setItem('i18n_locale', currentLocale.value);
};

watch(locale, (newLocale: string) => {
    currentLocale.value = newLocale as 'en' | 'fr';
});

onMounted(() => {
    const savedLocale = localStorage.getItem('i18n_locale');
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'fr')) {
        currentLocale.value = savedLocale;
        setLocale(savedLocale);
    }
});
</script>

<style scoped>
.language-switcher {
    display: flex;
    align-items: center;
    gap: 0.5em;
    color: white;
}

label {
    font-weight: 500;
}

select {
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--border-color-contrast, #ccc);
    border-radius: 4px;
    background-color: var(--background-color-contrast, #fff);
    color: var(--white, white);
    cursor: pointer;
}
</style>