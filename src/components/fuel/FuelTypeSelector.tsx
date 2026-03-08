import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FuelType } from '../../types';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../theme';

const FUEL_OPTIONS: { type: FuelType; label: string; abbr: string }[] = [
  { type: 'ulp91', label: 'Unleaded 91', abbr: 'U91' },
  { type: 'e10', label: 'E10', abbr: 'E10' },
  { type: 'ulp95', label: 'Premium 95', abbr: 'P95' },
  { type: 'ulp98', label: 'Premium 98', abbr: 'P98' },
  { type: 'diesel', label: 'Diesel', abbr: 'DSL' },
  { type: 'lpg', label: 'LPG', abbr: 'LPG' },
];

interface FuelTypeSelectorProps {
  selected: FuelType;
  onChange: (type: FuelType) => void;
}

export function FuelTypeSelector({ selected, onChange }: FuelTypeSelectorProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {FUEL_OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.type}
          style={[styles.chip, selected === opt.type && styles.chipActive]}
          onPress={() => onChange(opt.type)}
          activeOpacity={0.75}
        >
          <Text style={[styles.abbr, selected === opt.type && styles.abbrActive]}>{opt.abbr}</Text>
          <Text style={[styles.label, selected === opt.type && styles.labelActive]}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: Spacing.base, gap: Spacing.sm, paddingBottom: 4 },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    minWidth: 60,
  },
  chipActive: { backgroundColor: Colors.fuel, borderColor: Colors.fuel },
  abbr: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text },
  abbrActive: { color: Colors.textInverse },
  label: { fontSize: 9, color: Colors.textTertiary, marginTop: 1 },
  labelActive: { color: 'rgba(255,255,255,0.85)' },
});
