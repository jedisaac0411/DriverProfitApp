import { StyleSheet, Text, View } from "react-native";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Customize your app later</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Currency</Text>
        <Text style={styles.cardText}>USD</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Distance Unit</Text>
        <Text style={styles.cardText}>Miles</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Custom Platforms</Text>
        <Text style={styles.cardText}>Coming soon</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Custom Expense Categories</Text>
        <Text style={styles.cardText}>Coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#121212",
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
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardText: {
    color: "#A1A1AA",
    fontSize: 15,
  },
});
