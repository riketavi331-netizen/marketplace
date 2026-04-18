'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { X, Plus, Trash2, ImagePlus, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { sellerApi, productsApi } from '@/lib/api';
import { useT } from '@/hooks/useT';

interface ColorEntry {
  id?: string;
  name: string;
  hex: string;
  image: string;       // URL (existing or newly uploaded)
  _file?: File | null; // pending upload
}

interface Props {
  product: any | null;
  onClose: () => void;
  onSaved: () => void;
}

const GENDER_OPTIONS = ['MEN', 'WOMEN', 'UNISEX', 'KIDS'] as const;

export default function ProductFormModal({ product, onClose, onSaved }: Props) {
  const t = useT();
  const isEdit = !!product;
  const imageInputRef = useRef<HTMLInputElement>(null);

  // ── form state ──────────────────────────────────────────────
  const [name, setName]           = useState(product?.name ?? '');
  const [desc, setDesc]           = useState(product?.description ?? '');
  const [price, setPrice]         = useState(product?.price ? String(product.price) : '');
  const [oldPrice, setOldPrice]   = useState(product?.oldPrice ? String(product.oldPrice) : '');
  const [stock, setStock]         = useState(product?.stock ? String(product.stock) : '0');
  const [brand, setBrand]         = useState(product?.brand ?? '');
  const [sizes, setSizes]         = useState<string>(product?.sizes?.join(', ') ?? '');
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '');
  const [gender, setGender]       = useState<string>(product?.gender ?? '');
  const [colors, setColors]       = useState<ColorEntry[]>(
    product?.colors?.map((c: any) => ({ id: c.id, name: c.name, hex: c.hex ?? '', image: c.image ?? '' })) ?? []
  );

  // existing image URLs from server
  const [existingImages, setExistingImages] = useState<string[]>(product?.images ?? []);
  // new local files waiting to be uploaded
  const [pendingFiles, setPendingFiles]     = useState<File[]>([]);
  // preview URLs for pending files
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);

  const [status, setStatus] = useState<'DRAFT' | 'ACTIVE'>(product?.status ?? 'DRAFT');
  const [saving, setSaving] = useState(false);

  // ── categories ───────────────────────────────────────────────
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories() as any,
  });

  // set default category after load
  useEffect(() => {
    if (!categoryId && (categories as any[]).length) {
      setCategoryId((categories as any[])[0].id);
    }
  }, [categories, categoryId]);

  // cleanup blob URLs on unmount
  useEffect(() => {
    return () => { pendingPreviews.forEach(URL.revokeObjectURL); };
  }, [pendingPreviews]);

  // ── image selection ──────────────────────────────────────────
  const totalImages = existingImages.length + pendingFiles.length;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const allowed = 5 - totalImages;
    if (allowed <= 0) { toast.error('Максимум 5 фото'); return; }

    const valid = files.filter((f) => {
      if (f.size > 3 * 1024 * 1024) { toast.error(`${f.name}: файл > 3 МБ`); return false; }
      if (!f.type.startsWith('image/')) { toast.error(`${f.name}: не изображение`); return false; }
      return true;
    }).slice(0, allowed);

    if (!valid.length) return;
    setPendingFiles((prev) => [...prev, ...valid]);
    setPendingPreviews((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removePendingImage = (idx: number) => {
    URL.revokeObjectURL(pendingPreviews[idx]);
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
    setPendingPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── color helpers ────────────────────────────────────────────
  const addColor = () => setColors((prev) => [...prev, { name: '', hex: '', image: '' }]);

  const removeColor = (idx: number) => setColors((prev) => prev.filter((_, i) => i !== idx));

  const updateColor = (idx: number, field: keyof ColorEntry, value: string) => {
    setColors((prev) => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const handleColorImageSelect = async (idx: number, file: File) => {
    if (file.size > 3 * 1024 * 1024) { toast.error(`${file.name}: файл > 3 МБ`); return; }
    setColors((prev) => prev.map((c, i) => i === idx ? { ...c, _file: file, image: URL.createObjectURL(file) } : c));
  };

  // ── submit ───────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent, submitStatus: 'DRAFT' | 'ACTIVE') => {
    e.preventDefault();
    if (!name.trim())     { toast.error('Введите название'); return; }
    if (!price || isNaN(+price)) { toast.error('Введите цену'); return; }
    if (!categoryId)      { toast.error('Выберите категорию'); return; }

    setSaving(true);
    try {
      let newImageUrls: string[] = [];
      if (pendingFiles.length) {
        const res = await sellerApi.uploadImages(pendingFiles) as any;
        newImageUrls = res.urls ?? [];
      }
      const allImages = [...existingImages, ...newImageUrls];

      const resolvedColors = await Promise.all(
        colors.map(async (c) => {
          if (c._file) {
            const res = await sellerApi.uploadImages([c._file]) as any;
            return { id: c.id, name: c.name, hex: c.hex || null, image: (res.urls ?? [])[0] ?? null };
          }
          return { id: c.id, name: c.name, hex: c.hex || null, image: c.image || null };
        })
      );

      const payload = {
        name: name.trim(),
        description: desc.trim() || null,
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        stock: parseInt(stock) || 0,
        brand: brand.trim() || null,
        sizes: sizes.split(',').map((s) => s.trim()).filter(Boolean),
        categoryId,
        gender: gender || null,
        images: allImages,
        colors: resolvedColors,
        status: submitStatus,
      };

      if (isEdit) {
        await sellerApi.updateProduct(product.id, payload);
      } else {
        await sellerApi.createProduct(payload);
      }

      toast.success(submitStatus === 'ACTIVE' ? 'Товар опубликован' : 'Черновик сохранён');
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  // ── render ───────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold">
              {isEdit ? t('editProduct') : t('addProduct')}
            </h2>
            <span className={clsx(
              'text-xs px-2.5 py-1 rounded-full font-medium',
              status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            )}>
              {status === 'ACTIVE' ? t('productStatusActive') : t('productStatusDraft')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={(e) => handleSubmit(e, status)} className="p-5 space-y-5">
          {/* ── Images ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('productImages')}
              <span className="ml-1 text-xs font-normal text-gray-400">({t('productImagesHint')})</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {/* existing */}
              {existingImages.map((url, i) => (
                <div key={`ex-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 group">
                  <Image src={url} alt="" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(i)}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={18} className="text-white" />
                  </button>
                </div>
              ))}
              {/* pending previews */}
              {pendingPreviews.map((url, i) => (
                <div key={`pnd-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 group">
                  <Image src={url} alt="" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removePendingImage(i)}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={18} className="text-white" />
                  </button>
                </div>
              ))}
              {/* add button */}
              {totalImages < 5 && (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary-400 hover:bg-primary-50 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <ImagePlus size={20} />
                  <span className="text-xs">{t('addProduct').split(' ')[0]}</span>
                </button>
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>

          {/* ── Name ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('productTitle')} *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('productTitlePlaceholder')}
              className="input w-full"
              required
            />
          </div>

          {/* ── Description ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('productDesc')}</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={t('productDescPlaceholder')}
              rows={3}
              className="input w-full resize-none"
            />
          </div>

          {/* ── Price row ── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('productPrice')} *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('productOldPrice')}</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
                className="input w-full"
              />
            </div>
          </div>

          {/* ── Stock + Brand ── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('productStock')}</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('productBrand')}</label>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder={t('productBrandPlaceholder')}
                className="input w-full"
              />
            </div>
          </div>

          {/* ── Sizes ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('productSizes')}</label>
            <input
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              placeholder={t('productSizesPlaceholder')}
              className="input w-full"
            />
          </div>

          {/* ── Category + Gender ── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('productCategory')} *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="input w-full"
                required
              >
                {(categories as any[]).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('productGender')}</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="input w-full"
              >
                <option value="">—</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Colors ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">{t('productColors')}</label>
              <button
                type="button"
                onClick={addColor}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                <Plus size={14} /> {t('addColor')}
              </button>
            </div>

            {colors.length > 0 && (
              <div className="space-y-3">
                {colors.map((color, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-3 flex gap-3 items-start">
                    {/* Color image */}
                    <div className="shrink-0">
                      <label className="cursor-pointer block">
                        <div className={clsx(
                          'w-14 h-14 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-primary-400 flex items-center justify-center transition-colors',
                          color.image ? 'border-solid border-gray-200' : ''
                        )}>
                          {color.image ? (
                            <div className="relative w-full h-full">
                              <Image src={color.image} alt="" fill className="object-cover" />
                            </div>
                          ) : (
                            <ImagePlus size={18} className="text-gray-400" />
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleColorImageSelect(idx, f);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      <p className="text-[10px] text-gray-400 text-center mt-0.5">{t('colorImage')}</p>
                    </div>

                    {/* Name + hex */}
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500 mb-0.5 block">{t('colorName')}</label>
                        <input
                          value={color.name}
                          onChange={(e) => updateColor(idx, 'name', e.target.value)}
                          placeholder={t('colorNamePlaceholder')}
                          className="input w-full text-sm py-1.5"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-0.5 block">{t('colorHex')}</label>
                        <div className="flex gap-1.5 items-center">
                          <input
                            type="color"
                            value={color.hex || '#000000'}
                            onChange={(e) => updateColor(idx, 'hex', e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0.5"
                          />
                          <input
                            value={color.hex}
                            onChange={(e) => updateColor(idx, 'hex', e.target.value)}
                            placeholder="#FF0000"
                            className="input flex-1 text-sm py-1.5 font-mono"
                            maxLength={7}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeColor(idx)}
                      className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Submit ── */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline px-4"
              disabled={saving}
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e as any, 'DRAFT')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all"
              style={{ borderColor: '#d1a83a', color: '#a07020', background: '#fffbf0' }}
              disabled={saving}
            >
              {saving && status === 'DRAFT' ? <Loader2 size={15} className="animate-spin" /> : null}
              {t('saveDraft')}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e as any, 'ACTIVE')}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
              disabled={saving}
            >
              {saving && status === 'ACTIVE' ? <Loader2 size={15} className="animate-spin" /> : null}
              {t('publish')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
