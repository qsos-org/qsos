export function getRefFromName(name: string) {
    return name
        .toLowerCase() // force casing
        .trim() // remove leading/trailing spaces
        .replace(/ /g, '_') // replace inner spaces with underscores
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // replace diacritics
}

export function pickRandomIn<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)] as T;
}