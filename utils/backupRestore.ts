import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

const BACKUP_FILE_NAME = 'gig_profit_tracker_backup.json';

export async function backupAppData() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const entries = await AsyncStorage.multiGet(keys);

    const backupObject: Record<string, string | null> = {};
    entries.forEach(([key, value]) => {
      backupObject[key] = value;
    });

    const json = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        app: 'Gig Profit Tracker',
        data: backupObject,
      },
      null,
      2
    );

    const fileUri = FileSystem.documentDirectory + BACKUP_FILE_NAME;

    await FileSystem.writeAsStringAsync(fileUri, json);

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri);
      return { success: true };
    }

    return {
      success: false,
      message: 'Sharing is not available on this device.',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to create backup file.',
      error,
    };
  }
}

export async function restoreAppData() {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets?.length) {
      return {
        success: false,
        message: 'Restore canceled.',
      };
    }

    const file = result.assets[0];
    const content = await FileSystem.readAsStringAsync(file.uri);
    const parsed = JSON.parse(content);

    if (!parsed?.data || typeof parsed.data !== 'object') {
      return {
        success: false,
        message: 'Invalid backup file.',
      };
    }

    const restoreEntries: [string, string][] = Object.entries(parsed.data)
      .filter(([_, value]) => value !== null)
      .map(([key, value]) => [key, value as string]);

    await AsyncStorage.multiSet(restoreEntries);

    return {
      success: true,
      message: 'Backup restored successfully.',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to restore backup.',
      error,
    };
  }
}

export async function clearAllAppData() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys);

    return {
      success: true,
      message: 'All app data cleared.',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to clear data.',
      error,
    };
  }
}