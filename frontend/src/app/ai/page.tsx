'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { aiApi } from '@/lib/api';
import { Send, Sparkles, Bot, User } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ProductCard from '@/components/ProductCard';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  products?: any[];
}

export default function AiPage() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Привет! Я AI-стилист. Расскажи, что ищешь — для какого случая, стиль, размер, бюджет — и я подберу варианты из каталога.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    if (!user) { toast.error('Войдите чтобы использовать AI-стилиста'); return; }

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res: any = await aiApi.chat({ message: userMessage, history });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.message, products: res.products }]);
    } catch {
      toast.error('Ошибка AI-стилиста');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100dvh - 120px)' }}>
      {/* Title */}
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <Sparkles className="text-purple-600" size={22} />
        <h1 className="text-lg md:text-2xl font-bold">AI-стилист</h1>
      </div>

      {!user && (
        <div className="card p-3 bg-yellow-50 border-yellow-200 text-sm mb-3 flex-shrink-0">
          Для использования AI-стилиста нужно{' '}
          <Link href="/auth" className="text-primary-600 font-medium">войти в аккаунт</Link>
        </div>
      )}

      {/* Chat messages — scrollable */}
      <div className="flex-1 overflow-y-auto card p-3 md:p-4 space-y-4 mb-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 md:gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
              msg.role === 'assistant' ? 'bg-purple-100 text-purple-600' : 'bg-primary-100 text-primary-600'
            }`}>
              {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className={`max-w-xs md:max-w-lg flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-3 py-2 md:px-4 md:py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'assistant' ? 'bg-gray-100 text-gray-800' : 'bg-primary-600 text-white'
              }`}>
                {msg.content}
              </div>
              {msg.products && msg.products.length > 0 && (
                <div className="grid grid-cols-2 gap-2 w-full">
                  {msg.products.map((p: any) => <ProductCard key={p.id} product={p} />)}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 md:gap-3">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
              <Bot size={14} />
            </div>
            <div className="bg-gray-100 px-4 py-3 rounded-2xl flex gap-1.5 items-center">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input — fixed at bottom */}
      <div className="flex gap-2 flex-shrink-0">
        <input
          ref={inputRef}
          className="input flex-1 text-sm"
          placeholder="Опиши что ищешь..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          disabled={loading || !user}
        />
        <button
          onClick={send}
          disabled={loading || !user || !input.trim()}
          className="btn-primary px-3 md:px-4 flex-shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
