import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';

export default function FallAssistanceScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>🚑</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.title}>Help is on the way</Text>
          <Text style={styles.message}>
            Emergency services have been notified and are en route to your location. 
            Read the tips below to avoid any further risks while waiting for assistance.
          </Text>

          <Button 
            title="Read Instructions" 
            onPress={() => router.back()} 
            variant="success"
            style={styles.button}
          />
        </Card>

        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Safety Tips:</Text>
          <Text style={styles.tip}>• Stay calm and avoid sudden movements</Text>
          <Text style={styles.tip}>• If possible, move to a safe location</Text>
          <Text style={styles.tip}>• Keep your phone nearby</Text>
          <Text style={styles.tip}>• Wait for emergency responders</Text>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  iconText: {
    fontSize: 80,
  },
  card: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  button: {
    width: '100%',
  },
  tipsCard: {
    backgroundColor: `${theme.colors.warning}20`,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
  },
  tipsTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  tip: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    lineHeight: 22,
  },
});
