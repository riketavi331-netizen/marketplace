import { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { colors, spacing, radius } from '@/lib/theme';

const GENDERS = [
  { label: 'Все', value: '' },
  { label: 'Мужское', value: 'MEN' },
  { label: 'Женское', value: 'WOMEN' },
  { label: 'Унисекс', value: 'UNISEX' },
  { label: 'Детское', value: 'KIDS' },
];

export default function CatalogScreen() {
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['products', { search, gender, page }],
    queryFn: () => productsApi.getAll({ search, gender, page, limit: 20 }) as any,
  });

  const products = (data as any)?.items || [];
  const total = (data as any)?.total || 0;
  const pages = (data as any)?.pages || 1;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Каталог</Text>
        <TextInput
          style={styles.search}
          placeholder="Поиск товаров..."
          value={search}
          onChangeText={(t) => { setSearch(t); setPage(1); }}
          placeholderTextColor={colors.gray400}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {GENDERS.map((g) => (
            <TouchableOpacity
              key={g.value}
              onPress={() => { setGender(g.value); setPage(1); }}
              style={[styles.chip, gender === g.value && styles.chipActive]}
            >
              <Text style={[styles.chipText, gender === g.value && styles.chipTextActive]}>{g.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {!isLoading && <Text style={styles.count}>{total} товаров</Text>}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.col}>
              <ProductCard product={item} />
            </View>
          )}
          ListFooterComponent={pages > 1 ? (
            <View style={styles.pagination}>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPage(p)}
                  style={[styles.pageBtn, p === page && styles.pageBtnActive]}
                >
                  <Text style={[styles.pageBtnText, p === page && styles.pageBtnTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray50 },
  header: { backgroundColor: colors.white, paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  title: { fontSize: 22, fontWeight: '800', color: colors.gray900, marginBottom: spacing.sm },
  search: { borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: colors.gray900, marginBottom: spacing.sm },
  filters: { marginBottom: spacing.sm },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1, borderColor: colors.gray200, marginRight: spacing.sm, backgroundColor: colors.white },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.gray600 },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  count: { fontSize: 12, color: colors.gray400, marginBottom: 4 },
  list: { padding: spacing.sm },
  col: { flex: 1 },
  pagination: { flexDirection: 'row', justifyContent: 'center', gap: 8, padding: spacing.md, flexWrap: 'wrap' },
  pageBtn: { width: 36, height: 36, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.gray200, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  pageBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pageBtnText: { fontSize: 13, color: colors.gray700 },
  pageBtnTextActive: { color: colors.white, fontWeight: '700' },
});
