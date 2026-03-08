import { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, FontWeight } from '../../src/theme';

export default function SplashScreen() {
  const scale = new Animated.Value(0.6);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => router.replace('/(auth)/onboarding'), 1200);
    });
  }, []);

  return (
    <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.container}>
      <Animated.View style={[styles.logoContainer, { transform: [{ scale }], opacity }]}>
        <Text style={styles.chick}>🐥</Text>
        <Text style={styles.appName}>Cheap Cheap</Text>
        <Text style={styles.tagline}>Your weekly savings companion</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    gap: 8,
  },
  chick: {
    fontSize: 88,
    marginBottom: 8,
  },
  appName: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textInverse,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: FontWeight.medium,
  },
});
