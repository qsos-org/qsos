import type { LicenseExceptionInfo, LicenseInfo } from "~~/types/license"

export const licenses: LicenseInfo[] = []
export const exceptions: LicenseExceptionInfo[] = []

export function loadLicenses() {
    if (licenses.length > 0) return
    $fetch<{ licenses: LicenseInfo[], exceptions: LicenseExceptionInfo[] }>("/api/licenses").then(data => {
        licenses.push(...data.licenses)
        exceptions.push(...data.exceptions)
    })
}

export const LICENSE_OPERANDS = ["AND", "OR", "WITH"]

export function parseLicenseString(licenseString: string): { licenses: string[], operands: string[] } {
    const licenseRegex = new RegExp(`\\s(${LICENSE_OPERANDS.join("|")})\\s`, "i")
    const parts = licenseString.split(licenseRegex)
    return {
        licenses: parts.filter((p, i) => i % 2 === 0).map(s => s.trim()),
        operands: parts.filter((p, i) => i % 2 !== 0).map(s => s.trim())
    }
}

export function formatLicenseString(licenses: string[], operands: string[]) {
    const croppedOperands = operands.slice(0, licenses.length - 1)
    return licenses.map((l, i) => `${l} ${croppedOperands[i] || ""}`).join(" ").trim()
}

export function getLicenseDescription(licenseId: string): string {
    const { licenses: licensesIds, operands } = parseLicenseString(licenseId)
    const getLicenseName = (licenseId: string) => licenses.find(l => l.licenseId === licenseId)?.name ?? "Unknown license"
    return licensesIds.map(l => getLicenseName(l)).reduce((acc, l, i) => acc + l + (operands[i] ? ` ${operands[i]} ` : ""), "")
}