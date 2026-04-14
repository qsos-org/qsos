<template>
    <div class="center-container">
        <div class="wrapper">
            <input type="range" step="5" :value="inputValue"
                @input="updateWeight(Number(($event.target as HTMLInputElement).value))" min="0" max="1000" />
            <div class="right-align">
                <input class="compact-input" type="number" v-model.number="inputValue" @change="onInputChange"
                    min="0" />
                <span>%</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
const prop = defineProps<{ value?: number }>();
const emit = defineEmits(['change']);

const inputValue = ref(typeof prop.value === 'number' ? prop.value : 100);

watch(() => prop.value, (newValue) => {
    inputValue.value = typeof newValue === 'number' ? newValue : 100;
},
    { immediate: true }
);

function updateWeight(newValue: number) {
    emit('change', newValue);
    inputValue.value = newValue;
}

function onInputChange() {
    if (inputValue.value < 0) inputValue.value = 0;
    emit('change', inputValue.value);
    // if (inputValue.value > 1000) inputValue.value = 1000;
}
</script>
<style scoped>
.center-container {
    display: flex;
    justify-content: center;
}

.wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 2em;
}

.right-align {
    display: flex;
    align-items: center;
    gap: 0.2em;
}

.compact-input {
    width: 6ch;
}
</style>