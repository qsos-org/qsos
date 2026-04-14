import { XMLParser } from "fast-xml-parser";
import {
	type Evaluation,
	type EvaluationCriteria,
	type EvaluationSection,
	type EvaluationCriteriaRated,
	type EvaluationSectionRated,
	isCriteria,
	type EvaluationGrid,
} from "~~/types/evaluation";
import type { Software, SoftwareType, SoftwareVersion } from "~~/types/software";
import { getLicenseDescription } from "./licenses";
import { convertLegacyLanguageCode, convertLanguageCodeToLegacy } from "./language";
import { nanoid } from "nanoid";

function removePathSeparators(value: string): string {
	return value.replace(/[/\\]/g, '-')
}

function createElement(
	tag: string,
	content: string | null | boolean | (string | false)[] = null,
	attributes: { [key: string]: string } = {},
): string {
	const attrs = Object.entries(attributes)
		.map(([key, value]) => `${key}="${value}"`)
		.join(" ");
	const openTag = attrs ? `<${tag} ${attrs}>` : `<${tag}>`;
	const closeTag = `</${tag}>`;
	return content
		? `${openTag}${Array.isArray(content) ? content.filter((c) => !!c).join("\n") : content}${closeTag}`
		: `${openTag}${closeTag}`;
}

function convertCriteriaToLegacyXML(
	criteria: EvaluationCriteria,
	criteriaRated: EvaluationCriteriaRated
): string {
	return createElement(
		"element",
		[
			criteria.description != null &&
			createElement("desc", criteria.description),
			createElement("desc0", criteria.desc0),
			createElement("desc1", criteria.desc1),
			createElement("desc2", criteria.desc2),
			...("score" in criteriaRated
				? [
					createElement("score", criteriaRated.score.toString()),
					createElement("comment", criteriaRated.comment),
				]
				: []),
		],
		{
			name: criteria.ref,
			title: criteria.name,
		},
	);
}

function convertEvaluationSectionToLegacyXML(section: EvaluationSection, sectionRated: EvaluationSectionRated): string {
	return createElement(
		"element",
		[
			section.description != null && createElement("desc", section.description),
			...(section.sections ?? []).map((subsection, i) => {
				if (isCriteria(subsection)) {
					const subsectionRated = sectionRated.sections[i] as EvaluationCriteriaRated;
					return convertCriteriaToLegacyXML(subsection, subsectionRated);
				}
				return convertEvaluationSectionToLegacyXML(subsection, sectionRated.sections[i] as EvaluationSectionRated);
			}),
		],
		{
			name: sectionRated.ref,
			title: section.name,
		},
	);
}

export function convertEvaluationToLegacyXML(evaluation: Evaluation): string {
	let xml = '<?xml version="1.0" encoding="UTF-8"?>';
	xml += "<document>";
	xml += "<header>";
	xml += createElement("evaluationuid", evaluation.evaluationUid);
	xml += "<authors>";
	for (const author of evaluation.authors) {
		xml += createElement("author", [
			createElement("name", author.name),
			createElement("email", author.email),
		]);
	}
	xml += "</authors>";
	xml += "<dates>";
	xml += createElement("creation", evaluation.createdAt);
	xml += createElement("validation", evaluation.updatedAt);
	xml += "</dates>";
	xml += createElement("language", convertLanguageCodeToLegacy(evaluation.language));
	xml += createElement("appname", evaluation.software.name);
	xml += createElement("release", evaluation.softwareVersion.version);
	xml += createElement("date", evaluation.softwareVersion.dateAdded);
	xml += createElement("licenseid", evaluation.software.licenseId.toString());
	xml += createElement("licensedesc", getLicenseDescription(evaluation.software.licenseId.toString()));
	xml += createElement("url", evaluation.software.url);
	xml += createElement("desc", evaluation.software.description);
	xml += createElement("demourl", evaluation.software.demoUrl);
	xml += createElement("qsosformat", evaluation.grid.qsosVersion);
	xml += createElement("qsosappfamily", evaluation.software.type.uid);
	xml += createElement("qsosappname", evaluation.software.name);
	xml += createElement("qsosspecificformat", evaluation.grid.gridVersion);
	xml += "</header>";

	const grid = evaluation.grid

	grid.sections.forEach((section, i) => {
		const sectionRef = evaluation.sections[i]?.ref || section.name;
		xml += `<section name="${sectionRef}" title="${section.name}">`;
		if (section.description != null)
			xml += createElement("desc", section.description);
		if (section.sections != null) {
			section.sections.forEach((subsection, j) => {
				if (isCriteria(subsection)) {
					const criteriaRated = evaluation.sections[i]?.sections[j] as EvaluationCriteriaRated
					xml += convertCriteriaToLegacyXML(subsection, criteriaRated);
				} else {
					const sectionRated = evaluation.sections[i]?.sections[j] as EvaluationSectionRated
					xml += convertEvaluationSectionToLegacyXML(subsection, sectionRated);
				}
			})
		}
		xml += "</section>";
	})
	xml += "</document>";
	return xml;
}

