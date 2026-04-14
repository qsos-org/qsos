<script setup lang="ts">
const emit = defineEmits(["change"]);
const checked = defineModel<boolean>()
const { label } = defineProps<{ label: string }>()
const switchId = `switch-${Math.random().toString(36).substr(2, 9)}`
</script>

<template>
    <span class="switch">
        <input :id="switchId" type="checkbox" @change="emit('change')" v-model="checked" />
        <label :for="switchId" class="slider"></label>
    </span>
    <label v-if="label" :for="switchId">{{ label }}</label>
</template>

<style scoped>
.switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 20px;
    margin: 0;
    display: block;
}

.slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
}

input:checked+.slider {
    background-color: #2196F3;
}

input:checked+.slider:before {
    transform: translateX(20px);
}

label {
    display: inline-block;
    margin-left: 0.5em;
}
</style>
