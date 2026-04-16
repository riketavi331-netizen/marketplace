import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { colors, spacing, radius } from '@/lib/theme';

type Mode = 'login' | 'register';
type Method = 'email' | 'phone';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_BODY_REGEX = /^\d{9}$/;

function validate(mode: Mode, method: Method, form: any): Record<string, string> {
  const errors: Record<string, string> = {};
  if (mode === 'register' && !form.name.trim()) errors.name = 'Введите имя';
  if (method === 'email' && !EMAIL_REGEX.test(form.email))
    errors.email = 'Введите корректный email (например ivan@gmail.com)';
  if (method === 'phone' && !PHONE_BODY_REGEX.test(form.phoneBody))
    errors.phone = 'Введите 9 цифр номера';
  if (form.password.length < 6) errors.password = 'Пароль минимум 6 символов';
  return errors;
}

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [method, setMethod] = useState<Method>('email');
  const [form, setForm] = useState({ name: '', email: '', phoneBody: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { loginEmail, loginPhone, registerEmail, registerPhone } = useAuthStore();
  const router = useRouter();

  const setField = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const handle = async () => {
    const errs = validate(mode, method, form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const phone = `+995${form.phoneBody}`;
      if (mode === 'register') {
        if (method === 'email') await registerEmail(form.name, form.email, form.password);
        else await registerPhone(form.name, phone, form.password);
      } else {
        if (method === 'email') await loginEmail(form.email, form.password);
        else await loginPhone(phone, form.password);
      }
      router.back();
    } catch (e: any) {
      const msg = e?.message || 'Проверьте введённые данные';
      Alert.alert('Ошибка', Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>
            {mode === 'login' ? 'Вход' : 'Регистрация'}
          </Text>

          {/* Tabs Email / Phone */}
          <View style={styles.tabs}>
            {(['email', 'phone'] as Method[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.tab, method === m && styles.tabActive]}
                onPress={() => { setMethod(m); setErrors({}); }}
              >
                <Text style={[styles.tabText, method === m && styles.tabTextActive]}>
                  {m === 'email' ? '✉️ Email' : '📱 Телефон'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Name */}
          {mode === 'register' && (
            <View style={styles.field}>
              <Text style={styles.label}>Имя</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Иван Иванов"
                value={form.name}
                onChangeText={(v) => setField('name', v)}
                placeholderTextColor={colors.gray400}
              />
              {errors.name && <Text style={styles.error}>{errors.name}</Text>}
            </View>
          )}

          {/* Email */}
          {method === 'email' && (
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="ivan@gmail.com"
                value={form.email}
                onChangeText={(v) => setField('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.gray400}
              />
              {errors.email && <Text style={styles.error}>{errors.email}</Text>}
            </View>
          )}

          {/* Phone */}
          {method === 'phone' && (
            <View style={styles.field}>
              <Text style={styles.label}>Номер телефона</Text>
              <View style={[styles.phoneRow, errors.phone && styles.inputError]}>
                <View style={styles.phonePrefix}>
                  <Text style={styles.phonePrefixText}>🇬🇪 +995</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="551234567"
                  value={form.phoneBody}
                  onChangeText={(v) => setField('phoneBody', v.replace(/\D/g, '').slice(0, 9))}
                  keyboardType="number-pad"
                  maxLength={9}
                  placeholderTextColor={colors.gray400}
                />
                <Text style={[styles.phoneCount, form.phoneBody.length === 9 && styles.phoneCountDone]}>
                  {form.phoneBody.length}/9
                </Text>
              </View>
              {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}
            </View>
          )}

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Пароль</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Минимум 6 символов"
              value={form.password}
              onChangeText={(v) => setField('password', v)}
              secureTextEntry
              placeholderTextColor={colors.gray400}
            />
            {errors.password && <Text style={styles.error}>{errors.password}</Text>}
          </View>

          <TouchableOpacity style={styles.btn} onPress={handle} disabled={loading}>
            <Text style={styles.btnText}>
              {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); }}
            style={styles.switchBtn}
          >
            <Text style={styles.switchText}>
              {mode === 'login' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
              <Text style={styles.switchLink}>
                {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  container: { padding: spacing.lg, paddingTop: spacing.xl },
  title: { fontSize: 26, fontWeight: '800', color: colors.gray900, marginBottom: spacing.lg },
  tabs: { flexDirection: 'row', backgroundColor: colors.gray100, borderRadius: radius.xl, padding: 4, marginBottom: spacing.lg },
  tab: { flex: 1, paddingVertical: 8, borderRadius: radius.lg, alignItems: 'center' },
  tabActive: { backgroundColor: colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { fontSize: 14, color: colors.gray500 },
  tabTextActive: { color: colors.gray900, fontWeight: '600' },
  field: { marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.gray700, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: colors.gray200, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.gray900 },
  inputError: { borderColor: '#ef4444' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.gray200, borderRadius: radius.md, overflow: 'hidden' },
  phonePrefix: { paddingHorizontal: 12, paddingVertical: 12, backgroundColor: colors.gray50, borderRightWidth: 1, borderRightColor: colors.gray200 },
  phonePrefixText: { fontSize: 14, fontWeight: '600', color: colors.gray600 },
  phoneInput: { flex: 1, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15, color: colors.gray900 },
  phoneCount: { paddingRight: 10, fontSize: 12, color: colors.gray300 },
  phoneCountDone: { color: '#22c55e' },
  error: { color: '#ef4444', fontSize: 12, marginTop: 4 },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', marginTop: spacing.sm },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  switchBtn: { marginTop: spacing.lg, alignItems: 'center' },
  switchText: { fontSize: 14, color: colors.gray500 },
  switchLink: { color: colors.primary, fontWeight: '600' },
});
