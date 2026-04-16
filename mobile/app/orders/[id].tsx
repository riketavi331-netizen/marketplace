import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { colors, spacing, radius } from '@/lib/theme';

const STATUS_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  PENDING:   { emoji: '⏳', label: 'Ожидает подтверждения', color: '#f59e0b' },
  CONFIRMED: { emoji: '✅', label: 'Подтверждён',           color: '#3b82f6' },
  SHIPPED:   { emoji: '🚚', label: 'В пути',                color: '#8b5cf6' },
  DELIVERED: { emoji: '📦', label: 'Доставлен',             color: '#22c55e' },
  CANCELLED: { emoji: '❌', label: 'Отменён',               color: '#ef4444' },
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOne(id) as any,
  });

  if (isLoading || !order) {
    return <View style={styles.center}><Text style={{ color: colors.gray400 }}>Загрузка...</Text></View>;
  }

  const s = STATUS_CONFIG[order.status] || { emoji: '📦', label: order.status, color: colors.gray500 };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.statusCard}>
        <Text style={styles.statusEmoji}>{s.emoji}</Text>
        <View>
          <Text style={[styles.statusLabel, { color: s.color }]}>{s.label}</Text>
          <Text style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</Text>
          <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Товары</Text>
      <View style={styles.itemsCard}>
        {order.items?.map((item: any, i: number) => (
          <View key={item.id} style={[styles.item, i > 0 && styles.itemBorder]}>
            <View style={styles.itemEmoji}>
              <Text style={{ fontSize: 24 }}>👕</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.product?.name}</Text>
              {item.size && <Text style={styles.itemSize}>Размер: {item.size}</Text>}
              <Text style={styles.itemQty}>× {item.qty}</Text>
            </View>
            <Text style={styles.itemPrice}>{(Number(item.price) * item.qty).toLocaleString('ru')} ₽</Text>
          </View>
        ))}
      </View>

      <View style={styles.summaryCard}>
        {order.address && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryIcon}>📍</Text>
            <Text style={styles.summaryText}>{order.address}</Text>
          </View>
        )}
        {order.store && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryIcon}>🏪</Text>
            <Text style={styles.summaryText}>{order.store.name}</Text>
          </View>
        )}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Итого</Text>
          <Text style={styles.totalValue}>{Number(order.total).toLocaleString('ru')} ₽</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statusCard: { backgroundColor: colors.white, margin: spacing.md, borderRadius: radius.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  statusEmoji: { fontSize: 40 },
  statusLabel: { fontSize: 16, fontWeight: '700' },
  orderId: { fontSize: 13, color: colors.gray500, marginTop: 2 },
  orderDate: { fontSize: 13, color: colors.gray400, marginTop: 1 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.gray900, marginHorizontal: spacing.md, marginBottom: spacing.sm },
  itemsCard: { backgroundColor: colors.white, marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: radius.lg, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  itemBorder: { borderTopWidth: 1, borderTopColor: colors.gray100 },
  itemEmoji: { width: 48, height: 48, borderRadius: radius.sm, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: 14, fontWeight: '500', color: colors.gray900 },
  itemSize: { fontSize: 12, color: colors.gray400, marginTop: 2 },
  itemQty: { fontSize: 12, color: colors.gray400 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: colors.gray900 },
  summaryCard: { backgroundColor: colors.white, marginHorizontal: spacing.md, marginBottom: spacing.xl, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  summaryIcon: { fontSize: 16, width: 20 },
  summaryText: { flex: 1, fontSize: 14, color: colors.gray700, lineHeight: 20 },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.gray100, paddingTop: spacing.sm, marginTop: spacing.sm, justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.gray900 },
  totalValue: { fontSize: 20, fontWeight: '800', color: colors.primary },
});
