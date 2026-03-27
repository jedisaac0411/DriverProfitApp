import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getEarningsEntries, getExpenseEntries } from '../../utils/storage';

export default function HomeScreen() {
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [todayExpenses, setTodayExpenses] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [profitPerHour, setProfitPerHour] = useState(0);

  const loadData = async () => {
    const earningsEntries = await getEarningsEntries();
    const expenseEntries = await getExpenseEntries();

    const today = new Date().toDateString();

    const todayEarningsEntries = earningsEntries.filter(
      (entry) => new Date(entry.date).toDateString() === today
    );

    const todayExpenseEntries = expenseEntries.filter(
      (entry) => new Date(entry.date).toDateString() === today
    );

    const earningsTotal = todayEarningsEntries.reduce(
      (sum, entry) => sum + entry.earnings + entry.tips + entry.bonus,
      0
    );

    const expenseTotal = todayExpenseEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );

    const totalHours = todayEarningsEntries.reduce(
      (sum, entry) => sum + entry.hours,
      0
    );

    const net = earningsTotal - expenseTotal;
    const perHour = totalHours > 0 ? net / totalHours : 0;

    setTodayEarnings(earningsTotal);
    setTodayExpenses(expenseTotal);
    setNetProfit(net);
    setProfitPerHour(perHour);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Gig Profit Tracker</Text>
      <Text style={styles.subtitle}>Overview of your driving business</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Today's Earnings</Text>
        <Text style={styles.cardValue}>${todayEarnings.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Today's Expenses</Text>
        <Text style={styles.cardValue}>${todayExpenses.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Net Profit</Text>
        <Text style={styles.highlightValue}>${netProfit.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Profit Per Hour</Text>
        <Text style={styles.cardValue}>${profitPerHour.toFixed(2)}/hr</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Best Platform</Text>
        <Text style={styles.cardValue}>Coming soon</Text>
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
    fontSize: 26,
    fontWeight: '700',
  },
  highlightValue: {
    color: '#4CAF50',
    fontSize: 26,
    fontWeight: '700',
  },
});