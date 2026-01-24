import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Polyline, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { ArrowLeftIcon } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useOrders } from '@/contexts/OrdersContext';

export default function OrderPickupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { orders, isLoadingOrders } = useOrders();

  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;

  const order = useMemo(
    () => orders.find((o) => o.id === orderId),
    [orders, orderId],
  );
  
  // Fallback if order not found
  if (isLoadingOrders) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeftIcon size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading order…</Text>
        </View>
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeftIcon size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Not Found</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
        </View>
      </View>
    );
  }

  const routeCoordinates = [
    {
      latitude: order.pickupLatitude || 25.2048,
      longitude: order.pickupLongitude || 55.2708,
    },
    {
      latitude: order.dropoffLatitude || 25.197,
      longitude: order.dropoffLongitude || 55.278,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Navigate to {order.orderNumber}&apos;s Location</Text>
      </View>

      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: 25.2009,
          longitude: 55.2744,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <Polyline
          coordinates={routeCoordinates}
          strokeColor={theme.colors.accent}
          strokeWidth={4}
        />
        <Marker
          coordinate={routeCoordinates[0]}
          title="Pickup Location"
          pinColor={theme.colors.success}
        />
        <Marker
          coordinate={routeCoordinates[1]}
          title={order.restaurant}
          pinColor={theme.colors.error}
        />
      </MapView>

      <View style={styles.infoCard}>
        <Text style={styles.restaurantName}>{order.restaurant}</Text>
        <Text style={styles.address}>{order.location}</Text>
        <Text style={styles.distance}>Customer: {order.details.customerName}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  map: {
    flex: 1,
  },
  infoCard: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  restaurantName: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  address: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  distance: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.accent,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
  },
});
