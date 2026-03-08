import { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/theme';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    emoji: '🛒',
    title: 'Build Your\nGrocery List',
    subtitle: 'Add items by search or barcode scan. See the cheapest price instantly.',
    bg: [Colors.primary, Colors.primaryDark] as [string, string],
  },
  {
    id: '2',
    emoji: '💰',
    title: 'Compare\nAll 3 Stores',
    subtitle: 'Aldi, Coles & Woolworths — side by side. Find where every item is cheapest.',
    bg: ['#1A6B8A', '#0F4D63'] as [string, string],
  },
  {
    id: '3',
    emoji: '⛽',
    title: 'Find the\nCheapest Fuel',
    subtitle: 'Nearby stations ranked by price. Know exactly when to fill up.',
    bg: [Colors.accent, '#CC4D1A'] as [string, string],
  },
];

export default function OnboardingScreen() {
  const [current, setCurrent] = useState(0);
  const listRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (current < slides.length - 1) {
      listRef.current?.scrollToIndex({ index: current + 1 });
      setCurrent(current + 1);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => router.replace('/(auth)/login');

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LinearGradient colors={item.bg} style={styles.slide}>
            <TouchableOpacity style={styles.skip} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </LinearGradient>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === current && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>
            {current === slides.length - 1 ? "Let's Go 🐥" : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    paddingTop: 80,
  },
  skip: { position: 'absolute', top: 56, right: Spacing.xl },
  skipText: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.base, fontWeight: FontWeight.medium },
  emoji: { fontSize: 100, marginBottom: Spacing.xl },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textInverse,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 48,
    paddingTop: Spacing.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  dots: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: { width: 24, backgroundColor: Colors.textInverse },
  nextBtn: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: Radius.full,
    width: '100%',
    alignItems: 'center',
  },
  nextText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
});
