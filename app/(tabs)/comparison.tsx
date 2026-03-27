import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getEarningsEntries } from '../../utils/storage';

type RangeType = 'week' | 'month' | 'year';

type EarningsEntry = {
  platform: string;
  earnings: number;
  tips: number;
  bonus: number;
  hours: number;
  trips?: number;
  date: string;
};

type PlatformStats = {
  platform: string;
  earnings: number;
  hours: number;
  trips: number;
  earningsPerHour: number;
};

export default function ComparisonScreen() {
  const [selectedRange, setSelectedRange] = useState<RangeType>('week');
  const [platformStats, setPlatformStats] = useState<PlatformStats[]>([]);
  const [topPlatform, setTopPlatform] = useState<PlatformStats | null>(null);

  const loadData = async () => {
    const entries = (await getEarningsEntries()) as EarningsEntry[];
    const now = new Date();

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

    const filteredEntries = entries.filter((entry) => {
      if (selectedRange === 'week') return isThisWeek(entry.date);
      if (selectedRange === 'month') return isThisMonth(entry.date);
      return isThisYear(entry.date);
    });

    const platformMap: Record<string, PlatformStats> = {};

    filteredEntries.forEach((entry) => {
      const totalEarnings = entry.earnings + entry.tips + entry.bonus;

      if (!platformMap[entry.platform]) {
        platformMap[entry.platform] = {
          platform: entry.platform,
          earnings: 0,
          hours: 0,
          trips: 0,
          earningsPerHour: 0,
        };
      }

      platformMap[entry.platform].earnings += totalEarnings;
      platformMap[entry.platform].hours += entry.hours;
      platformMap[entry.platform].trips += entry.trips || 0;
    });

    const platformArray = Object.values(platformMap).map((item) => ({
      ...item,
      earningsPerHour:
        item.hours > 0 ? item.earnings / item.hours : 0,
    }));

    platformArray.sort((a, b) => b.earningsPerHour - a.earningsPerHour);

    setPlatformStats(platformArray);
    setTopPlatform(platformArray.length > 0 ? platformArray[0] : null);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedRange])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Platform Performance</Text>
      <Text style={styles.subtitle}>
        Compare which platform earns you the most
      </Text>

      <View style={styles.filterRow}>
        {(['week', 'month', 'year'] as RangeType[]).map((range) => (
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

      {topPlatform && (
        <View style={styles.topCard}>
          <Text style={styles.topLabel}>Top Platform</Text>
          <Text style={styles.topPlatformName}>{topPlatform.platform}</Text>
          <Text style={styles.topPlatformValue}>
            ${topPlatform.earningsPerHour.toFixed(2)}/hr
          </Text>
        </View>
      )}

      {platformStats.length === 0 ? (
        <Text style={styles.emptyText}>No data available</Text>
      ) : (
        platformStats.map((item) => (
          <View key={item.platform} style={styles.platformCard}>
            <View style={styles.platformHeader}>
              <Text style={styles.platformName}>{item.platform}</Text>
              {topPlatform?.platform === item.platform && (
                <Text style={styles.badge}>TOP</Text>
              )}
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Earnings</Text>
              <Text style={styles.value}>
                ${item.earnings.toFixed(2)}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Hours</Text>
              <Text style={styles.value}>
                {item.hours.toFixed(2)}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Trips</Text>
              <Text style={styles.value}>{item.trips}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Earnings / Hour</Text>
              <Text style={styles.value}>
                ${item.earningsPerHour.toFixed(2)}
              </Text>
            </View>
          </View>
        ))
      )}
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
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginRight: 8,
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
  topCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  topLabel: {
    color: '#9CA3AF',
    marginBottom: 6,
  },
  topPlatformName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  topPlatformValue: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  platformCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  platformHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  platformName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#4CAF50',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    color: '#9CA3AF',
  },
  value: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyText: {
    color: '#A1A1AA',
    marginTop: 20,
  },
});