import { useTheme } from "@/contexts/ThemeContext";
import { useOrders } from "@/contexts/OrdersContext";
import { useSensors } from "@/contexts/SensorContext";
import { useRouter } from "expo-router";
import { Bell, User, Navigation, Gauge, RotateCw } from "lucide-react-native";
import React, { useState, useEffect, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { fetchDeliveryRoute } from "@/services/route";

// Only import react-native-maps on native platforms
let MapView, Marker, Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
  PROVIDER_DEFAULT = Maps.PROVIDER_DEFAULT;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}

// Default location (Dubai) as fallback
const DEFAULT_LOCATION = {
  latitude: 25.276987,
  longitude: 55.296249,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapScreen() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const { orders } = useOrders();
  const { currentSpeed, gyroscopeData, isMonitoring, locationData, startMonitoring } = useSensors();

  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isStartingSensors, setIsStartingSensors] = useState(false);

  const bgColor = isDarkMode ? "#111827" : "#F9FAFB";

  // Get active order (assigned or picked_up)
  const activeOrder = useMemo(() => {
    return orders.find(o => o.status === "assigned");
  }, [orders]);

  // Handle starting sensors manually
  const handleStartSensors = async () => {
    console.log('Starting sensors from map...');
    setIsStartingSensors(true);
    try {
      const result = await startMonitoring();
      console.log('Sensors started, result:', result);
    } catch (error) {
      console.error('Failed to start sensors:', error);
    }
    setIsStartingSensors(false);
  };

  // Debug: Log when isMonitoring changes
  useEffect(() => {
    console.log('isMonitoring state changed to:', isMonitoring);
  }, [isMonitoring]);

  // Calculate gyroscope magnitude for display
  const gyroMagnitude = useMemo(() => {
    if (!gyroscopeData) return 0;
    return Math.sqrt(
      gyroscopeData.x ** 2 + 
      gyroscopeData.y ** 2 + 
      gyroscopeData.z ** 2
    ).toFixed(2);
  }, [gyroscopeData]);

  useEffect(() => {
    getUserLocation();
  }, []);

  // Fetch route when we have location and active order
  useEffect(() => {
    const fetchRoute = async () => {
      if (!userLocation || !activeOrder) {
        setRouteData(null);
        return;
      }

      const pickupLocation = {
        latitude: activeOrder.pickupLatitude || 25.2048,
        longitude: activeOrder.pickupLongitude || 55.2708,
      };

      const dropoffLocation = {
        latitude: activeOrder.dropoffLatitude || 25.197,
        longitude: activeOrder.dropoffLongitude || 55.278,
      };

      setIsLoadingRoute(true);
      try {
        const route = await fetchDeliveryRoute(
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          pickupLocation,
          dropoffLocation
        );
        setRouteData(route);
      } catch (error) {
        console.error('Error fetching route:', error);
      }
      setIsLoadingRoute(false);
    };

    fetchRoute();
  }, [userLocation, activeOrder]);

  const getUserLocation = async () => {
    try {
      setIsLoadingLocation(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationError("Location permission denied");
        setUserLocation(DEFAULT_LOCATION);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    } catch (error) {
      console.warn("Error getting location:", error);
      setLocationError("Could not get location");
      setUserLocation(DEFAULT_LOCATION);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Get route coordinates
  const toPickupCoords = routeData?.toPickup?.coordinates || [];
  const toDropoffCoords = routeData?.toDropoff?.coordinates || [];

  // Web fallback
  if (Platform.OS === 'web') {
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
        <View style={styles.webMapPlaceholder}>
          <Text style={styles.webMapIcon}>🗺️</Text>
          <Text style={styles.webMapText}>Map View</Text>
          <Text style={styles.webMapSubtext}>Maps are only available on mobile devices</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.headerWrapper}>
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>OptiRide</Text>
            <View style={styles.headerIcons}>
              {isLoadingRoute && (
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
              )}
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

      {/* Map container with overlays */}
      <View style={styles.mapContainer}>
        {/* Sensor readings overlay - show when monitoring OR when there's an active order */}
        {(isMonitoring || activeOrder) && (
          <View style={styles.sensorOverlay}>
            <View style={styles.sensorCard}>
              <Gauge size={20} color="#3B82F6" />
              <Text style={styles.sensorValue}>{Math.round(currentSpeed || 0)}</Text>
              <Text style={styles.sensorUnit}>km/h</Text>
            </View>
            <View style={styles.sensorCard}>
              <RotateCw size={20} color="#8B5CF6" />
              <Text style={styles.sensorValue}>{gyroMagnitude}</Text>
              <Text style={styles.sensorUnit}>rad/s</Text>
            </View>
            {!isMonitoring && (
              <TouchableOpacity 
                style={[styles.sensorCard, { backgroundColor: '#FEF3C7' }]}
                onPress={handleStartSensors}
                disabled={isStartingSensors}
              >
                {isStartingSensors ? (
                  <ActivityIndicator size="small" color="#92400E" />
                ) : (
                  <Text style={{ fontSize: 11, color: '#92400E', fontWeight: '600' }}>Tap to start sensors</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Active order info card */}
        {activeOrder && (
          <View style={styles.orderInfoCard}>
            <View style={styles.orderInfoRow}>
              <Navigation size={16} color="#10B981" />
              <Text style={styles.orderInfoText} numberOfLines={1}>
                {activeOrder.pickupConfirmed ? 'To: ' + activeOrder.details?.customerName : 'Pickup: ' + activeOrder.restaurant}
              </Text>
            </View>
            {routeData && (
              <View style={styles.routeStats}>
                <Text style={styles.routeStatText}>
                  {activeOrder.pickupConfirmed 
                    ? `${routeData.toDropoff?.distance?.toFixed(1) || '~'} km • ${Math.round(routeData.toDropoff?.duration || 0)} min`
                    : `${routeData.toPickup?.distance?.toFixed(1) || '~'} km • ${Math.round(routeData.toPickup?.duration || 0)} min`
                  }
                </Text>
              </View>
            )}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendLine, { backgroundColor: '#3B82F6' }]} />
                <Text style={styles.legendText}>To Pickup</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendLine, { backgroundColor: '#F97316' }]} />
                <Text style={styles.legendText}>To Dropoff</Text>
              </View>
            </View>
          </View>
        )}

        {isLoadingLocation ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Getting your location...</Text>
          </View>
        ) : (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFillObject}
            initialRegion={userLocation || DEFAULT_LOCATION}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
          >
            {/* Pickup marker */}
            {activeOrder && (
              <Marker
                coordinate={{
                  latitude: activeOrder.pickupLatitude || 25.2048,
                  longitude: activeOrder.pickupLongitude || 55.2708,
                }}
                title={activeOrder.restaurant}
                description="Pickup Location"
                pinColor="#10B981"
              />
            )}

            {/* Dropoff marker */}
            {activeOrder && (
              <Marker
                coordinate={{
                  latitude: activeOrder.dropoffLatitude || 25.197,
                  longitude: activeOrder.dropoffLongitude || 55.278,
                }}
                title={activeOrder.details?.customerName || "Customer"}
                description="Dropoff Location"
                pinColor="#EF4444"
              />
            )}

            {/* Route to Pickup (blue) */}
            {toPickupCoords.length > 0 && (
              <Polyline
                coordinates={toPickupCoords}
                strokeColor="#3B82F6"
                strokeWidth={5}
              />
            )}

            {/* Route to Dropoff (orange) */}
            {toDropoffCoords.length > 0 && (
              <Polyline
                coordinates={toDropoffCoords}
                strokeColor="#F97316"
                strokeWidth={4}
              />
            )}
          </MapView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  headerWrapper: {
    backgroundColor: "#0b0f3d",
    zIndex: 100,
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
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  // Sensor overlay styles - positioned bottom left, above the map buttons
  sensorOverlay: {
    position: "absolute",
    bottom: 30,
    left: 16,
    zIndex: 999,
    flexDirection: "column",
    gap: 8,
  },
  sensorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    gap: 8,
  },
  sensorValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
  },
  sensorUnit: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  // Order info card styles - positioned at top, just below header
  orderInfoCard: {
    position: "absolute",
    top: 8,
    right: 16,
    left: 16,
    zIndex: 999,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  orderInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  orderInfoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  routeStats: {
    marginBottom: 8,
  },
  routeStatText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  legendRow: {
    flexDirection: "row",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendLine: {
    width: 16,
    height: 4,
    borderRadius: 2,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: "#6B7280",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  webMapIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  webMapText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  webMapSubtext: {
    fontSize: 16,
    color: "#6B7280",
  },
});