import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getEarningsEntries, getExpenseEntries } from '../../utils/storage';
import { getCurrency } from '../../utils/appSettings';
import { getCurrencySymbol } from '../../utils/currency';
import { formatMoney, format } from '../../utils/format';
type HomeRange = 'today' | 'week' | 'month';

type EarningsEntry = {
  platform: string;
  earnings: number;
  tips: number;
  bonus: number;
  hours: number;
  date: string;
};

type ExpenseEntry = {
  category: string;
  amount: number;
  date: string;
};

export default function HomeScreen() {
  const [selectedRange, setSelectedRange] = useState<HomeRange>('today');
  const [currencySymbol, setCurrencySymbol] = useState('$');

  const [earningsValue, setEarningsValue] = useState(0);
  const [expensesValue, setExpensesValue] = useState(0);
  const [profitValue, setProfitValue] = useState(0);
  const [profitPerHourValue, setProfitPerHourValue] = useState(0);
  const [totalHoursValue, setTotalHoursValue] = useState(0);
  const [bestPlatform, setBestPlatform] = useState('No data yet');
  const [bestPlatformAmount, setBestPlatformAmount] = useState(0);

  const getRangeLabel = () => {
    if (selectedRange === 'today') return 'Today';
    if (selectedRange === 'week') return 'This Week';
    return 'This Month';
  };

  const getBestPlatformLabel = () => {
    if (selectedRange === 'today') return 'Best Platform Today';
    if (selectedRange === 'week') return 'Best Platform This Week';
    return 'Best Platform This Month';
  };

  const loadData = async () => {
    const [earningsEntries, expenseEntries, currencyCode] = await Promise.all([
      getEarningsEntries() as Promise<EarningsEntry[]>,
      getExpenseEntries() as Promise<ExpenseEntry[]>,
      getCurrency(),
    ]);

    setCurrencySymbol(getCurrencySymbol(currencyCode));

    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const isInSelectedRange = (dateString: string) => {
      const d = new Date(dateString);

      if (selectedRange === 'today') return d >= startOfToday && d <= now;
      if (selectedRange === 'week') return d >= startOfWeek && d <= now;
      return d >= startOfMonth && d <= now;
    };

    const filteredEarningsEntries = earningsEntries.filter((entry) =>
      isInSelectedRange(entry.date)
    );

    const filteredExpenseEntries = expenseEntries.filter((entry) =>
      isInSelectedRange(entry.date)
    );

    const earningsTotal = filteredEarningsEntries.reduce(
      (sum, entry) => sum + entry.earnings + entry.tips + entry.bonus,
      0
    );

    const expenseTotal = filteredExpenseEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );

    const totalHours = filteredEarningsEntries.reduce(
      (sum, entry) => sum + entry.hours,
      0
    );

    const profit = earningsTotal - expenseTotal;
    const profitPerHour = totalHours > 0 ? profit / totalHours : 0;

    const platformMap: Record<string, number> = {};

    filteredEarningsEntries.forEach((entry) => {
      const total = entry.earnings + entry.tips + entry.bonus;
      platformMap[entry.platform] = (platformMap[entry.platform] || 0) + total;
    });

    const sortedPlatforms = Object.entries(platformMap)
      .map(([platform, total]) => ({ platform, total }))
      .sort((a, b) => b.total - a.total);

    setEarningsValue(earningsTotal);
    setExpensesValue(expenseTotal);
    setProfitValue(profit);
    setProfitPerHourValue(profitPerHour);
    setTotalHoursValue(totalHours);

    if (sortedPlatforms.length > 0) {
      setBestPlatform(sortedPlatforms[0].platform);
      setBestPlatformAmount(sortedPlatforms[0].total);
    } else {
      setBestPlatform('No data yet');
      setBestPlatformAmount(0);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedRange])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>GigProfit</Text>
      <Text style={styles.subtitle}>Overview of your current performance</Text>

      <View style={styles.filterRow}>
        {(['today', 'week', 'month'] as HomeRange[]).map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.filterChip,
              selectedRange === range && styles.activeFilterChip,
            ]}
            onPress={() => setSelectedRange(range)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedRange === range && styles.activeFilterChipText,
              ]}
            >
              {range === 'today' ? 'Today' : range === 'week' ? 'Week' : 'Month'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.cardLabel}>{getRangeLabel()} Profit</Text>
        <Text
          style={[
            styles.heroValue,
            { color: profitValue >= 0 ? '#4CAF50' : '#EF4444' },
          ]}
        >
          {formatMoney(currencySymbol, profitValue)}
        </Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.smallCard}>
          <Text style={styles.cardLabel}>{getRangeLabel()} Earnings</Text>
          <Text style={styles.cardValue}>{formatMoney(currencySymbol, earningsValue)}</Text>
        </View>

        <View style={styles.smallCard}>
          <Text style={styles.cardLabel}>{getRangeLabel()} Expenses</Text>
          <Text style={styles.cardValue}>{formatMoney(currencySymbol, expensesValue)}</Text>
        </View>

        <View style={styles.smallCard}>
          <Text style={styles.cardLabel}>{getRangeLabel()} Total Hours</Text>
          <Text style={styles.cardValue}>{totalHoursValue.toFixed(2)} hrs</Text>
        </View>

        <View style={styles.smallCard}>
          <Text style={styles.cardLabel}>{getRangeLabel()} Profit Per Hour</Text>
          <Text
            style={[
              styles.cardValue,
              { color: profitPerHourValue >= 0 ? '#4CAF50' : '#EF4444' },
            ]}
          >
            {formatMoney(currencySymbol, profitPerHourValue)}/hr
          </Text>
        </View>

        <View style={styles.fullWidthCard}>
          <Text style={styles.cardLabel}>Status</Text>
          <Text
            style={[
              styles.statusValue,
              { color: profitValue >= 0 ? '#4CAF50' : '#EF4444' },
            ]}
          >
            {profitValue >= 0 ? 'Profitable' : 'Negative'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>{getBestPlatformLabel()}</Text>
        <Text style={styles.cardValue}>{bestPlatform}</Text>
        {bestPlatform !== 'No data yet' && (
          <Text style={styles.bestPlatformAmount}>
            {formatMoney(currencySymbol, bestPlatformAmount)}
          </Text>
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
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterChip: {
    backgroundColor: '#4CAF50',
  },
  filterChipText: {
    color: '#D1D5DB',
    fontWeight: '600',
    fontSize: 14,
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },
  heroCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  heroValue: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  smallCard: {
    width: '48%',
    backgroundColor: '#1E1E1E',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  fullWidthCard: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  cardLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  cardValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  bestPlatformAmount: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
  },
  statusValue: {
    fontSize: 22,
    fontWeight: '700',
  },
});