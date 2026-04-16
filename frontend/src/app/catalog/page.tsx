'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export default function CatalogPage() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [gender, setGender] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['products', { search, categoryId, gender, page }],
    queryFn: () => productsApi.getAll({ search, categoryId, gender, page }) as any,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories() as any,
  });

  const hasFilters = categoryId || gender;

  const resetFilters = () => { setCategoryId(''); setGender(''); setPage(1); };

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">Каталог</h1>

      {/* Search + filter toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9 text-sm"
            placeholder="Поиск товаров..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
            hasFilters ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">Фильтры</span>
          {hasFilters && <span className="w-2 h-2 bg-white rounded-full sm:hidden" />}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card p-4 flex flex-col sm:flex-row gap-3">
          <select
            className="input text-sm"
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
          >
            <option value="">Все категории</option>
            {(categories as any)?.map((c: any) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>

          <select
            className="input text-sm"
            value={gender}
            onChange={(e) => { setGender(e.target.value); setPage(1); }}
          >
            <option value="">Все</option>
            <option value="MEN">Мужское</option>
            <option value="WOMEN">Женское</option>
            <option value="UNISEX">Унисекс</option>
            <option value="KIDS">Детское</option>
          </select>

          {hasFilters && (
            <button onClick={resetFilters} className="flex items-center gap-1 text-sm text-red-400 hover:text-red-600 px-2">
              <X size={14} /> Сбросить
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-gray-400">{(data as any)?.total || 0} товаров</p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card aspect-[3/4] animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {(data as any)?.items?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {(data as any)?.pages > 1 && (
            <div className="flex justify-center gap-2 flex-wrap">
              {Array.from({ length: (data as any).pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium ${p === page ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
