import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatMoney, format } from '../../utils/format';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { getEarningsEntries, getExpenseEntries } from '../../utils/storage';
import { exportDataToCSV } from '../../utils/exportCsv';
import { getCurrency } from '../../utils/appSettings';
import { getCurrencySymbol } from '../../utils/currency';

type PlatformTotals = {
  platform: string;
  total: number;
};

type ExpenseCategoryTotals = {
  category: string;
  total: number;
};

type ChartRange = 'week' | 'month' | 'year';

type EarningsEntry = {
  platform: string;
  earnings: number;
  tips: number;
  bonus: number;
  hours: number;
  trips?: number;
  date: string;
};

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
  const [currencySymbol, setCurrencySymbol] = useState('$');

  const [todayProfit, setTodayProfit] = useState(0);
  const [weekProfit, setWeekProfit] = useState(0);
  const [monthProfit, setMonthProfit] = useState(0);
  const [yearProfit, setYearProfit] = useState(0);

  const [todayEarnings, setTodayEarnings] = useState(0);
  const [todayExpenses, setTodayExpenses] = useState(0);
  const [todayTrips, setTodayTrips] = useState(0);
  const [todayProfitPerHour, setTodayProfitPerHour] = useState(0);

  const [platformTotals, setPlatformTotals] = useState<PlatformTotals[]>([]);
  const [bestPlatform, setBestPlatform] = useState<PlatformTotals | null>(null);
  const [expenseCategoryTotals, setExpenseCategoryTotals] = useState<
    ExpenseCategoryTotals[]
  >([]);

  const [selectedRange, setSelectedRange] = useState<ChartRange>('week');
  const [earningsEntriesState, setEarningsEntriesState] = useState<EarningsEntry[]>([]);

  const performanceScrollRef = useRef<ScrollView>(null);

  const loadReports = async () => {
    const [earningsEntries, expenseEntries, currencyCode] = await Promise.all([
      getEarningsEntries() as Promise<EarningsEntry[]>,
      getExpenseEntries(),
      getCurrency(),
    ]);

    setCurrencySymbol(getCurrencySymbol(currencyCode));
    setEarningsEntriesState(earningsEntries);

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
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    };

    const isThisYear = (dateString: string) => {
      const d = new Date(dateString);
      return d.getFullYear() === now.getFullYear();
    };

    const todayEarningsEntries = earningsEntries.filter((entry) =>
      isToday(entry.date)
    );
    const todayExpenseEntries = expenseEntries.filter((entry) =>
      isToday(entry.date)
    );

    const weekEarningsEntries = earningsEntries.filter((entry) =>
      isThisWeek(entry.date)
    );
    const weekExpenseEntries = expenseEntries.filter((entry) =>
      isThisWeek(entry.date)
    );

    const monthEarningsEntries = earningsEntries.filter((entry) =>
      isThisMonth(entry.date)
    );
    const monthExpenseEntries = expenseEntries.filter((entry) =>
      isThisMonth(entry.date)
    );

    const yearEarningsEntries = earningsEntries.filter((entry) =>
      isThisYear(entry.date)
    );
    const yearExpenseEntries = expenseEntries.filter((entry) =>
      isThisYear(entry.date)
    );

    const earningsToday = todayEarningsEntries.reduce(
      (sum, entry) => sum + entry.earnings + entry.tips + entry.bonus,
      0
    );

    const expensesToday = todayExpenseEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );

    const earningsWeek = weekEarningsEntries.reduce(
      (sum, entry) => sum + entry.earnings + entry.tips + entry.bonus,
      0
    );

    const expensesWeek = weekExpenseEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );

    const earningsMonth = monthEarningsEntries.reduce(
      (sum, entry) => sum + entry.earnings + entry.tips + entry.bonus,
      0
    );

    const expensesMonth = monthExpenseEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );

    const earningsYear = yearEarningsEntries.reduce(
      (sum, entry) => sum + entry.earnings + entry.tips + entry.bonus,
      0
    );

    const expensesYear = yearExpenseEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );

    const todayHours = todayEarningsEntries.reduce(
      (sum, entry) => sum + entry.hours,
      0
    );

    const todayTripsTotal = todayEarningsEntries.reduce(
      (sum, entry) => sum + (entry.trips || 0),
      0
    );

    const todayNet = earningsToday - expensesToday;
    const weekNet = earningsWeek - expensesWeek;
    const monthNet = earningsMonth - expensesMonth;
    const yearNet = earningsYear - expensesYear;

    const todayPPH = todayHours > 0 ? todayNet / todayHours : 0;

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
    setYearProfit(yearNet);
    setTodayProfitPerHour(todayPPH);
    setTodayTrips(todayTripsTotal);
    setPlatformTotals(platformSummary);
    setBestPlatform(platformSummary.length > 0 ? platformSummary[0] : null);
    setExpenseCategoryTotals(expenseSummary);
  };

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [])
  );

  const topPlatforms = platformTotals.slice(0, 5);

  const platformChartData = {
    labels:
      topPlatforms.length > 0
        ? topPlatforms.map((item) =>
            item.platform.length > 8
              ? item.platform.slice(0, 8) + '…'
              : item.platform
          )
        : ['No Data'],
    datasets: [
      {
        data:
          topPlatforms.length > 0
            ? topPlatforms.map((item) => item.total)
            : [0],
      },
    ],
  };

  const performanceChartData = useMemo(() => {
    const now = new Date();

    if (selectedRange === 'week') {
      const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const buckets = [0, 0, 0, 0, 0, 0, 0];

      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      earningsEntriesState.forEach((entry) => {
        const d = new Date(entry.date);
        if (d >= startOfWeek && d <= now) {
          const total = entry.earnings + entry.tips + entry.bonus;
          buckets[d.getDay()] += total;
        }
      });

      return { labels, data: buckets };
    }

    if (selectedRange === 'month') {
      const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).getDate();

      const labels = Array.from({ length: daysInMonth }, (_, i) =>
        String(i + 1)
      );
      const buckets = Array.from({ length: daysInMonth }, () => 0);

      earningsEntriesState.forEach((entry) => {
        const d = new Date(entry.date);
        if (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        ) {
          const total = entry.earnings + entry.tips + entry.bonus;
          buckets[d.getDate() - 1] += total;
        }
      });

      return { labels, data: buckets };
    }

    const labels = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const buckets = Array.from({ length: 12 }, () => 0);

    earningsEntriesState.forEach((entry) => {
      const d = new Date(entry.date);
      if (d.getFullYear() === now.getFullYear()) {
        const total = entry.earnings + entry.tips + entry.bonus;
        buckets[d.getMonth()] += total;
      }
    });

    return { labels, data: buckets };
  }, [selectedRange, earningsEntriesState]);

  const performanceData = {
    labels: performanceChartData.labels,
    datasets: [
      {
        data:
          performanceChartData.data.length > 0
            ? performanceChartData.data
            : [0],
      },
    ],
  };

  const maxPerformanceValue = Math.max(
    ...performanceData.datasets[0].data,
    0
  );

  const yAxisMarks = [
    maxPerformanceValue,
    maxPerformanceValue * 0.66,
    maxPerformanceValue * 0.33,
    0,
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      performanceScrollRef.current?.scrollToEnd({ animated: false });
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedRange, performanceData.labels.length]);

  const chartConfig = {
    backgroundGradientFrom: '#1E1E1E',
    backgroundGradientTo: '#1E1E1E',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    fillShadowGradient: '#4CAF50',
    fillShadowGradientOpacity: 1,
    barPercentage: 0.7,
    propsForBackgroundLines: {
      stroke: '#2A2A2A',
    },
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Reports</Text>
      <Text style={styles.subtitle}>Track your earnings, profit, and trends</Text>

      <View style={styles.summaryGrid}>
        <View style={styles.fullWidthSummaryCard}>
          <Text style={styles.cardLabel}>Today’s Earnings</Text>
          <Text style={styles.heroValue}>{formatMoney(currencySymbol, todayEarnings)}</Text>
          <Text style={styles.subtleHelperText}>Total revenue before expenses</Text>
        </View>

        <View style={styles.fullWidthProfitCard}>
          <Text style={styles.cardLabel}>This Year’s Profit</Text>
          <Text
            style={[
              styles.yearProfitValue,
              { color: yearProfit >= 0 ? '#4CAF50' : '#EF4444' },
            ]}
          >
            {formatMoney(currencySymbol, yearProfit)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Today’s Expenses</Text>
          <Text style={styles.cardValue}>{formatMoney(currencySymbol, todayExpenses)}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Today’s Profit</Text>
          <Text
            style={[
              styles.todayProfitValue,
              { color: todayProfit >= 0 ? '#4CAF50' : '#EF4444' },
            ]}
          >
            {formatMoney(currencySymbol, todayProfit)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>This Week’s Profit</Text>
          <Text
            style={[
              styles.profitValue,
              { color: weekProfit >= 0 ? '#4CAF50' : '#EF4444' },
            ]}
          >
            {formatMoney(currencySymbol, weekProfit)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>This Month’s Profit</Text>
          <Text
            style={[
              styles.profitValue,
              { color: monthProfit >= 0 ? '#4CAF50' : '#EF4444' },
            ]}
          >
            {formatMoney(currencySymbol, monthProfit)}
          </Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.cardLabel}>Today’s Trips / Orders</Text>
          <Text style={styles.metricValue}>{todayTrips}</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.cardLabel}>Today’s Profit Per Hour</Text>
          <Text
            style={[
              styles.metricValue,
              { color: todayProfitPerHour >= 0 ? '#4CAF50' : '#EF4444' },
            ]}
          >
            {formatMoney(currencySymbol, todayProfitPerHour)}/hr
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Earnings Performance</Text>

        <View style={styles.filterRow}>
          {(['week', 'month', 'year'] as ChartRange[]).map((range) => (
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
                {range === 'week'
                  ? 'Week'
                  : range === 'month'
                  ? 'Month'
                  : 'Year'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.performanceChartWrapper}>
          <View style={styles.fixedYAxis}>
            {yAxisMarks.map((value, index) => (
              <Text key={index} style={styles.yAxisText}>
                {formatMoney(currencySymbol, value)}
              </Text>
            ))}
          </View>

          <ScrollView
            ref={performanceScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <BarChart
              data={performanceData}
              width={Math.max(screenWidth - 120, performanceData.labels.length * 55)}
              height={240}
              yAxisLabel={currencySymbol}
              fromZero
              withHorizontalLabels={false}
              chartConfig={chartConfig}
              style={styles.chart}
            />
          </ScrollView>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Best Platform This Month</Text>
        {bestPlatform ? (
          <View style={styles.bestPlatformBox}>
            <Text style={styles.bestPlatformName}>{bestPlatform.platform}</Text>
            <Text style={styles.bestPlatformAmount}>
              {formatMoney(currencySymbol, bestPlatform.total)}
            </Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>No earnings data yet</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>This Month’s Platform Earnings</Text>
        {topPlatforms.length === 0 ? (
          <Text style={styles.emptyText}>No earnings data yet</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={platformChartData}
              width={Math.max(screenWidth - 60, topPlatforms.length * 90)}
              height={240}
              yAxisLabel={currencySymbol}
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
              <Text style={styles.platformAmount}>{formatMoney(currencySymbol, item.total)}</Text>
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
              <Text style={styles.expenseAmount}>{formatMoney(currencySymbol, item.total)}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Export Data</Text>
        <TouchableOpacity style={styles.exportButton} onPress={exportDataToCSV}>
          <Text style={styles.exportButtonText}>
            Export Earnings & Expenses (CSV)
          </Text>
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  fullWidthSummaryCard: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 18,
    paddingTop: 24,
    paddingBottom: 18,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  fullWidthProfitCard: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#1E1E1E',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#1E1E1E',
    borderRadius: 18,
    padding: 16,
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
  heroValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 4,
  },
  subtleHelperText: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 6,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  todayProfitValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  yearProfitValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  profitValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  emptyText: {
    color: '#A1A1AA',
    fontSize: 15,
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
  performanceChartWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  fixedYAxis: {
    width: 56,
    height: 240,
    justifyContent: 'space-between',
    paddingBottom: 28,
    paddingTop: 12,
    marginRight: 8,
  },
  yAxisText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  bestPlatformBox: {
    backgroundColor: '#2A2A2A',
    borderRadius: 14,
    padding: 14,
  },
  bestPlatformName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  bestPlatformAmount: {
    color: '#4CAF50',
    fontSize: 22,
    fontWeight: '700',
  },
  chart: {
    marginTop: 6,
    borderRadius: 16,
  },
  platformRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  platformName: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  platformAmount: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '700',
  },
  expenseAmount: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '700',
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