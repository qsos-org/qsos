import type { QsosVersion } from "~~/types/qsos-version";
import { qsosVersion2_0 } from "./2.0";

export const QSOS_VERSIONS: { [version: string]: QsosVersion } = {
    "2.0": qsosVersion2_0,
}