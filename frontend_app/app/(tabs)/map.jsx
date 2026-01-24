import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";
import { Bell, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";

export default function MapScreen() {
  const { isDarkMode } = useTheme();
  const router = useRouter();

  const bgColor = isDarkMode ? "#111827" : "#F9FAFB";
  const textColor = isDarkMode ? "#9CA3AF" : "#6B7280";

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.headerWrapper}>
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>OptiRide</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push("/alerts")}
              >
                <Bell color="#FFFFFF" size={24} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push("/settings")}
              >
                <User color="#FFFFFF" size={24} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* ── Map goes here ── */}
      <MapView
        provider={PROVIDER_GOOGLE}        // ← remove this line on iOS if you want Apple Maps
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: 25.276987,           // ← Dubai example
          longitude: 55.296249,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        // mapType="terrain"           // optional: hybrid / satellite / terrain
      />
    </View>
  );
}

// Your existing styles + small fix
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    backgroundColor: "#0b0f3d",
    zIndex: 100,           // ← very important!
  },
  safeArea: {
    backgroundColor: "#0b0f3d",
  },
  header: {
    backgroundColor: "#0b0f3d",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerIcons: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
});