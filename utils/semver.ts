// Compare two semantic version strings (X.Y.Z format)
export const compareSemver = (a: string, b: string): number => {
    const aParts = a.split('.').map(p => parseInt(p, 10));
    const bParts = b.split('.').map(p => parseInt(p, 10));

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aPart = aParts[i] || 0;
        const bPart = bParts[i] || 0;
        if (aPart !== bPart) {
            return aPart - bPart;
        }
    }
    return 0;
};