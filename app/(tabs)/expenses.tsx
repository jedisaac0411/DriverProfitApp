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
import { saveExpenseEntry } from '../../utils/storage';
import { getCustomExpenseCategories, getCurrency } from '../../utils/appSettings';
import { getCurrencySymbol } from '../../utils/currency';

const defaultCategories = [
  'Gas',
  'Parking',
  'Tolls',
  'Maintenance',
  'Insurance',
  'Car Wash',
  'Phone/Data',
  'Other',
];

export default function ExpensesScreen() {
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [selectedCategory, setSelectedCategory] = useState('Gas');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const loadCategories = async () => {
    const [customCategories, currencyCode] = await Promise.all([
      getCustomExpenseCategories(),
      getCurrency(),
    ]);

    const merged = [...defaultCategories, ...customCategories];
    setCategories(merged);
    setCurrencySymbol(getCurrencySymbol(currencyCode));

    if (!merged.includes(selectedCategory)) {
      setSelectedCategory(merged[0] || 'Gas');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [selectedCategory])
  );

  const handleSave = async () => {
    const entry = {
      id: Date.now().toString(),
      category: selectedCategory,
      amount: parseFloat(amount) || 0,
      note,
      date: new Date().toISOString(),
    };

    await saveExpenseEntry(entry);

    setAmount('');
    setNote('');

    Alert.alert('Saved', 'Expense entry saved successfully.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Expenses</Text>
      <Text style={styles.subtitle}>Track your business costs</Text>

      <Text style={styles.sectionTitle}>Category</Text>
      <View style={styles.categoryGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.gridChip,
              selectedCategory === category && styles.activeGridChip,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.gridChipText,
                selectedCategory === category && styles.activeGridChipText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder={`Amount (${currencySymbol})`}
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Optional note"
          placeholderTextColor="#888"
          value={note}
          onChangeText={setNote}
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Expense</Text>
        </TouchableOpacity>
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
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gridChip: {
    width: '48%',
    backgroundColor: '#1E1E1E',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 10,
    alignItems: 'center',
  },
  activeGridChip: {
    backgroundColor: '#4CAF50',
  },
  gridChipText: {
    color: '#D1D5DB',
    fontWeight: '600',
    fontSize: 14,
  },
  activeGridChipText: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 18,
    padding: 16,
  },
  input: {
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
    fontSize: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  noteInput: {
    minHeight: 100,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});