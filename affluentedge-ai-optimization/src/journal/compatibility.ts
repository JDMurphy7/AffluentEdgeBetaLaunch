export function ensureBackwardCompatibility(entry: any): any {
    // Check for legacy fields and provide defaults if missing
    const legacyFields = {
        timestamp: entry.timestamp || new Date().toISOString(),
        userId: entry.userId || 'unknown',
        tradeDetails: entry.tradeDetails || {},
    };

    return { ...legacyFields, ...entry };
}

export function validateEntry(entry: any): boolean {
    // Ensure the entry has required fields for compatibility
    return entry && typeof entry.timestamp === 'string' && typeof entry.userId === 'string';
}

export function convertLegacyEntry(legacyEntry: any): any {
    // Convert legacy entry format to the new format if necessary
    return {
        ...legacyEntry,
        newField: legacyEntry.oldField || null, // Example of field conversion
    };
}