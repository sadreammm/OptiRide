import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';

export default function OrderNotificationScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: 25.2048,
          longitude: 55.2708,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker
          coordinate={{ latitude: 25.2048, longitude: 55.2708 }}
          title="China Bistro"
        />
      </MapView>
      <View style={styles.overlay} />

      <View style={styles.cardContainer}>
        <Card style={styles.notificationCard}>
          <Text style={styles.badge}>NEW ORDER ASSIGNED</Text>
          <Text style={styles.title}>🥡 China Bistro</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Pickup Address:</Text>
            <Text style={styles.value}>Dubai Mall, Downtown</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Pickup Time:</Text>
            <Text style={styles.value}>2:30 PM</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Order #:</Text>
            <Text style={styles.value}>#5678</Text>
          </View>

          <View style={styles.buttonRow}>
            <Button 
              title="DECLINE" 
              onPress={() => router.back()} 
              variant="secondary"
              style={styles.button}
            />
            <Button 
              title="ACCEPT" 
              onPress={() => {
                router.replace('/fatigue-detection');
              }} 
              variant="success"
              style={styles.button}
            />
          </View>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cardContainer: {
    position: 'absolute',
    top: '20%',
    left: 20,
    right: 20,
  },
  notificationCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  badge: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.success,
    backgroundColor: `${theme.colors.success}20`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  detailRow: {
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  value: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    color: theme.colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  button: {
    flex: 1,
  },
});
