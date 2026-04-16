import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import { useCartStore } from '@/store/cart.store';
import { colors, spacing, radius } from '@/lib/theme';

const { width } = Dimensions.get('window');

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [imageIdx, setImageIdx] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getOne(id) as any,
  });

  const handleAdd = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      Alert.alert('Выберите размер');
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.images[0],
      size: selectedSize,
      qty: 1,
    });
    Alert.alert('Добавлено в корзину', product.name, [
      { text: 'В корзину', onPress: () => router.push('/cart') },
      { text: 'Продолжить', style: 'cancel' },
    ]);
  };

  if (isLoading || !product) {
    return <View style={styles.loading}><Text style={{ color: colors.gray400 }}>Загрузка...</Text></View>;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Images */}
      <View style={styles.imageWrapper}>
        {product.images[imageIdx] ? (
          <Image source={{ uri: product.images[imageIdx] }} style={styles.mainImage} resizeMode="cover" />
        ) : (
          <View style={[styles.mainImage, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>👕</Text>
          </View>
        )}
      </View>

      {product.images.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbs}>
          {product.images.map((img: string, i: number) => (
            <TouchableOpacity key={i} onPress={() => setImageIdx(i)} style={[styles.thumb, i === imageIdx && styles.thumbActive]}>
              <Image source={{ uri: img }} style={styles.thumbImage} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.info}>
        <Text style={styles.category}>{product.category?.name} · {product.brand}</Text>
        <Text style={styles.name}>{product.name}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{Number(product.price).toLocaleString('ru')} ₽</Text>
          {product.oldPrice && (
            <Text style={styles.oldPrice}>{Number(product.oldPrice).toLocaleString('ru')} ₽</Text>
          )}
        </View>

        {product.description && <Text style={styles.desc}>{product.description}</Text>}

        {/* Sizes */}
        {product.sizes?.length > 0 && (
          <View style={styles.sizesSection}>
            <Text style={styles.sizesLabel}>Размер</Text>
            <View style={styles.sizes}>
              {product.sizes.map((size: string) => (
                <TouchableOpacity
                  key={size}
                  onPress={() => setSelectedSize(size)}
                  style={[styles.sizeBtn, selectedSize === size && styles.sizeBtnActive]}
                >
                  <Text style={[styles.sizeBtnText, selectedSize === size && styles.sizeBtnTextActive]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Store info */}
        {product.store && (
          <View style={styles.storeCard}>
            <Text style={styles.storeName}>🏪 {product.store.name}</Text>
            {product.store.address && <Text style={styles.storeAddr}>📍 {product.store.address}</Text>}
          </View>
        )}

        {/* Add to cart */}
        <TouchableOpacity
          style={[styles.addBtn, !product.inStock && styles.addBtnDisabled]}
          onPress={handleAdd}
          disabled={!product.inStock}
        >
          <Text style={styles.addBtnText}>
            {product.inStock ? '🛒 Добавить в корзину' : 'Нет в наличии'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imageWrapper: { width: '100%', aspectRatio: 1, backgroundColor: colors.gray100 },
  mainImage: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderText: { fontSize: 80 },
  thumbs: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.white },
  thumb: { width: 56, height: 56, borderRadius: radius.sm, overflow: 'hidden', marginRight: spacing.sm, borderWidth: 2, borderColor: 'transparent' },
  thumbActive: { borderColor: colors.primary },
  thumbImage: { width: '100%', height: '100%' },
  info: { padding: spacing.md },
  category: { fontSize: 12, color: colors.gray400, marginBottom: 4 },
  name: { fontSize: 22, fontWeight: '800', color: colors.gray900, lineHeight: 30, marginBottom: spacing.sm },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, marginBottom: spacing.md },
  price: { fontSize: 28, fontWeight: '800', color: colors.gray900 },
  oldPrice: { fontSize: 16, color: colors.gray400, textDecorationLine: 'line-through' },
  desc: { fontSize: 14, color: colors.gray600, lineHeight: 22, marginBottom: spacing.md },
  sizesSection: { marginBottom: spacing.md },
  sizesLabel: { fontSize: 15, fontWeight: '600', color: colors.gray900, marginBottom: spacing.sm },
  sizes: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sizeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.gray200 },
  sizeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  sizeBtnText: { fontSize: 14, fontWeight: '500', color: colors.gray700 },
  sizeBtnTextActive: { color: colors.white, fontWeight: '700' },
  storeCard: { backgroundColor: colors.gray50, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, gap: 4 },
  storeName: { fontSize: 14, fontWeight: '600', color: colors.gray900 },
  storeAddr: { fontSize: 13, color: colors.gray500 },
  addBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center', marginBottom: spacing.xl },
  addBtnDisabled: { backgroundColor: colors.gray200 },
  addBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
