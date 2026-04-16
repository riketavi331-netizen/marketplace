import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '@/lib/theme';

const features = [
  { emoji: '👕', title: 'Каталог', desc: 'Одежда и обувь', route: '/catalog' },
  { emoji: '🏪', title: 'Магазины', desc: 'Найди рядом', route: '/stores' },
  { emoji: '✨', title: 'AI-стилист', desc: 'Подбор образов', route: '/ai', accent: true },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Одежда и обувь{'\n'}в одном месте</Text>
          <Text style={styles.heroSubtitle}>Локальный маркетплейс с AI-стилистом</Text>
          <View style={styles.heroButtons}>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/catalog')}>
              <Text style={styles.btnPrimaryText}>Перейти в каталог</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/ai')}>
              <Text style={styles.btnSecondaryText}>✨ AI-стилист</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features */}
        <Text style={styles.sectionTitle}>Разделы</Text>
        <View style={styles.features}>
          {features.map((f) => (
            <TouchableOpacity
              key={f.title}
              style={[styles.featureCard, f.accent && styles.featureCardAccent]}
              onPress={() => router.push(f.route as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <Text style={[styles.featureTitle, f.accent && styles.featureTitleAccent]}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray50 },
  container: { flex: 1 },
  hero: {
    backgroundColor: colors.white,
    margin: spacing.md,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTitle: { fontSize: 26, fontWeight: '800', color: colors.gray900, lineHeight: 34, marginBottom: spacing.sm },
  heroSubtitle: { fontSize: 14, color: colors.gray500, marginBottom: spacing.lg },
  heroButtons: { gap: spacing.sm },
  btnPrimary: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  btnPrimaryText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  btnSecondary: { borderWidth: 1.5, borderColor: colors.gray200, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  btnSecondaryText: { color: colors.gray700, fontWeight: '600', fontSize: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.gray900, marginHorizontal: spacing.md, marginBottom: spacing.sm },
  features: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.sm, gap: 0 },
  featureCard: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    margin: '1.5%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureCardAccent: { backgroundColor: colors.purpleLight },
  featureEmoji: { fontSize: 28, marginBottom: spacing.sm },
  featureTitle: { fontSize: 16, fontWeight: '700', color: colors.gray900, marginBottom: 4 },
  featureTitleAccent: { color: colors.purple },
  featureDesc: { fontSize: 12, color: colors.gray500 },
});
