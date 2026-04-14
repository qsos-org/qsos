import fs from "node:fs/promises";
import path from "path";
import log from "loglevel";
//import { bench } from 'vitest';

import {
    mockEvaluation,
    mockEvaluationGrid,
    mockSoftware,
    mockSoftwareType,
    mockSoftwareVersion,
} from "../test/mock";

import { FileBasedProvider } from "../app/services/data-providers/file-based-provider";

const provider = new FileBasedProvider("node");
const {
    getSoftware,
    getSoftwareType,
    getEvaluation,
    getEvaluationGrid,
    getSoftwareVersion,
    pushSoftware,
    pushSoftwareType,
    pushEvaluation,
    pushEvaluationGrid,
    pushSoftwareVersion,
} = provider


const dataPath = path.join(process.cwd(), "data");
await fs.rm(dataPath, { recursive: true, force: true });

const ensureDirectoryExists = async (filePath: string) => {
    const dir = path.dirname(filePath);
    log.trace(`Ensuring directory exists: ${dir}`);
    try {
        await fs.mkdir(dir, { recursive: true });
    } catch (error) {
        log.error(`Error checking existence of directory ${dir}:`, error);
    }
};


const bench = async <T>(
    desc: string,
    setup: () => T,
    fn: (x: T) => Promise<void>,
) => {
    const NB_ITERATIONS = 100;
    const times: number[] = [];

    for (let i = 0; i < NB_ITERATIONS; i++) {
        const x = setup();
        const before = process.hrtime.bigint();
        await fn(x).then(() => {
            const after = process.hrtime.bigint();
            const time = Number(after - before);
            times.push(time);
        });
    }

    const average = times.reduce((a, b) => a + b, 0) / times.length / 1000000;
    const minTime = Math.min(...times) / 1000000;
    const maxTime = Math.max(...times) / 1000000;
    log.info(
        `${desc}: ${average} ms on average (min: ${minTime} ms, max: ${maxTime} ms)`,
    );
};

await bench("write and read software types", mockSoftwareType, async (type) => {
    const filePath = path.join(dataPath, "software-types", type.uid + ".json");
    await ensureDirectoryExists(filePath);
    await pushSoftwareType(type);
    await getSoftwareType(type.uid);
});

await bench("write and read software", mockSoftware, async (software) => {
    const filePath = path.join(dataPath, "softwares", software.type.uid, software.uid + ".json");
    await ensureDirectoryExists(filePath);
    await pushSoftware(software);
    await getSoftware(software.type.uid, software.uid);
});

await bench(
    "write and read software versions",
    mockSoftwareVersion,
    async (softwareVersion) => {
        const type = mockSoftwareType().uid
        const softwareUid = mockSoftware().uid
        const filePath = path.join(dataPath, "softwares", type, softwareUid, softwareVersion.version + ".json");
        await ensureDirectoryExists(filePath);
        await pushSoftwareVersion(type, softwareUid, softwareVersion);
        await getSoftwareVersion(
            type,
            softwareUid,
            softwareVersion.version,
        );
    },
);

await bench(
    "write and read software evaluation templates",
    mockEvaluationGrid,
    async (grid) => {
        const filePath = path.join(dataPath, "evaluation-templates", grid.softwareType.uid, grid.gridVersion + ".json");
        await ensureDirectoryExists(filePath);
        await pushEvaluationGrid(grid);
        await getEvaluationGrid(grid.softwareType.uid, grid.gridVersion);
    },
);

await bench(
    "write and read software evaluation",
    mockEvaluation,
    async (evaluation) => {
        const filePath = path.join(dataPath, "evaluations", evaluation.software.type.uid, evaluation.software.uid, evaluation.softwareVersion.version, evaluation.grid.gridVersion, evaluation.evaluationUid + ".json");
        await ensureDirectoryExists(filePath);
        await pushEvaluation(evaluation);
        await getEvaluation(
            evaluation.software.type.uid,
            evaluation.software.uid,
            evaluation.softwareVersion.version,
            evaluation.grid.gridVersion,
            evaluation.evaluationUid,
        );
    },
);