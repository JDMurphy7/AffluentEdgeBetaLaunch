import { JournalEntry } from './types';
export declare class EntryManager {
  constructor();
  createEntry(entry: JournalEntry): void;
  updateEntry(index: number, updatedEntry: JournalEntry): void;
  getEntries(): JournalEntry[];
  analyzeTrade(entry: JournalEntry): void;
}
