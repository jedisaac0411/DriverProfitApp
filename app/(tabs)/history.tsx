import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ExpenseEntry,
  EarningsEntry,
  deleteEarningsEntry,
  deleteExpenseEntry,
  getEarningsEntries,
  getExpenseEntries,
  updateEarningsEntry,
  updateExpenseEntry,
} from '../../utils/storage';

type HistoryFilter = 'all' | 'earnings' | 'expenses';

type EditableHistoryItem =
  | (EarningsEntry & { entryType: 'earnings' })
  | (ExpenseEntry & { entryType: 'expense' });

export default function HistoryScreen() {
  const [earningsEntries, setEarningsEntries] = useState<EarningsEntry[]>([]);
  const [expenseEntries, setExpenseEntries] = useState<ExpenseEntry[]>([]);
  const [filter, setFilter] = useState<HistoryFilter>('all');

  const [editVisible, setEditVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EditableHistoryItem | null>(null);

  const [editPlatform, setEditPlatform] = useState('');
  const [editEarnings, setEditEarnings] = useState('');
  const [editTips, setEditTips] = useState('');
  const [editBonus, setEditBonus] = useState('');
  const [editHours, setEditHours] = useState('');
  const [editDistance, setEditDistance] = useState('');
  const [editTrips, setEditTrips] = useState('');

  const [editCategory, setEditCategory] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editNote, setEditNote] = useState('');

  const loadHistory = async () => {
    const earnings = await getEarningsEntries();
    const expenses = await getExpenseEntries();

    setEarningsEntries(earnings);
    setExpenseEntries(expenses);
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const handleDelete = (id: string, entryType: 'earnings' | 'expense') => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (entryType === 'earnings') {
            await deleteEarningsEntry(id);
          } else {
            await deleteExpenseEntry(id);
          }
          loadHistory();
        },
      },
    ]);
  };

  const handleOpenEdit = (item: EditableHistoryItem) => {
    setSelectedItem(item);

    if (item.entryType === 'earnings') {
      setEditPlatform(item.platform);
      setEditEarnings(String(item.earnings));
      setEditTips(String(item.tips));
      setEditBonus(String(item.bonus));
      setEditHours(String(item.hours));
      setEditDistance(String(item.distance));
      setEditTrips(String(item.trips));
    } else {
      setEditCategory(item.category);
      setEditAmount(String(item.amount));
      setEditNote(item.note ?? '');
    }

    setEditVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;

    if (selectedItem.entryType === 'earnings') {
      const updatedEntry: EarningsEntry = {
        ...selectedItem,
        platform: editPlatform,
        earnings: parseFloat(editEarnings) || 0,
        tips: parseFloat(editTips) || 0,
        bonus: parseFloat(editBonus) || 0,
        hours: parseFloat(editHours) || 0,
        distance: parseFloat(editDistance) || 0,
        trips: parseInt(editTrips || '0', 10) || 0,
      };

      await updateEarningsEntry(updatedEntry);
    } else {
      const updatedEntry: ExpenseEntry = {
        ...selectedItem,
        category: editCategory,
        amount: parseFloat(editAmount) || 0,
        note: editNote,
      };

      await updateExpenseEntry(updatedEntry);
    }

    setEditVisible(false);
    setSelectedItem(null);
    await loadHistory();
    Alert.alert('Saved', 'Entry updated successfully.');
  };

  const combinedHistory: EditableHistoryItem[] = [
    ...earningsEntries.map((entry) => ({
      ...entry,
      entryType: 'earnings' as const,
    })),
    ...expenseEntries.map((entry) => ({
      ...entry,
      entryType: 'expense' as const,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredHistory = combinedHistory.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'earnings') return item.entryType === 'earnings';
    if (filter === 'expenses') return item.entryType === 'expense';
    return true;
  });

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>View your saved earnings and expenses</Text>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'all' && styles.activeFilterChip]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === 'all' && styles.activeFilterChipText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'earnings' && styles.activeFilterChip]}
            onPress={() => setFilter('earnings')}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === 'earnings' && styles.activeFilterChipText,
              ]}
            >
              Earnings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'expenses' && styles.activeFilterChip]}
            onPress={() => setFilter('expenses')}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === 'expenses' && styles.activeFilterChipText,
              ]}
            >
              Expenses
            </Text>
          </TouchableOpacity>
        </View>

        {filteredHistory.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No history yet</Text>
            <Text style={styles.emptyText}>
              Your saved earnings and expenses will appear here.
            </Text>
          </View>
        ) : (
          filteredHistory.map((item) => {
            const formattedDate = new Date(item.date).toLocaleString();

            if (item.entryType === 'earnings') {
              const totalIncome = item.earnings + item.tips + item.bonus;

              return (
                <View key={`earnings-${item.id}`} style={styles.card}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.earningsBadge}>Earnings</Text>
                    <Text style={styles.dateText}>{formattedDate}</Text>
                  </View>

                  <Text style={styles.mainTitle}>{item.platform}</Text>
                  <Text style={styles.greenValue}>${totalIncome.toFixed(2)}</Text>

                  <View style={styles.detailsBox}>
                    <Text style={styles.detailText}>Base: ${item.earnings.toFixed(2)}</Text>
                    <Text style={styles.detailText}>Tips: ${item.tips.toFixed(2)}</Text>
                    <Text style={styles.detailText}>Bonus: ${item.bonus.toFixed(2)}</Text>
                    <Text style={styles.detailText}>Hours: {item.hours}</Text>
                    <Text style={styles.detailText}>Distance: {item.distance}</Text>
                    <Text style={styles.detailText}>Trips/Orders: {item.trips}</Text>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleOpenEdit(item)}
                    >
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(item.id, 'earnings')}
                    >
                      <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }

            return (
              <View key={`expense-${item.id}`} style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={styles.expenseBadge}>Expense</Text>
                  <Text style={styles.dateText}>{formattedDate}</Text>
                </View>

                <Text style={styles.mainTitle}>{item.category}</Text>
                <Text style={styles.redValue}>-${item.amount.toFixed(2)}</Text>

                <View style={styles.detailsBox}>
                  <Text style={styles.detailText}>
                    Note: {item.note?.trim() ? item.note : 'No note'}</Text>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleOpenEdit(item)}
                  >
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item.id, 'expense')}
                  >
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={editVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Edit Entry</Text>

              {selectedItem?.entryType === 'earnings' ? (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Platform"
                    placeholderTextColor="#888"
                    value={editPlatform}
                    onChangeText={setEditPlatform}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Base Earnings"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    value={editEarnings}
                    onChangeText={setEditEarnings}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Tips"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    value={editTips}
                    onChangeText={setEditTips}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Bonus"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    value={editBonus}
                    onChangeText={setEditBonus}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Hours"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    value={editHours}
                    onChangeText={setEditHours}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Distance"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    value={editDistance}
                    onChangeText={setEditDistance}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Trips / Orders"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    value={editTrips}
                    onChangeText={setEditTrips}
                  />
                </>
              ) : (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Category"
                    placeholderTextColor="#888"
                    value={editCategory}
                    onChangeText={setEditCategory}
                  />
                
                  <TextInput
                    style={styles.input}
                    placeholder="Amount"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    value={editAmount}
                    onChangeText={setEditAmount}
                  />
                  <TextInput
                    style={[styles.input, styles.noteInput]}
                    placeholder="Note"
                    placeholderTextColor="#888"
                    multiline
                    value={editNote}
                    onChangeText={setEditNote}
                  />
                </>
              )}

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setEditVisible(false)}
                >
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveEdit}
                >
                  <Text style={styles.actionButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
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
  filterRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  filterChip: {
    backgroundColor: '#1E1E1E',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginRight: 10,
  },
  activeFilterChip: {
    backgroundColor: '#4CAF50',
  },
  filterChipText: {
    color: '#D1D5DB',
    fontWeight: '600',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },
  emptyCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 18,
    padding: 20,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: '#A1A1AA',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    color: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    fontWeight: '700',
    overflow: 'hidden',
  },
  expenseBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#EF4444',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    fontWeight: '700',
    overflow: 'hidden',
  },
  dateText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6,
  },
  greenValue: {
    color: '#4CAF50',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  redValue: {
    color: '#EF4444',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  detailsBox: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 12,
  },
  detailText: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#B91C1C',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 18,
    maxHeight: '85%',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 14,
  },
  input: {
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
    fontSize: 17,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  noteInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#52525B',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
});