import AsyncStorage from '@react-native-async-storage/async-storage';

const EARNINGS_KEY = 'earnings_entries';
const EXPENSES_KEY = 'expense_entries';

export type EarningsEntry = {
  id: string;
  platform: string;
  earnings: number;
  tips: number;
  bonus: number;
  hours: number;
  distance: number;
  trips: number;
  date: string;
};

export type ExpenseEntry = {
  id: string;
  category: string;
  amount: number;
  note: string;
  date: string;
};

export async function getEarningsEntries(): Promise<EarningsEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(EARNINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error reading earnings entries:', error);
    return [];
  }
}

export async function saveEarningsEntry(entry: EarningsEntry): Promise<void> {
  try {
    const existing = await getEarningsEntries();
    const updated = [entry, ...existing];
    await AsyncStorage.setItem(EARNINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving earnings entry:', error);
  }
}

export async function getExpenseEntries(): Promise<ExpenseEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(EXPENSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error reading expense entries:', error);
    return [];
  }
}

export async function saveExpenseEntry(entry: ExpenseEntry): Promise<void> {
  try {
    const existing = await getExpenseEntries();
    const updated = [entry, ...existing];
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving expense entry:', error);
  }
}

export async function deleteEarningsEntry(id: string): Promise<void> {
  try {
    const existing = await getEarningsEntries();
    const updated = existing.filter((entry) => entry.id !== id);
    await AsyncStorage.setItem(EARNINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error deleting earnings entry:', error);
  }
}

export async function deleteExpenseEntry(id: string): Promise<void> {
  try {
    const existing = await getExpenseEntries();
    const updated = existing.filter((entry) => entry.id !== id);
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error deleting expense entry:', error);
  }
}

export async function updateEarningsEntry(
  updatedEntry: EarningsEntry
): Promise<void> {
  try {
    const existing = await getEarningsEntries();
    const updated = existing.map((entry) =>
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    await AsyncStorage.setItem(EARNINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating earnings entry:', error);
  }
}

export async function updateExpenseEntry(
  updatedEntry: ExpenseEntry
): Promise<void> {
  try {
    const existing = await getExpenseEntries();
    const updated = existing.map((entry) =>
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating expense entry:', error);
  }
}