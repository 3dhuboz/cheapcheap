import { useState, useRef } from 'react';
import {
  View, TextInput, StyleSheet, FlatList, Text,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow, StoreColors } from '../../theme';
import { searchProducts } from '../../services/listService';
import { SearchProduct } from '../../types';

interface ItemSearchBarProps {
  onSelect: (product: SearchProduct) => void;
  onCustomAdd: (name: string) => void;
}

export function ItemSearchBar({ onSelect, onCustomAdd }: ItemSearchBarProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const { data: results, isFetching } = useQuery({
    queryKey: ['product-search', query],
    queryFn: () => searchProducts(query),
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  });

  const handleSelect = (product: SearchProduct) => {
    onSelect(product);
    setQuery('');
    inputRef.current?.blur();
  };

  const handleCustomAdd = () => {
    if (query.trim()) {
      onCustomAdd(query.trim());
      setQuery('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
        <Ionicons name="search" size={18} color={Colors.textTertiary} style={styles.icon} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Search products or add custom…"
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={Colors.textDisabled}
          returnKeyType="done"
          onSubmitEditing={handleCustomAdd}
        />
        {isFetching && <ActivityIndicator size="small" color={Colors.primary} style={styles.icon} />}
        {query.length > 0 && !isFetching && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.icon}>
            <Ionicons name="close-circle" size={18} color={Colors.textDisabled} />
          </TouchableOpacity>
        )}
      </View>

      {focused && query.trim().length >= 2 && (
        <View style={styles.dropdown}>
          {results?.map((product) => (
            <TouchableOpacity key={product.id} style={styles.resultRow} onPress={() => handleSelect(product)}>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName} numberOfLines={1}>{product.canonical_name}</Text>
                {product.brand && <Text style={styles.resultBrand}>{product.brand}</Text>}
              </View>
              {product.cheapest_price != null && product.cheapest_chain && (
                <View style={styles.priceWrap}>
                  <View style={[styles.chainDot, { backgroundColor: StoreColors[product.cheapest_chain] }]} />
                  <Text style={styles.price}>${product.cheapest_price.toFixed(2)}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
          {query.trim() && (
            <TouchableOpacity style={styles.customRow} onPress={handleCustomAdd}>
              <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
              <Text style={styles.customText}>Add "{query.trim()}" as custom item</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', zIndex: 10 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    ...Shadow.sm,
  },
  inputWrapFocused: { borderColor: Colors.primary },
  icon: { marginHorizontal: 4 },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginTop: 4,
    ...Shadow.md,
    maxHeight: 280,
    overflow: 'hidden',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  resultInfo: { flex: 1, marginRight: Spacing.sm },
  resultName: { fontSize: FontSize.base, color: Colors.text, fontWeight: FontWeight.medium },
  resultBrand: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 1 },
  priceWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chainDot: { width: 6, height: 6, borderRadius: 3 },
  price: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  customText: { fontSize: FontSize.base, color: Colors.primary, fontWeight: FontWeight.medium },
});