type SectionGridAndRateCombined = { criteria: EvaluationCriteria; criteriaRated?: EvaluationCriteriaRated } | { section: EvaluationSection; sectionRated: EvaluationSectionRated }

function parseElement(
	element: Record<string, unknown>,
	language: string
): SectionGridAndRateCombined {
	if (Array.isArray(element.element)) {
		// this is a section 
		const sectionsParsed = element.element.map(el => parseElement(el, language));
		const sections = sectionsParsed.map((s) => "section" in s ? s.section : s.criteria);
		const sectionsRated = sectionsParsed.map((s => "section" in s ? s.sectionRated : s.criteriaRated));

		const section: EvaluationSection = {
			ref: element['@_name'] as string,
			name: element['@_title'] as string,
			description: element.desc as string,
			sections
		}

		const sectionRated: EvaluationSectionRated = {
			ref: element['@_name'] as string,
			sections: sectionsRated.filter((s) => s !== undefined)
		}

		return { section, sectionRated };
	}

	const hasScoreDescriptions = element.desc0 || element.desc1 || element.desc2;
	const hasScore = "score" in element;


	if (!hasScoreDescriptions && !hasScore) {
		const section: EvaluationSection = {
			ref: element['@_name'] as string,
			name: element['@_title'] as string,
			description: element.desc as string,
			sections: []
		}

		const sectionRated: EvaluationSectionRated = {
			ref: element['@_name'] as string,
			sections: []
		}

		return { section, sectionRated };
	}

	// Default descriptions based on language
	const defaults = language?.toLowerCase() === 'fr'
		? {
			desc0: "Non disponible",
			desc1: "Partiellement possible",
			desc2: "Possible"
		}
		: {
			desc0: "Functionality not covered",
			desc1: "Functionality partially covered",
			desc2: "Functionality fully covered"
		};

	const criteria: EvaluationCriteria = {
		ref: element['@_name'] as string,
		name: element['@_title'] as string,
		description: element.desc as string,
		desc0: (element.desc0 as string) || defaults.desc0,
		desc1: (element.desc1 as string) || defaults.desc1,
		desc2: (element.desc2 as string) || defaults.desc2
	}

	let criteriaRated: EvaluationCriteriaRated | undefined = undefined;

	if (hasScore) {
		const scoreValue = element.score;
		let parsedScore: number;

		if (typeof scoreValue === 'number') {
			parsedScore = scoreValue;
		} else if (typeof scoreValue === 'string' && scoreValue.trim() !== '') {
			parsedScore = Number.parseInt(scoreValue, 10);
		} else {
			parsedScore = NaN;
		}

		criteriaRated = {
			ref: element['@_name'] as string,
			score: parsedScore,
			comment: (element.comment ?? "") as string,
			sources: (element.sources ?? "") as string
		}
	}

	return { criteria, criteriaRated }
}

