import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { ordersApi } from '@/lib/api';
import { colors, spacing, radius } from '@/lib/theme';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Ожидает', color: '#f59e0b' },
  CONFIRMED: { label: 'Подтверждён', color: '#3b82f6' },
  SHIPPED:   { label: 'В пути', color: '#8b5cf6' },
  DELIVERED: { label: 'Доставлен', color: '#22c55e' },
  CANCELLED: { label: 'Отменён', color: '#ef4444' },
};

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const { data: orders } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersApi.getMine() as any,
    enabled: !!user,
  });

  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.guestContainer}>
          <Text style={styles.guestEmoji}>👤</Text>
          <Text style={styles.guestTitle}>Войдите в аккаунт</Text>
          <Text style={styles.guestSubtitle}>Чтобы видеть заказы и управлять профилем</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/auth')}>
            <Text style={styles.btnPrimaryText}>Войти / Зарегистрироваться</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name[0]?.toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
          <TouchableOpacity
            onPress={() => Alert.alert('Выйти', 'Вы уверены?', [
              { text: 'Отмена', style: 'cancel' },
              { text: 'Выйти', style: 'destructive', onPress: logout },
            ])}
          >
            <Text style={styles.logoutText}>Выйти</Text>
          </TouchableOpacity>
        </View>

        {/* Orders */}
        <Text style={styles.sectionTitle}>Мои заказы</Text>

        {!(orders as any)?.length ? (
          <View style={styles.noOrders}>
            <Text style={styles.noOrdersEmoji}>📦</Text>
            <Text style={styles.noOrdersText}>Заказов пока нет</Text>
          </View>
        ) : (
          (orders as any).map((order: any) => {
            const s = STATUS_LABELS[order.status] || { label: order.status, color: colors.gray400 };
            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => router.push(`/orders/${order.id}`)}
                activeOpacity={0.8}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: s.color + '20' }]}>
                    <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
                  </View>
                </View>
                <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('ru')}</Text>
                {order.items?.slice(0, 2).map((item: any) => (
                  <Text key={item.id} style={styles.orderItem} numberOfLines={1}>
                    {item.product?.name} × {item.qty}
                  </Text>
                ))}
                <View style={styles.orderFooter}>
                  <Text style={styles.orderTotal}>{Number(order.total).toLocaleString('ru')} ₽</Text>
                  <Text style={styles.orderStore}>{order.store?.name}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray50 },
  container: { padding: spacing.md },
  userCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: colors.primary },
  userName: { fontSize: 16, fontWeight: '700', color: colors.gray900 },
  userEmail: { fontSize: 13, color: colors.gray400, marginTop: 2 },
  logoutText: { fontSize: 13, color: colors.red },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.gray900, marginBottom: spacing.sm },
  orderCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderId: { fontSize: 14, fontWeight: '700', color: colors.gray900 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full },
  statusText: { fontSize: 12, fontWeight: '600' },
  orderDate: { fontSize: 12, color: colors.gray400, marginBottom: spacing.sm },
  orderItem: { fontSize: 13, color: colors.gray600, marginBottom: 2 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.gray100 },
  orderTotal: { fontSize: 15, fontWeight: '700', color: colors.gray900 },
  orderStore: { fontSize: 13, color: colors.gray400 },
  guestContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  guestEmoji: { fontSize: 60, marginBottom: spacing.md },
  guestTitle: { fontSize: 20, fontWeight: '700', color: colors.gray900, marginBottom: spacing.sm },
  guestSubtitle: { fontSize: 14, color: colors.gray400, textAlign: 'center', marginBottom: spacing.lg, lineHeight: 20 },
  noOrders: { alignItems: 'center', paddingVertical: spacing.xl },
  noOrdersEmoji: { fontSize: 40, marginBottom: spacing.sm },
  noOrdersText: { fontSize: 14, color: colors.gray400 },
  btnPrimary: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: spacing.xl, alignItems: 'center' },
  btnPrimaryText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
