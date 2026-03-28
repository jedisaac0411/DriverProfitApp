import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  addCustomExpenseCategory,
  addCustomPlatform,
  DistanceUnit,
  getCustomExpenseCategories,
  getCustomPlatforms,
  getDistanceUnit,
  removeCustomExpenseCategory,
  removeCustomPlatform,
  saveDistanceUnit,
  getCurrency,
  saveCurrency,
} from '../../utils/appSettings';
import {
  backupAppData,
  clearAllAppData,
  restoreAppData,
} from '../../utils/backupRestore';
import { currencyOptions, getCurrencyLabel } from '../../utils/currency';

export default function SettingsScreen() {
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('mi');
  const [currencyCode, setCurrencyCode] = useState('USD');

  const [customPlatforms, setCustomPlatforms] = useState<string[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  const [newPlatform, setNewPlatform] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const loadSettings = async () => {
    const [unit, platforms, categories, curr] = await Promise.all([
      getDistanceUnit(),
      getCustomPlatforms(),
      getCustomExpenseCategories(),
      getCurrency(),
    ]);

    setDistanceUnit(unit);
    setCustomPlatforms(platforms);
    setCustomCategories(categories);
    setCurrencyCode(curr);
  };

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const handleAddPlatform = async () => {
    const updated = await addCustomPlatform(newPlatform);
    setCustomPlatforms(updated);
    setNewPlatform('');
  };

  const handleRemovePlatform = async (platform: string) => {
    const updated = await removeCustomPlatform(platform);
    setCustomPlatforms(updated);
  };

  const handleAddCategory = async () => {
    const updated = await addCustomExpenseCategory(newCategory);
    setCustomCategories(updated);
    setNewCategory('');
  };

  const handleRemoveCategory = async (category: string) => {
    const updated = await removeCustomExpenseCategory(category);
    setCustomCategories(updated);
  };

  const handleDistanceUnitChange = async (unit: DistanceUnit) => {
    setDistanceUnit(unit);
    await saveDistanceUnit(unit);
    Alert.alert('Saved', `Distance unit set to ${unit}.`);
  };

  const handleCurrencyChange = async (code: string) => {
    setCurrencyCode(code);
    await saveCurrency(code);
    Alert.alert('Saved', `Currency set to ${getCurrencyLabel(code)}.`);
  };

  const handleBackup = async () => {
    const result = await backupAppData();
    if (!result.success) {
      Alert.alert('Backup Failed', result.message || 'Unable to back up data.');
    }
  };

  const handleRestore = async () => {
    Alert.alert(
      'Restore Backup',
      'Restoring will overwrite current saved app data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            const result = await restoreAppData();

            if (result.success) {
              await loadSettings();
              Alert.alert('Success', result.message || 'Backup restored.');
            } else if (result.message !== 'Restore canceled.') {
              Alert.alert(
                'Restore Failed',
                result.message || 'Unable to restore backup.'
              );
            }
          },
        },
      ]
    );
  };

  const handleClearData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all earnings, expenses, settings, and custom entries. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await clearAllAppData();

            if (result.success) {
              await loadSettings();
              setDistanceUnit('mi');
              setCurrencyCode('USD');
              setNewPlatform('');
              setNewCategory('');
              Alert.alert('Deleted', result.message);
            } else {
              Alert.alert('Error', result.message || 'Unable to clear data.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Customize your app experience</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Backup & Restore</Text>

        <TouchableOpacity style={styles.actionButton} onPress={handleBackup}>
          <Text style={styles.actionButtonText}>Backup Data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleRestore}>
          <Text style={styles.actionButtonText}>Restore Data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleClearData}
        >
          <Text style={styles.actionButtonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Currency</Text>
        {currencyOptions.map((currency) => (
          <TouchableOpacity
            key={currency.code}
            style={[
              styles.listOption,
              currencyCode === currency.code && styles.activeListOption,
            ]}
            onPress={() => handleCurrencyChange(currency.code)}
          >
            <Text
              style={[
                styles.listOptionText,
                currencyCode === currency.code && styles.activeListOptionText,
              ]}
            >
              {currency.code} ({currency.symbol}) — {currency.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Distance Unit</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              distanceUnit === 'mi' && styles.activeOptionButton,
            ]}
            onPress={() => handleDistanceUnitChange('mi')}
          >
            <Text
              style={[
                styles.optionButtonText,
                distanceUnit === 'mi' && styles.activeOptionButtonText,
              ]}
            >
              Miles (mi)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              distanceUnit === 'km' && styles.activeOptionButton,
            ]}
            onPress={() => handleDistanceUnitChange('km')}
          >
            <Text
              style={[
                styles.optionButtonText,
                distanceUnit === 'km' && styles.activeOptionButtonText,
              ]}
            >
              Kilometers (km)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Custom Platforms</Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add custom platform"
            placeholderTextColor="#888"
            value={newPlatform}
            onChangeText={setNewPlatform}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddPlatform}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {customPlatforms.length === 0 ? (
          <Text style={styles.emptyText}>No custom platforms yet</Text>
        ) : (
          customPlatforms.map((platform) => (
            <View key={platform} style={styles.listItem}>
              <Text style={styles.listItemText}>{platform}</Text>
              <TouchableOpacity onPress={() => handleRemovePlatform(platform)}>
                <Text style={styles.deleteText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Custom Expense Categories</Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add custom category"
            placeholderTextColor="#888"
            value={newCategory}
            onChangeText={setNewCategory}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {customCategories.length === 0 ? (
          <Text style={styles.emptyText}>No custom categories yet</Text>
        ) : (
          customCategories.map((category) => (
            <View key={category} style={styles.listItem}>
              <Text style={styles.listItemText}>{category}</Text>
              <TouchableOpacity onPress={() => handleRemoveCategory(category)}>
                <Text style={styles.deleteText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#121212',
    flexGrow: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#A1A1AA',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeOptionButton: {
    backgroundColor: '#4CAF50',
  },
  optionButtonText: {
    color: '#D1D5DB',
    fontWeight: '600',
  },
  activeOptionButtonText: {
    color: '#FFFFFF',
  },
  listOption: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  activeListOption: {
    backgroundColor: '#4CAF50',
  },
  listOptionText: {
    color: '#D1D5DB',
    fontWeight: '600',
    fontSize: 15,
  },
  activeListOptionText: {
    color: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  addButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    marginBottom: 0,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    color: '#A1A1AA',
    fontSize: 14,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  listItemText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  deleteText: {
    color: '#EF4444',
    fontWeight: '700',
  },
});