export function parseLegacyXMLToEvaluation(
	xml: string,
): Evaluation {
	const parser = new XMLParser({ ignoreAttributes: false });
	const result = parser.parse(xml);
	const document = result.document;
	const header = document.header;
	const authorsData = header.authors?.author;
	const authors = (Array.isArray(authorsData) ? authorsData : (authorsData ? [authorsData] : []))
		.filter((a: any) => a && (a.email?.trim() || a.name?.trim()));
	const dates = header.dates ?? {};
	const createdAt = (dates.creation && dates.creation.trim() !== "") ? dates.creation : new Date().toISOString();
	const updatedAt = (dates.validation && dates.validation.trim() !== "") ? dates.validation : new Date().toISOString();
	const language = convertLegacyLanguageCode(header.language);
	const sections = Array.isArray(document.section) ? document.section : [document.section];
	const hasGenericSection = sections.some((section: Record<string, unknown>) =>
		section['@_name'] === 'generic' || section['@_name'] === 'Section générique' || section['@_name'] === 'maturité' || section['@_name'] === 'Maturité'
	);

	const softwareType: SoftwareType = {
		uid: header.qsosappfamily,
		name: header.qsosappfamily,
		description: "",
	};

	const qsosVersion = hasGenericSection
		? String(header.qsosformat ?? "2.0")
		: "2.0";

	const grid: EvaluationGrid = {
		softwareType,
		gridVersion: header.qsosspecificformat?.toString(),
		qsosVersion,
		createdAt,
		updatedAt,
		sections: [],
		creatorEmail: authors?.[0]?.email,
		changeLog: "imported from legacy XML"

	}

	const releaseVersion = header.release?.toString()?.trim() || "";
	const softwareVersion: SoftwareVersion = {
		version: removePathSeparators(releaseVersion),
		dateAdded: header.date || new Date().toISOString(),
		summary: "imported from legacy XML"
	};

	const software: Software = {
		type: softwareType,
		versions: [softwareVersion],
		uid: removePathSeparators(header.appname),
		name: header.appname,
		description: header.desc,
		url: header.url,
		demoUrl: header.demourl,
		licenseId: header.licenseid || "",
	}

	const sectionsParsed: {
		ref: string;
		title: string;
		description: string;
		sections: SectionGridAndRateCombined[];
	}[] = (
		Array.isArray(document.section) ? document.section : [document.section]
	).map((section: Record<string, unknown>) => {
		const elements = Array.isArray(section.element)
			? section.element
			: [section.element];
		return {
			ref: section['@_name'],
			title: section['@_title'],
			description: section.desc,
			sections: elements.map(el => parseElement(el, header.language)),
		};
	});

	const evaluation: Evaluation = {
		evaluationUid: header.evaluationuid ?? nanoid(), // Assuming UID is not present in the XML and needs to be generated		
		authors,
		language,
		createdAt,
		updatedAt,
		sections: [],
		software,
		softwareVersion,
		grid
	}

	sectionsParsed.forEach((sectionParsed) => {
		grid.sections.push({
			ref: sectionParsed.ref,
			name: sectionParsed.title,
			description: sectionParsed.description,
			sections: sectionParsed.sections.map((s) => "section" in s ? s.section : s.criteria)
		});

		evaluation.sections.push({
			ref: sectionParsed.ref,
			sections: sectionParsed.sections.map((s) => "section" in s ? s.sectionRated : s.criteriaRated).filter((s) => s !== undefined)
		});
	})

	return evaluation
}

function pathLabel(path: number[]): string {
	return path.length === 1 ? `Section ${path[0]}` : `Subsection ${path.join(".")}`;
}

function ensureSectionNames(
	sections: (EvaluationSection | undefined)[] = [],
	path: number[] = []
): { sections: EvaluationSection[]; missingSections: number; missingSubsections: number } {
	let missingSections = 0;
	let missingSubsections = 0;

	const processedSections = sections.map((sec, i) => {
		const current = [...path, i + 1];

		const src: EvaluationSection = sec ?? { ref: "", name: "", description: "", sections: [] };

		let name = src.name;
		if (!name || name.trim() === "") {
			name = pathLabel(current);
			if (path.length === 0) {
				missingSections++;
			} else {
				missingSubsections++;
			}
		}

		const normalizedChildren = (src.sections ?? [])
			.map((sub) => {
				if (isCriteria(sub)) return sub;
				const result = ensureSectionNames([sub as EvaluationSection], current);
				missingSections += result.missingSections;
				missingSubsections += result.missingSubsections;
				return result.sections[0];
			})
			.filter((x): x is EvaluationSection | EvaluationCriteria => x != null);

		return { ...src, name, sections: normalizedChildren };
	});

	return { sections: processedSections, missingSections, missingSubsections };
}

function ensureCriteriaNames(
	sections: EvaluationSection[]
): { sections: EvaluationSection[]; missingCount: number } {
	let missingCount = 0;
	let criterionCounter = 0;

	const walk = (items: (EvaluationSection | EvaluationCriteria)[]): (EvaluationSection | EvaluationCriteria)[] =>
		items.map((item) => {
			if (isCriteria(item)) {
				criterionCounter++;
				if (!item.name || item.name.trim() === "") {
					missingCount++;
					const fallback = `Criterion ${criterionCounter}`;
					return { ...item, name: fallback };
				}
				return item;
			}
			return { ...item, sections: walk(item.sections ?? []) };
		});

	const processedSections = walk(sections) as EvaluationSection[];

	return { sections: processedSections, missingCount };
}

function isRatedSectionNode(
	item: EvaluationSectionRated | EvaluationCriteriaRated,
): item is EvaluationSectionRated {
	return (item as EvaluationSectionRated).sections !== undefined;
}

function cleanRatedSections(
	sections: (EvaluationSectionRated | EvaluationCriteriaRated | undefined)[] = []
): (EvaluationSectionRated | EvaluationCriteriaRated)[] {
	return sections
		.filter((x): x is EvaluationSectionRated | EvaluationCriteriaRated => x != null)
		.map((entry) => {
			if (isRatedSectionNode(entry)) {
				return { ...entry, sections: cleanRatedSections(entry.sections as any) };
			}
			return entry;
		});
}

export type ValidationMessage = { type: "warning" | "error"; message: string };

