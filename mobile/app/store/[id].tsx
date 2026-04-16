import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { storesApi } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { colors, spacing, radius } from '@/lib/theme';

export default function StoreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: store, isLoading } = useQuery({
    queryKey: ['store', id],
    queryFn: () => storesApi.getOne(id) as any,
  });

  if (isLoading || !store) {
    return <View style={styles.center}><Text style={{ color: colors.gray400 }}>Загрузка...</Text></View>;
  }

  return (
    <FlatList
      data={store.products || []}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.list}
      ListHeaderComponent={(
        <View style={styles.header}>
          <Text style={styles.storeName}>{store.name}</Text>
          {store.address && <Text style={styles.storeInfo}>📍 {store.address}</Text>}
          {store.phone && <Text style={styles.storeInfo}>📞 {store.phone}</Text>}
          <Text style={styles.productsCount}>{store.products?.length || 0} товаров</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <View style={styles.col}>
          <ProductCard product={item} />
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>Товаров пока нет</Text>}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing.sm },
  header: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  storeName: { fontSize: 22, fontWeight: '800', color: colors.gray900, marginBottom: spacing.sm },
  storeInfo: { fontSize: 14, color: colors.gray500, marginBottom: 4 },
  productsCount: { fontSize: 13, color: colors.gray400, marginTop: spacing.sm },
  col: { flex: 1 },
  empty: { textAlign: 'center', color: colors.gray400, padding: spacing.xl },
});
