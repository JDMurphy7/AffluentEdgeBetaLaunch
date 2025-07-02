import { JournalEntry } from './types'; // Assuming there is a types file for JournalEntry
import { OptimizerAgent } from '../agents/optimizer';
import { LegacyAgent } from '../agents/legacyAgent';

export class EntryManager {
    private entries: JournalEntry[] = [];
    private optimizerAgent: OptimizerAgent;
    private legacyAgent: LegacyAgent;

    constructor() {
        this.optimizerAgent = new OptimizerAgent();
        this.legacyAgent = new LegacyAgent();
    }

    public createEntry(entry: JournalEntry): void {
        this.entries.push(entry);
    }

    public updateEntry(index: number, updatedEntry: JournalEntry): void {
        if (index >= 0 && index < this.entries.length) {
            this.entries[index] = updatedEntry;
        } else {
            throw new Error('Entry index out of bounds');
        }
    }

    public getEntries(): JournalEntry[] {
        return this.entries;
    }

    public analyzeTrade(entry: JournalEntry): void {
        try {
            this.optimizerAgent.analyzeTradeOptimized(entry);
        } catch (error) {
            this.legacyAgent.analyzeTrade(entry);
        }
    }
}