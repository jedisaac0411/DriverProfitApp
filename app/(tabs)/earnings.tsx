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
import { saveEarningsEntry } from '../../utils/storage';
import { getCustomPlatforms, getDistanceUnit } from '../../utils/appSettings';

const defaultPlatforms = [
  'Uber',
  'Uber Eats',
  'Lyft',
  'DoorDash',
  'Amazon Flex',
  'Instacart',
  'Grab',
  'GrabFood'
];

export default function EarningsScreen() {
  const [platforms, setPlatforms] = useState<string[]>(defaultPlatforms);
  const [distanceUnit, setDistanceUnit] = useState<'mi' | 'km'>('mi');

  const [selectedPlatform, setSelectedPlatform] = useState('Uber');
  const [earnings, setEarnings] = useState('');
  const [tips, setTips] = useState('');
  const [bonus, setBonus] = useState('');
  const [hours, setHours] = useState('');
  const [distance, setDistance] = useState('');
  const [trips, setTrips] = useState('');

  const loadSettings = async () => {
    const [customPlatforms, unit] = await Promise.all([
      getCustomPlatforms(),
      getDistanceUnit(),
    ]);

    const mergedPlatforms = [...defaultPlatforms, ...customPlatforms];
    setPlatforms(mergedPlatforms);
    setDistanceUnit(unit);

    if (!mergedPlatforms.includes(selectedPlatform)) {
      setSelectedPlatform(mergedPlatforms[0] || 'Uber');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [selectedPlatform])
  );

  const handleSave = async () => {
    const entry = {
      id: Date.now().toString(),
      platform: selectedPlatform,
      earnings: parseFloat(earnings) || 0,
      tips: parseFloat(tips) || 0,
      bonus: parseFloat(bonus) || 0,
      hours: parseFloat(hours) || 0,
      distance: parseFloat(distance) || 0,
      trips: parseInt(trips || '0', 10) || 0,
      date: new Date().toISOString(),
    };

    await saveEarningsEntry(entry);

    setEarnings('');
    setTips('');
    setBonus('');
    setHours('');
    setDistance('');
    setTrips('');

    Alert.alert('Saved', 'Earnings entry saved successfully.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Earnings</Text>
      <Text style={styles.subtitle}>Log your shift income by platform</Text>

      <Text style={styles.sectionTitle}>Platform</Text>
      <View style={styles.platformGrid}>
        {platforms.map((platform) => (
          <TouchableOpacity
            key={platform}
            style={[
              styles.platformCard,
              selectedPlatform === platform && styles.activePlatformCard,
            ]}
            onPress={() => setSelectedPlatform(platform)}
          >
            <Text
              style={[
                styles.platformCardText,
                selectedPlatform === platform && styles.activePlatformCardText,
              ]}
            >
              {platform}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Base Earnings ($)"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={earnings}
          onChangeText={setEarnings}
        />
        <TextInput
          style={styles.input}
          placeholder="Tips ($)"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={tips}
          onChangeText={setTips}
        />
        <TextInput
          style={styles.input}
          placeholder="Bonus ($)"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={bonus}
          onChangeText={setBonus}
        />
        <TextInput
          style={styles.input}
          placeholder="Hours Worked"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={hours}
          onChangeText={setHours}
        />
        <TextInput
          style={styles.input}
          placeholder={`Distance (${distanceUnit})`}
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={distance}
          onChangeText={setDistance}
        />
        <TextInput
          style={styles.input}
          placeholder="Trips / Orders"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={trips}
          onChangeText={setTrips}
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Earnings</Text>
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
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  platformCard: {
    width: '48%',
    backgroundColor: '#1E1E1E',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  activePlatformCard: {
    backgroundColor: '#4CAF50',
  },
  platformCardText: {
    color: '#D1D5DB',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  activePlatformCardText: {
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