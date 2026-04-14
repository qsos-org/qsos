import type { LanguageCode } from "~~/types/language";

export const Language: Record<LanguageCode, { name: string }> = {
	"en-us": { name: "English" },
	"es-es": { name: "Español" },
	"fr-fr": { name: "Français" },
	"de-de": { name: "Deutsch" },
	"it-it": { name: "Italiano" },
	"pt-pt": { name: "Português" },
	"pt-br": { name: "Português (Brasil)" },
	"nl-nl": { name: "Nederlands" },
	"pl-pl": { name: "Polski" },
	"ru-ru": { name: "Русский" },
	"zh-cn": { name: "中文" },
	"ja-jp": { name: "日本語" },
	"ko-kr": { name: "한국어" },
	"tr-tr": { name: "Türkçe" },
	"ar-sa": { name: "العربية" },
	"he-il": { name: "עברית" },
	"hi-in": { name: "हिन्दी" },
	"th-th": { name: "ไทย" },
	"vi-vn": { name: "Tiếng Việt" },
};


export function convertLegacyLanguageCode(legacyCode: string): LanguageCode {
	const code = legacyCode?.toLowerCase() || "en";
	const languageMap: Record<string, LanguageCode> = {
		"en": "en-us",
		"fr": "fr-fr",
		"es": "es-es",
		"de": "de-de",
		"it": "it-it",
		"pt": "pt-pt",
		"nl": "nl-nl",
		"pl": "pl-pl",
		"ru": "ru-ru",
		"zh": "zh-cn",
		"ja": "ja-jp",
		"ko": "ko-kr",
		"tr": "tr-tr",
		"ar": "ar-sa",
		"he": "he-il",
		"hi": "hi-in",
		"th": "th-th",
	};
	return languageMap[code] || "en-us";
}

export function convertLanguageCodeToLegacy(languageCode: LanguageCode): string {
	const reverseMap: Record<LanguageCode, string> = {
		"en-us": "en",
		"fr-fr": "fr",
		"es-es": "es",
		"de-de": "de",
		"it-it": "it",
		"pt-pt": "pt",
		"pt-br": "pt-br",
		"nl-nl": "nl",
		"pl-pl": "pl",
		"ru-ru": "ru",
		"zh-cn": "zh",
		"ja-jp": "ja",
		"ko-kr": "ko",
		"tr-tr": "tr",
		"ar-sa": "ar",
		"he-il": "he",
		"hi-in": "hi",
		"th-th": "th",
		"vi-vn": "vi",
	};
	return reverseMap[languageCode] || "en";
}
