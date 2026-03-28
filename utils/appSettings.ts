import AsyncStorage from '@react-native-async-storage/async-storage';

const CUSTOM_PLATFORMS_KEY = 'custom_platforms';
const CUSTOM_EXPENSE_CATEGORIES_KEY = 'custom_expense_categories';
const DISTANCE_UNIT_KEY = 'distance_unit';
const CURRENCY_KEY = 'currency_code';

export type DistanceUnit = 'mi' | 'km';

export async function getCustomPlatforms(): Promise<string[]> {
  try {
    const value = await AsyncStorage.getItem(CUSTOM_PLATFORMS_KEY);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

export async function saveCustomPlatforms(platforms: string[]): Promise<void> {
  await AsyncStorage.setItem(CUSTOM_PLATFORMS_KEY, JSON.stringify(platforms));
}

export async function addCustomPlatform(platform: string): Promise<string[]> {
  const current = await getCustomPlatforms();
  const cleaned = platform.trim();

  if (!cleaned) return current;
  if (current.some((p) => p.toLowerCase() === cleaned.toLowerCase())) return current;

  const updated = [...current, cleaned];
  await saveCustomPlatforms(updated);
  return updated;
}

export async function removeCustomPlatform(platform: string): Promise<string[]> {
  const current = await getCustomPlatforms();
  const updated = current.filter((p) => p !== platform);
  await saveCustomPlatforms(updated);
  return updated;
}

export async function getCustomExpenseCategories(): Promise<string[]> {
  try {
    const value = await AsyncStorage.getItem(CUSTOM_EXPENSE_CATEGORIES_KEY);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

export async function saveCustomExpenseCategories(categories: string[]): Promise<void> {
  await AsyncStorage.setItem(
    CUSTOM_EXPENSE_CATEGORIES_KEY,
    JSON.stringify(categories)
  );
}

export async function addCustomExpenseCategory(category: string): Promise<string[]> {
  const current = await getCustomExpenseCategories();
  const cleaned = category.trim();

  if (!cleaned) return current;
  if (current.some((c) => c.toLowerCase() === cleaned.toLowerCase())) return current;

  const updated = [...current, cleaned];
  await saveCustomExpenseCategories(updated);
  return updated;
}

export async function removeCustomExpenseCategory(category: string): Promise<string[]> {
  const current = await getCustomExpenseCategories();
  const updated = current.filter((c) => c !== category);
  await saveCustomExpenseCategories(updated);
  return updated;
}

export async function getDistanceUnit(): Promise<DistanceUnit> {
  try {
    const value = await AsyncStorage.getItem(DISTANCE_UNIT_KEY);
    if (value === 'km') return 'km';
    return 'mi';
  } catch {
    return 'mi';
  }
}

export async function saveDistanceUnit(unit: DistanceUnit): Promise<void> {
  await AsyncStorage.setItem(DISTANCE_UNIT_KEY, unit);
}

export async function getCurrency(): Promise<string> {
  try {
    const value = await AsyncStorage.getItem(CURRENCY_KEY);
    return value || 'USD';
  } catch {
    return 'USD';
  }
}

export async function saveCurrency(currencyCode: string): Promise<void> {
  await AsyncStorage.setItem(CURRENCY_KEY, currencyCode);
}