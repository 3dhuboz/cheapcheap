import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing, Shadow } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  padding?: keyof typeof Spacing;
}

export function Card({ children, style, elevated = false, padding = 'base' }: CardProps) {
  return (
    <View style={[styles.card, elevated && styles.elevated, { padding: Spacing[padding] }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    ...Shadow.sm,
  },
  elevated: {
    ...Shadow.md,
  },
});
