import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { aiApi } from '@/lib/api';
import { colors, spacing, radius } from '@/lib/theme';
import ProductCard from '@/components/ProductCard';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  products?: any[];
}

export default function AiScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Привет! Я AI-стилист. Расскажи, что ищешь — повод, стиль, размер, бюджет — и я подберу варианты из каталога.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const send = async () => {
    if (!input.trim() || loading) return;
    if (!user) { Alert.alert('Нужен аккаунт', 'Войдите чтобы использовать AI-стилиста', [{ text: 'Войти', onPress: () => router.push('/auth') }, { text: 'Отмена', style: 'cancel' }]); return; }

    const msg = input;
    setInput('');
    const next: Message[] = [...messages, { role: 'user', content: msg }];
    setMessages(next);
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res: any = await aiApi.chat({ message: msg, history });
      setMessages([...next, { role: 'assistant', content: res.message, products: res.products }]);
    } catch {
      Alert.alert('Ошибка', 'Не удалось получить ответ от AI');
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd()}
          renderItem={({ item }) => (
            <View style={[styles.msgRow, item.role === 'user' && styles.msgRowUser]}>
              <View style={[styles.avatar, item.role === 'user' ? styles.avatarUser : styles.avatarBot]}>
                <Text style={styles.avatarText}>{item.role === 'user' ? '👤' : '🤖'}</Text>
              </View>
              <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
                <Text style={[styles.bubbleText, item.role === 'user' && styles.bubbleTextUser]}>
                  {item.content}
                </Text>
                {item.products && item.products.length > 0 && (
                  <View style={styles.productsGrid}>
                    {item.products.map((p: any) => (
                      <View key={p.id} style={styles.productItem}>
                        <ProductCard product={p} />
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
          ListFooterComponent={loading ? (
            <View style={styles.msgRow}>
              <View style={[styles.avatar, styles.avatarBot]}>
                <Text style={styles.avatarText}>🤖</Text>
              </View>
              <View style={[styles.bubble, styles.bubbleBot]}>
                <Text style={styles.typingDots}>• • •</Text>
              </View>
            </View>
          ) : null}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Опиши что ищешь..."
            value={input}
            onChangeText={setInput}
            onSubmitEditing={send}
            returnKeyType="send"
            editable={!loading}
            placeholderTextColor={colors.gray400}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendBtnText}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray50 },
  list: { padding: spacing.md, gap: spacing.sm },
  msgRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  msgRowUser: { flexDirection: 'row-reverse' },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarBot: { backgroundColor: colors.purpleLight },
  avatarUser: { backgroundColor: colors.primaryLight },
  avatarText: { fontSize: 16 },
  bubble: { maxWidth: '80%', borderRadius: radius.lg, padding: spacing.md },
  bubbleBot: { backgroundColor: colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  bubbleUser: { backgroundColor: colors.primary },
  bubbleText: { fontSize: 14, color: colors.gray800, lineHeight: 21 },
  bubbleTextUser: { color: colors.white },
  typingDots: { fontSize: 18, color: colors.gray400, letterSpacing: 4 },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm, gap: 4 },
  productItem: { width: 140 },
  inputRow: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray100 },
  input: { flex: 1, borderWidth: 1.5, borderColor: colors.gray200, borderRadius: radius.full, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: colors.gray900 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: colors.gray200 },
  sendBtnText: { color: colors.white, fontSize: 20, fontWeight: '700' },
});
