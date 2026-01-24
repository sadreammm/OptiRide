import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';

export default function FallDetectionScreen() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push('/fall-assistance');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  const handleImOkay = () => {
    router.back();
  };

  const handleCallEmergency = () => {
    router.push('/fall-assistance');
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: 25.2048,
          longitude: 55.2708,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      />
      <View style={styles.overlay} />

      <View style={styles.cardContainer}>
        <Card style={styles.alertCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>⚠️</Text>
          </View>
          <Text style={styles.title}>FALL DETECTED!</Text>
          <Text style={styles.message}>
            A fall has been detected. Emergency services will be contacted automatically if you don&apos;t respond.
          </Text>
          
          <View style={styles.countdownContainer}>
            <View style={styles.countdownCircle}>
              <Text style={styles.countdownText}>{countdown}</Text>
              <Text style={styles.countdownLabel}>seconds</Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <Button 
              title="I'M OKAY" 
              onPress={handleImOkay} 
              variant="success"
              style={styles.button}
            />
            <Button 
              title="CALL EMERGENCY" 
              onPress={handleCallEmergency} 
              variant="danger"
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  cardContainer: {
    position: 'absolute',
    top: '15%',
    left: 20,
    right: 20,
  },
  alertCard: {
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: theme.spacing.md,
  },
  iconText: {
    fontSize: 60,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  countdownCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${theme.colors.error}20`,
    borderWidth: 4,
    borderColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 40,
    fontWeight: '700',
    color: theme.colors.error,
  },
  countdownLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    width: '100%',
  },
  button: {
    flex: 1,
  },
});
