<template>
    <fieldset>
        <legend>{{$t('license_select.license_legend')}}<b>{{ model }}</b> - {{ getLicenseDescription(model) }}</legend>

        <datalist id="licenses">
            <option v-for="license in availableLicenses" :key="license.licenseId" :value="license.licenseId">
                {{ license.name }} ({{ license.licenseId }})
            </option>
        </datalist>
        <datalist id="exceptions">
            <option v-for="exception in exceptions" :key="exception.licenseExceptionId"
                :value="exception.licenseExceptionId">
                {{ exception.name }} ({{ exception.licenseExceptionId }})
            </option>
        </datalist>
        <template v-for="(license, index) in licenses">
            <input type="text" list="exceptions" v-if="index > 0 && operands[index - 1] === 'WITH'"
                v-model="licenses[index]" />
            <input type="text" list="licenses" v-else v-model="licenses[index]" />
            <button v-if="index > 0" :title="$t('license_select.remove_license')" @click.prevent="removeLicense(index)">
                <Icon name="uil:minus" />
            </button>

            <select v-if="index < licenses.length - 1" :value="operands[index]"
                @change="operands[index] = ($event.target as HTMLSelectElement | null)?.value ?? 'AND'">
                <option value="AND">{{ $t('license_select.and') }}</option>
                <option value="OR">{{ $t('license_select.or') }}</option>
                <option value="WITH">{{ $t('license_select.with') }}</option>
            </select>

            <button @click.prevent="addLicense('AND')" :title="$t('license_select.add_license')"
                v-if="index === 0 && licenses.length === 1">
                <Icon name="uil:plus" /> {{ $t('license_select.multi_licensing') }}
            </button>
            <button @click.prevent="addLicense('WITH')" :title="$t('license_select.add_exception')"
                v-if="index === 0 && licenses.length === 1">
                <Icon name="uil:plus" /> {{ $t('license_select.exception') }}
            </button>
            <button @click.prevent="addLicense('AND')" :title="$t('license_select.add_license')"
                v-if="index > 0 && index === licenses.length - 1">
                <Icon name="uil:plus" />
            </button>
        </template>
    </fieldset>
</template>

<script lang="ts" setup>
import { exceptions, formatLicenseString, licenses as availableLicenses, parseLicenseString, getLicenseDescription, loadLicenses } from '~/services/licenses';
import log from 'loglevel';

const model = defineModel({ default: "", type: String });
const { licenses: initialLicenses, operands: initialOperands } = parseLicenseString(model.value);
const licenses = reactive<string[]>(initialLicenses ?? [""]);
const operands = reactive<string[]>(initialOperands ?? []);

loadLicenses()

function addLicense(operand: string) {
    licenses.push("")
    operands.push(operand)
}

function removeLicense(index: number) {
    licenses.splice(index, 1)
    operands.splice(index - 1, 1)
}

watch(model, (value) => {
    const { licenses: _licenses, operands: _operands } = parseLicenseString(value)
    log.trace("Parsing license string", value, _licenses, _operands)
    licenses.splice(0, licenses.length, ..._licenses)
    operands.splice(0, operands.length, ..._operands)
})

watch([licenses, operands], ([_licenses, _operands]) => {
    if (_licenses.some(license => !license.trim())) return; // one field is empty
    const newLicense = formatLicenseString(_licenses, _operands);
    if (newLicense !== model.value) {
        log.trace("Updating model with new license string", newLicense);
        model.value = newLicense;
    }
})
</script>

<style scoped>
fieldset {
    display: flex;
    gap: 0.5em;
    flex-wrap: wrap;
}

input[type="text"] {
    width: 20em;
    margin: 0;
}
</style>