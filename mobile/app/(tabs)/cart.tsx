import { View, Text, FlatList, TouchableOpacity, Image, TextInput, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { ordersApi } from '@/lib/api';
import { useState } from 'react';
import { colors, spacing, radius } from '@/lib/theme';

export default function CartScreen() {
  const { items, updateQty, removeItem, clear, total } = useCartStore();
  const { user } = useAuthStore();
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleOrder = async () => {
    if (!user) { router.push('/auth'); return; }
    if (!address.trim()) { Alert.alert('Ошибка', 'Укажите адрес доставки'); return; }

    setLoading(true);
    try {
      const order: any = await ordersApi.create({
        storeId: 'store-1',
        address,
        items: items.map((i) => ({ productId: i.productId, size: i.size, qty: i.qty })),
      });
      clear();
      Alert.alert('Заказ оформлен!', `Номер заказа: ${order.id.slice(-8).toUpperCase()}`);
      router.push(`/orders/${order.id}`);
    } catch (e: any) {
      Alert.alert('Ошибка', e?.message || 'Не удалось оформить заказ');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Корзина пуста</Text>
          <Text style={styles.emptySubtitle}>Добавьте товары из каталога</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/catalog')}>
            <Text style={styles.btnPrimaryText}>Перейти в каталог</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={items}
        keyExtractor={(item) => `${item.productId}-${item.size}`}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.title}>Корзина ({items.length})</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemImage}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
              ) : (
                <Text style={{ fontSize: 28 }}>👕</Text>
              )}
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
              {item.size && <Text style={styles.itemSize}>Размер: {item.size}</Text>}
              <Text style={styles.itemPrice}>{(item.price * item.qty).toLocaleString('ru')} ₽</Text>
            </View>
            <View style={styles.itemControls}>
              <TouchableOpacity onPress={() => removeItem(item.productId, item.size)} style={styles.removeBtn}>
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
              <View style={styles.qtyRow}>
                <TouchableOpacity onPress={() => updateQty(item.productId, item.size, item.qty - 1)} style={styles.qtyBtn}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qty}>{item.qty}</Text>
                <TouchableOpacity onPress={() => updateQty(item.productId, item.size, item.qty + 1)} style={styles.qtyBtn}>
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={(
          <View style={styles.checkout}>
            <Text style={styles.checkoutLabel}>Адрес доставки</Text>
            <TextInput
              style={styles.addressInput}
              placeholder="Город, улица, дом, квартира"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
              placeholderTextColor={colors.gray400}
            />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Итого</Text>
              <Text style={styles.totalValue}>{total().toLocaleString('ru')} ₽</Text>
            </View>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleOrder} disabled={loading}>
              <Text style={styles.btnPrimaryText}>{loading ? 'Оформляем...' : 'Оформить заказ'}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray50 },
  list: { padding: spacing.md },
  title: { fontSize: 22, fontWeight: '800', color: colors.gray900, marginBottom: spacing.md },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 60, marginBottom: spacing.md },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.gray900, marginBottom: spacing.sm },
  emptySubtitle: { fontSize: 14, color: colors.gray400, marginBottom: spacing.lg },
  item: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  itemImage: { width: 64, height: 64, borderRadius: radius.sm, backgroundColor: colors.gray100, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  image: { width: '100%', height: '100%' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '500', color: colors.gray900, lineHeight: 20 },
  itemSize: { fontSize: 12, color: colors.gray400, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: colors.gray900, marginTop: 4 },
  itemControls: { alignItems: 'flex-end', justifyContent: 'space-between' },
  removeBtn: { padding: 4 },
  removeBtnText: { fontSize: 14, color: colors.gray300 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.sm, overflow: 'hidden' },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 16, color: colors.gray700 },
  qty: { fontSize: 13, fontWeight: '600', color: colors.gray900, minWidth: 20, textAlign: 'center' },
  checkout: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, marginTop: spacing.md, gap: spacing.md },
  checkoutLabel: { fontSize: 15, fontWeight: '600', color: colors.gray900 },
  addressInput: { borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.md, padding: 12, fontSize: 14, color: colors.gray900, minHeight: 60, textAlignVertical: 'top' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.gray100 },
  totalLabel: { fontSize: 17, fontWeight: '700', color: colors.gray900 },
  totalValue: { fontSize: 20, fontWeight: '800', color: colors.primary },
  btnPrimary: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  btnPrimaryText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
