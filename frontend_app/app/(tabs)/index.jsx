import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { theme } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { rider } from "@/mocks/rider";
import { zones } from "@/mocks/zones";
import { useRouter } from "expo-router";
import {
  Bell,
  ClockIcon,
  MapPinIcon,
  TrendingUpIcon,
  User,
} from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Polygon, PROVIDER_DEFAULT } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const currentZone = zones.find((z) => z.code === rider.currentZone);
  const assignedZone = zones.find((z) => z.code === rider.assignedZone);
  const progressPercentage =
    (rider.deliveriesCompleted / rider.totalDeliveries) * 100;

  const bgColor = isDarkMode ? "#111827" : "#F9FAFB";

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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{rider.name}</Text>
          <StatusBadge
            status={rider.status}
            label={`Status: ${rider.status === "online" ? "Online" : "Offline"}`}
            style={styles.statusBadge}
          />
        </View>

        <TouchableOpacity
          onPress={() => router.push("/zone-change")}
          activeOpacity={0.9}
        >
          <Card style={styles.zoneCard}>
            <View style={styles.zoneHeader}>
              <MapPinIcon size={20} color={theme.colors.accent} />
              <Text style={styles.zoneTitle}>Current Zone</Text>
            </View>
            <View style={styles.zoneContent}>
              <View style={styles.zoneInfo}>
                <Text style={styles.zoneCode}>{currentZone?.code}</Text>
                <Text style={styles.zoneDescription}>
                  {currentZone?.description}
                </Text>
                <StatusBadge
                  status={currentZone?.demand || "low"}
                  label={`${currentZone?.demand} demand`}
                />
              </View>
              <View style={styles.mapPreview}>
                <MapView
                  provider={PROVIDER_DEFAULT}
                  style={styles.miniMap}
                  initialRegion={{
                    latitude: currentZone?.coordinates[0].latitude || 25.2048,
                    longitude: currentZone?.coordinates[0].longitude || 55.2708,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  pitchEnabled={false}
                  rotateEnabled={false}
                >
                  {currentZone && (
                    <Polygon
                      coordinates={currentZone.coordinates}
                      fillColor={`${currentZone.color}40`}
                      strokeColor={currentZone.color}
                      strokeWidth={2}
                    />
                  )}
                </MapView>
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        <Card style={styles.assignedCard}>
          <View style={styles.zoneHeader}>
            <TrendingUpIcon size={20} color={theme.colors.error} />
            <Text style={styles.zoneTitle}>Assigned Zone</Text>
          </View>
          <View style={styles.assignedContent}>
            <Text style={styles.assignedZoneCode}>{assignedZone?.code}</Text>
            <StatusBadge
              status={assignedZone?.demand || "high"}
              label={`${assignedZone?.demand} demand - Reassigned`}
            />
          </View>
          <Text style={styles.assignedNote}>
            Due to high demand, you have been reassigned to Zone{" "}
            {assignedZone?.code}
          </Text>
        </Card>

        <Card style={styles.shiftCard}>
          <View style={styles.zoneHeader}>
            <ClockIcon size={20} color={theme.colors.success} />
            <Text style={styles.zoneTitle}>Shift Timings</Text>
          </View>
          <View style={styles.shiftInfo}>
            <View style={styles.shiftRow}>
              <Text style={styles.shiftLabel}>Shift Type:</Text>
              <Text style={styles.shiftValue}>{rider.shiftType}</Text>
            </View>
            <View style={styles.shiftRow}>
              <Text style={styles.shiftLabel}>Time:</Text>
              <Text style={styles.shiftValue}>
                {rider.shiftStart} - {rider.shiftEnd}
              </Text>
            </View>
          </View>
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Deliveries Completed</Text>
              <Text style={styles.progressValue}>
                {rider.deliveriesCompleted}/{rider.totalDeliveries}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%` },
                ]}
              />
            </View>
          </View>
        </Card>

       
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    backgroundColor: "#0b0f3d",
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  welcomeSection: {
    marginBottom: theme.spacing.lg,
  },
  welcomeText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  nameText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  statusBadge: {
    marginTop: theme.spacing.xs,
  },
  zoneCard: {
    marginBottom: theme.spacing.md,
  },
  zoneHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  zoneTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "600",
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  zoneContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  zoneInfo: {
    flex: 1,
  },
  zoneCode: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: "700",
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  zoneDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  mapPreview: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    marginLeft: theme.spacing.md,
  },
  miniMap: {
    width: "100%",
    height: "100%",
  },
  assignedCard: {
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  assignedContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  assignedZoneCode: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "700",
    color: theme.colors.error,
  },
  assignedNote: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  shiftCard: {
    marginBottom: theme.spacing.md,
  },
  shiftInfo: {
    marginBottom: theme.spacing.md,
  },
  shiftRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  shiftLabel: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  shiftValue: {
    fontSize: theme.fontSize.base,
    fontWeight: "600",
    color: theme.colors.text,
  },
  progressSection: {
    marginTop: theme.spacing.md,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  progressLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.text,
  },
  progressValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
    color: theme.colors.success,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: theme.borderRadius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.full,
  },
  actionButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: theme.fontSize.base,
    fontWeight: "600",
  },
});
