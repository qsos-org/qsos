// @vitest-environment nuxt
import { expect, test } from "vitest";
import path from "node:path";
import { readdir, readFile } from "node:fs/promises";
import {
	convertEvaluationToLegacyXML,
	parseLegacyXMLToEvaluation,
} from "../app/services/converter";

test("test converter between TypeScript and XML format", async () => {
	const xmlFiles = await readdir("./test/legacy/xml");
	for (const xmlFile of xmlFiles) {
		const xml = await readFile(path.join("./test/legacy/xml", xmlFile), {
			encoding: "utf-8",
		});
		const obj = await parseLegacyXMLToEvaluation(xml);
		const obj2 = await parseLegacyXMLToEvaluation(
			convertEvaluationToLegacyXML(obj),
		);
		expect(obj2).toMatchObject(obj);
	}
});