export function validateCriteriaScores(evaluation: Evaluation): ValidationMessage[] {
	const messages: ValidationMessage[] = [];
	let hasMissing = false;

	const scan = (node: EvaluationSectionRated | EvaluationCriteriaRated | undefined) => {
		if (!node) return;
		if (isRatedSectionNode(node)) {
			node.sections?.forEach(scan);
			return;
		}
		const has = typeof node.score === "number" && !Number.isNaN(node.score as any);
		if (!has) {
			hasMissing = true;
		}
	};

	evaluation.sections?.forEach((s) => s.sections?.forEach(scan));

	if (hasMissing) {
		messages.push({
			type: "error",
			message: `Some criteria are missing scores. Complete every score before importing this evaluation.`,
		});
	}
	return messages;
}

export function getMissingScoreRefs(evaluation: Evaluation): string[] {
	const missing: string[] = [];
	const scan = (node: EvaluationSectionRated | EvaluationCriteriaRated | undefined) => {
		if (!node) return;
		if (isRatedSectionNode(node)) {
			node.sections?.forEach(scan);
			return;
		}
		const has = typeof node.score === "number" && !Number.isNaN(node.score as any);
		if (!has) missing.push(node.ref);
	};
	evaluation.sections?.forEach((s) => s.sections?.forEach(scan));
	return missing;
}

export function validateAndFixQSOSXML(evaluation: Evaluation, loggedInUserEmail?: string): ValidationMessage[] {
	const messages: ValidationMessage[] = [];
	const push = (type: "warning" | "error", message: string) => messages.push({ type, message });

	if (loggedInUserEmail) {
		const previous = evaluation.grid.creatorEmail;
		evaluation.grid.creatorEmail = loggedInUserEmail;

		if (!previous) {
			push("warning", `Setting creator email to ${loggedInUserEmail}.`);
		} else if (previous !== loggedInUserEmail) {
			push("warning", `Creator email changed from ${previous} to ${loggedInUserEmail}.`);
		}

		const authors = evaluation.authors ?? [];
		const hasImporter = authors.some((a: any) => a?.email === loggedInUserEmail);

		if (authors.length === 0) {
			evaluation.authors = [{ email: loggedInUserEmail, name: loggedInUserEmail }];
			push("warning", `No authors found → added current user (${loggedInUserEmail}).`);
		} else if (!hasImporter) {
			evaluation.authors = [...authors, { email: loggedInUserEmail, name: loggedInUserEmail }];
			push("warning", `Importer author (${loggedInUserEmail}) has been added to authors list.`);
		}
	} else {
		if (!evaluation.authors || evaluation.authors.length === 0) {
			push("warning", "No author detected and no logged-in user.");
		}
	}

	if (!evaluation.softwareVersion.version || evaluation.softwareVersion.version.trim() === "") {
		push("error", "Software version is missing. Please provide a valid version number.");
		return messages;
	}

	const hasGenericSection = evaluation.grid.sections?.some(
		section => section.name === "generic" || section.name === "Section générique" || section.name === "maturité" || section.name === "Maturité"
	);

	if (hasGenericSection && evaluation.grid.qsosVersion !== "2.0") {
		push("warning", `Legacy QSOS version ${evaluation.grid.qsosVersion} detected with generic section.`);
	} else if (!hasGenericSection && evaluation.grid.qsosVersion !== "2.0") {
		push("warning", `QSOS version set to 2.0 (no generic section found).`);
	}

	if (!evaluation.grid.gridVersion || String(evaluation.grid.gridVersion).trim() === "") {
		evaluation.grid.gridVersion = "1.0";
		push("warning", "No evaluation grid version found → defaulted to 1.0.");
	} else {
		// Ensure gridVersion is in X.Y format (e.g., "1.0" not "1")
		const gridVersionStr = String(evaluation.grid.gridVersion);
		if (!gridVersionStr.includes('.')) {
			evaluation.grid.gridVersion = `${gridVersionStr}.0`;
		}
	}

	const sectionResult = ensureSectionNames(evaluation.grid.sections);
	evaluation.grid.sections = sectionResult.sections;

	if (sectionResult.missingSections > 0) {
		push("warning", `Sections without labels detected: automatic renaming to "Section X.X".`);
	}
	if (sectionResult.missingSubsections > 0) {
		push("warning", `Subsections without labels detected: automatic renaming to "Subsection X.X".`);
	}

	const criteriaResult = ensureCriteriaNames(evaluation.grid.sections);
	evaluation.grid.sections = criteriaResult.sections;

	if (criteriaResult.missingCount > 0) {
		push("warning", `Criteria without labels detected: automatic renaming to "Criterion X.X".`);
	}

	evaluation.sections = (evaluation.sections ?? []).map((s) => ({
		ref: s.ref,
		sections: cleanRatedSections(s.sections as any),
	}));

	return messages;
}

