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
} from '../../utils/appSettings';

export default function SettingsScreen() {
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('mi');

  const [customPlatforms, setCustomPlatforms] = useState<string[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  const [newPlatform, setNewPlatform] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const loadSettings = async () => {
    const [unit, platforms, categories] = await Promise.all([
      getDistanceUnit(),
      getCustomPlatforms(),
      getCustomExpenseCategories(),
    ]);

    setDistanceUnit(unit);
    setCustomPlatforms(platforms);
    setCustomCategories(categories);
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Customize your app experience</Text>

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