import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { getEarningsEntries, getExpenseEntries } from "../../utils/storage";
import { exportDataToCSV } from '../../utils/exportCsv';
import { TouchableOpacity } from 'react-native';

type PlatformTotals = {
  platform: string;
  total: number;
};

type ExpenseCategoryTotals = {
  category: string;
  total: number;
};

const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
  const [todayProfit, setTodayProfit] = useState(0);
  const [weekProfit, setWeekProfit] = useState(0);
  const [monthProfit, setMonthProfit] = useState(0);

  const [todayEarnings, setTodayEarnings] = useState(0);
  const [todayExpenses, setTodayExpenses] = useState(0);

  const [todayProfitPerHour, setTodayProfitPerHour] = useState(0);
  const [weekProfitPerHour, setWeekProfitPerHour] = useState(0);
  const [monthProfitPerHour, setMonthProfitPerHour] = useState(0);

  const [platformTotals, setPlatformTotals] = useState<PlatformTotals[]>([]);
  const [bestPlatform, setBestPlatform] = useState<PlatformTotals | null>(null);

  const [expenseCategoryTotals, setExpenseCategoryTotals] = useState<
    ExpenseCategoryTotals[]
  >([]);

  const loadReports = async () => {
    const earningsEntries = await getEarningsEntries();
    const expenseEntries = await getExpenseEntries();

    const now = new Date();

    const isToday = (dateString: string) => {
      const d = new Date(dateString);
      return d.toDateString() === now.toDateString();
    };

    const isThisWeek = (dateString: string) => {
      const d = new Date(dateString);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return d >= startOfWeek && d <= now;
    };

    const isThisMonth = (dateString: string) => {
      const d = new Date(dateString);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    };

    const todayEarningsEntries = earningsEntries.filter((entry) =>
      isToday(entry.date),
    );
    const todayExpenseEntries = expenseEntries.filter((entry) =>
      isToday(entry.date),
    );

    const weekEarningsEntries = earningsEntries.filter((entry) =>
      isThisWeek(entry.date),
    );
    const weekExpenseEntries = expenseEntries.filter((entry) =>
      isThisWeek(entry.date),
    );

    const monthEarningsEntries = earningsEntries.filter((entry) =>
      isThisMonth(entry.date),
    );
    const monthExpenseEntries = expenseEntries.filter((entry) =>
      isThisMonth(entry.date),
    );

    const earningsToday = todayEarningsEntries.reduce(
      (sum, entry) => sum + entry.earnings + entry.tips + entry.bonus,
      0,
    );

    const expensesToday = todayExpenseEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0,
    );

    const earningsWeek = weekEarningsEntries.reduce(
      (sum, entry) => sum + entry.earnings + entry.tips + entry.bonus,
      0,
    );

    const expensesWeek = weekExpenseEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0,
    );

    const earningsMonth = monthEarningsEntries.reduce(
      (sum, entry) => sum + entry.earnings + entry.tips + entry.bonus,
      0,
    );

    const expensesMonth = monthExpenseEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0,
    );

    const todayHours = todayEarningsEntries.reduce(
      (sum, entry) => sum + entry.hours,
      0,
    );
    const weekHours = weekEarningsEntries.reduce(
      (sum, entry) => sum + entry.hours,
      0,
    );
    const monthHours = monthEarningsEntries.reduce(
      (sum, entry) => sum + entry.hours,
      0,
    );

    const todayNet = earningsToday - expensesToday;
    const weekNet = earningsWeek - expensesWeek;
    const monthNet = earningsMonth - expensesMonth;

    const todayPPH = todayHours > 0 ? todayNet / todayHours : 0;
    const weekPPH = weekHours > 0 ? weekNet / weekHours : 0;
    const monthPPH = monthHours > 0 ? monthNet / monthHours : 0;

    const platformMap: Record<string, number> = {};
    monthEarningsEntries.forEach((entry) => {
      const total = entry.earnings + entry.tips + entry.bonus;
      platformMap[entry.platform] = (platformMap[entry.platform] || 0) + total;
    });

    const platformSummary = Object.entries(platformMap)
      .map(([platform, total]) => ({ platform, total }))
      .sort((a, b) => b.total - a.total);

    const expenseMap: Record<string, number> = {};
    monthExpenseEntries.forEach((entry) => {
      expenseMap[entry.category] =
        (expenseMap[entry.category] || 0) + entry.amount;
    });

    const expenseSummary = Object.entries(expenseMap)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    setTodayEarnings(earningsToday);
    setTodayExpenses(expensesToday);

    setTodayProfit(todayNet);
    setWeekProfit(weekNet);
    setMonthProfit(monthNet);

    setTodayProfitPerHour(todayPPH);
    setWeekProfitPerHour(weekPPH);
    setMonthProfitPerHour(monthPPH);

    setPlatformTotals(platformSummary);
    setBestPlatform(platformSummary.length > 0 ? platformSummary[0] : null);

    setExpenseCategoryTotals(expenseSummary);
  };

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, []),
  );

  const topPlatforms = platformTotals.slice(0, 5);

  const chartData = {
    labels: topPlatforms.map((item) =>
      item.platform.length > 8
        ? item.platform.slice(0, 8) + "…"
        : item.platform,
    ),
    datasets: [
      {
        data:
          topPlatforms.length > 0
            ? topPlatforms.map((item) => item.total)
            : [0],
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#1E1E1E",
    backgroundGradientTo: "#1E1E1E",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    fillShadowGradient: "#4CAF50",
    fillShadowGradientOpacity: 1,
    barPercentage: 0.7,
    propsForBackgroundLines: {
      stroke: "#2A2A2A",
    },
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Reports</Text>
      <Text style={styles.subtitle}>Track your performance over time</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Today’s Earnings</Text>
        <Text style={styles.cardValue}>${todayEarnings.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Today’s Expenses</Text>
        <Text style={styles.cardValue}>${todayExpenses.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Today’s Profit</Text>
        <Text style={styles.profitValue}>${todayProfit.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>This Week’s Profit</Text>
        <Text style={styles.profitValue}>${weekProfit.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>This Month’s Profit</Text>
        <Text style={styles.profitValue}>${monthProfit.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Profit Per Hour</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Today</Text>
          <Text style={styles.rowValue}>
            ${todayProfitPerHour.toFixed(2)}/hr
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>This Week</Text>
          <Text style={styles.rowValue}>
            ${weekProfitPerHour.toFixed(2)}/hr
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>This Month</Text>
          <Text style={styles.rowValue}>
            ${monthProfitPerHour.toFixed(2)}/hr
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Best Platform This Month</Text>
        {bestPlatform ? (
          <View style={styles.bestPlatformBox}>
            <Text style={styles.bestPlatformName}>{bestPlatform.platform}</Text>
            <Text style={styles.bestPlatformAmount}>
              ${bestPlatform.total.toFixed(2)}
            </Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>No earnings data yet</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Top Platform Earnings</Text>
        {topPlatforms.length === 0 ? (
          <Text style={styles.emptyText}>No earnings data yet</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={chartData}
              width={Math.max(screenWidth - 60, topPlatforms.length * 90)}
              height={240}
              yAxisLabel="$"
              fromZero
              chartConfig={chartConfig}
              style={styles.chart}
            />
          </ScrollView>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Earnings by Platform</Text>
        {platformTotals.length === 0 ? (
          <Text style={styles.emptyText}>No earnings data yet</Text>
        ) : (
          platformTotals.map((item) => (
            <View key={item.platform} style={styles.platformRow}>
              <Text style={styles.platformName}>{item.platform}</Text>
              <Text style={styles.platformAmount}>
                ${item.total.toFixed(2)}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Expense Breakdown This Month</Text>
        {expenseCategoryTotals.length === 0 ? (
          <Text style={styles.emptyText}>No expense data yet</Text>
        ) : (
          expenseCategoryTotals.map((item) => (
            <View key={item.category} style={styles.platformRow}>
              <Text style={styles.platformName}>{item.category}</Text>
              <Text style={styles.expenseAmount}>${item.total.toFixed(2)}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Export Data</Text>
        <TouchableOpacity style={styles.exportButton} onPress={exportDataToCSV}>
          <Text style={styles.exportButtonText}>Export Earnings & Expenses (CSV)</Text>
          </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#121212",
    flexGrow: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#A1A1AA",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  cardLabel: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 8,
  },
  cardValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  profitValue: {
    color: "#4CAF50",
    fontSize: 24,
    fontWeight: "700",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  rowLabel: {
    color: "#D1D5DB",
    fontSize: 16,
  },
  rowValue: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "700",
  },
  bestPlatformBox: {
    backgroundColor: "#2A2A2A",
    borderRadius: 14,
    padding: 14,
  },
  bestPlatformName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  bestPlatformAmount: {
    color: "#4CAF50",
    fontSize: 22,
    fontWeight: "700",
  },
  chart: {
    marginTop: 6,
    borderRadius: 16,
  },
  platformRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  platformName: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  platformAmount: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "700",
  },
  expenseAmount: {
    color: "#F59E0B",
    fontSize: 16,
    fontWeight: "700",
  },
  exportButton: {
  backgroundColor: '#2563EB',
  paddingVertical: 14,
  borderRadius: 12,
  alignItems: 'center',
},
  exportButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '700',
},
});
