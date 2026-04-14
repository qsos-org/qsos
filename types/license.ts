export type LicenseInfo = {
    reference: string
    isDeprecatedLicenseId: boolean
    detailsUrl: string
    referenceNumber: number
    name: string
    licenseId: string
    seeAlso: string[]
    isOsiApproved: boolean
}

export type LicenseExceptionInfo = {
    reference: string
    isDeprecatedLicenseId: boolean
    detailsUrl: string
    referenceNumber: number
    name: string
    licenseExceptionId: string
    seeAlso: string[]
}