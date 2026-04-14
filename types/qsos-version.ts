import type { MaturitySection } from "./evaluation";

export type QsosVersion = {
    version: string;
    releaseDate: string;
    changelog: string;
    maturitySection: MaturitySection;
}