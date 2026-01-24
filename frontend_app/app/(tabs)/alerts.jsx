import { Card } from "@/components/Card";
import { theme } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { Alert, alerts } from "@/mocks/alerts";
import { useRouter } from "expo-router";
import {
  AlertTriangleIcon,
  Bell,
  BellIcon,
  HeartPulseIcon,
  MapPinIcon,
  PackageIcon,
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
import { SafeAreaView } from "react-native-safe-area-context";

export default function AlertsScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const bgColor = isDarkMode ? "#111827" : "#F9FAFB";

  const getAlertIcon = (type: Alert["type"]) => {
    const iconProps = { size: 24, color: "#ffffff" };
    switch (type) {
      case "wellbeing":
        return <HeartPulseIcon {...iconProps} />;
      case "zone_change":
        return <MapPinIcon {...iconProps} />;
      case "order_delivery":
        return <PackageIcon {...iconProps} />;
      case "fall_detected":
        return <AlertTriangleIcon {...iconProps} />;
      default:
        return <BellIcon {...iconProps} />;
    }
  };

  const getAlertColor = (type: Alert["type"]) => {
    switch (type) {
      case "wellbeing":
        return theme.colors.success;
      case "zone_change":
        return theme.colors.warning;
      case "order_delivery":
        return theme.colors.accent;
      case "fall_detected":
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

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
        {alerts.map((alert) => (
          <Card
            key={alert.id}
            style={
              !alert.read
                ? { ...styles.alertCard, ...styles.unreadCard }
                : styles.alertCard
            }
          >
            <View style={styles.alertContent}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: getAlertColor(alert.type) },
                ]}
              >
                {getAlertIcon(alert.type)}
              </View>
              <View style={styles.alertText}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <Text style={styles.alertTimestamp}>{alert.timestamp}</Text>
              </View>
            </View>
            {!alert.read && <View style={styles.unreadDot} />}
          </Card>
        ))}
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
  alertCard: {
    marginBottom: theme.spacing.md,
    position: "relative",
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
  },
  alertContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  alertText: {
    flex: 1,
  },
  alertTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  alertMessage: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  alertTimestamp: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  unreadDot: {
    position: "absolute",
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 8,
    height: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.accent,
  },
});
