import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';

export default function FatigueDetectionScreen() {
  const router = useRouter();
  const [isPassed, setIsPassed] = useState(false);
  const [progress] = useState(new Animated.Value(0));
  const [scanAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const timer = setTimeout(() => {
      setIsPassed(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start();

      setTimeout(() => {
        router.replace('/order-pickup');
      }, 2000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [progress, router, scanAnimation]);

  const scanTranslateY = scanAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fatigue Detection</Text>
      
      <View style={styles.cameraFrame}>
        <View style={styles.circle}>
          {!isPassed ? (
            <>
              <View style={styles.face} />
              <Animated.View 
                style={[
                  styles.scanLine, 
                  { transform: [{ translateY: scanTranslateY }] }
                ]} 
              />
            </>
          ) : (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.instruction}>
        {isPassed ? 'Fatigue check passed' : 'Position your face in the frame'}
      </Text>

      {!isPassed && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Scanning...</Text>
        </View>
      )}

      {isPassed && (
        <Text style={styles.caption}>This scan ensures driver safety</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: theme.spacing.xl,
  },
  cameraFrame: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  circle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 4,
    borderColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  face: {
    width: 80,
    height: 100,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: theme.colors.accent,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  checkmark: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 60,
    color: '#ffffff',
    fontWeight: '700',
  },
  instruction: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  progressContainer: {
    marginTop: theme.spacing.lg,
  },
  progressText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  caption: {
    fontSize: theme.fontSize.sm,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});
