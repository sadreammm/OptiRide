import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Polyline, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { ArrowLeftIcon } from 'lucide-react-native';
import { theme } from '@/constants/theme';

export default function OrderDeliveryScreen() {
  const router = useRouter();

  const routeCoordinates = [
    { latitude: 25.1970, longitude: 55.2780 },
    { latitude: 25.1850, longitude: 55.2650 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Navigate to Order #5678&apos;s Location</Text>
      </View>

      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: 25.1910,
          longitude: 55.2715,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
      >
        <Polyline
          coordinates={routeCoordinates}
          strokeColor={theme.colors.success}
          strokeWidth={4}
        />
        <Marker
          coordinate={routeCoordinates[0]}
          title="China Bistro"
          pinColor={theme.colors.accent}
        />
        <Marker
          coordinate={routeCoordinates[1]}
          title="Customer Location"
          pinColor={theme.colors.success}
        />
      </MapView>

      <View style={styles.infoCard}>
        <Text style={styles.orderNumber}>Order #5678</Text>
        <Text style={styles.address}>Burj Residences, Tower 1, Apt 504</Text>
        <Text style={styles.distance}>1.8 km away • 7 min</Text>
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
    fontSize: theme.fontSize.base,
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
  orderNumber: {
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
    color: theme.colors.success,
  },
});
