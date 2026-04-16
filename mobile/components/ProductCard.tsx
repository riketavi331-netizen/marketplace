import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '@/store/cart.store';
import { colors, radius } from '@/lib/theme';
import { Product } from '@/lib/types';

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.images[0],
      qty: 1,
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/product/${product.id}`)}
      activeOpacity={0.85}
    >
      <View style={styles.imageContainer}>
        {product.images[0] ? (
          <Image source={{ uri: product.images[0] }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>👕</Text>
          </View>
        )}
        {!product.inStock && (
          <View style={styles.outOfStock}>
            <Text style={styles.outOfStockText}>Нет в наличии</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.category}>{product.category?.name}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <View style={styles.footer}>
          <View>
            <Text style={styles.price}>{Number(product.price).toLocaleString('ru')} ₽</Text>
            {product.oldPrice && (
              <Text style={styles.oldPrice}>{Number(product.oldPrice).toLocaleString('ru')} ₽</Text>
            )}
          </View>
          {product.inStock && (
            <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    margin: 4,
  },
  imageContainer: { aspectRatio: 1, backgroundColor: colors.gray100 },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderText: { fontSize: 40 },
  outOfStock: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  outOfStockText: { color: colors.white, fontWeight: '600', fontSize: 12 },
  info: { padding: 10 },
  category: { fontSize: 11, color: colors.gray400, marginBottom: 2 },
  name: { fontSize: 13, fontWeight: '500', color: colors.gray900, marginBottom: 8, lineHeight: 18 },
  footer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  price: { fontSize: 14, fontWeight: '700', color: colors.gray900 },
  oldPrice: { fontSize: 11, color: colors.gray400, textDecorationLine: 'line-through' },
  addBtn: { width: 28, height: 28, borderRadius: radius.sm, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: colors.primary, fontSize: 18, fontWeight: '600', lineHeight: 22 },
});
