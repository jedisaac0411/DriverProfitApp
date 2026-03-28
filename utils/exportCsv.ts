import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getEarningsEntries, getExpenseEntries } from './storage';
import { getCurrency } from './appSettings';
import { getCurrencySymbol } from './currency';

export async function exportDataToCSV() {
  const [earnings, expenses, currencyCode] = await Promise.all([
    getEarningsEntries(),
    getExpenseEntries(),
    getCurrency(),
  ]);

  const currencySymbol = getCurrencySymbol(currencyCode);

  let csv = '';

  csv += 'SETTINGS\n';
  csv += `Currency,${currencyCode}\n`;
  csv += `Currency Symbol,${currencySymbol}\n\n`;

  csv += 'EARNINGS\n';
  csv += 'Date,Platform,Base Earnings,Tips,Bonus,Hours,Distance,Trips\n';

  earnings.forEach((e) => {
    csv += `${new Date(e.date).toLocaleDateString()},${e.platform},${e.earnings},${e.tips},${e.bonus},${e.hours},${e.distance},${e.trips}\n`;
  });

  csv += '\n';

  csv += 'EXPENSES\n';
  csv += 'Date,Category,Amount,Note\n';

  expenses.forEach((e) => {
    csv += `${new Date(e.date).toLocaleDateString()},${e.category},${e.amount},${e.note ?? ''}\n`;
  });

  const fileUri = FileSystem.documentDirectory + 'gig_profit_report.csv';

  await FileSystem.writeAsStringAsync(fileUri, csv);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri);
  } else {
    alert('Sharing is not available on this device');
  }
}