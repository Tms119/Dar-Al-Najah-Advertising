'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import Mock, { SHAPES } from '@/components/Mock';
import Toggle from './Toggle';
import { errorMessage } from '@/lib/errors';
import { slugify } from '@/lib/slugify';
import { MAX_UPLOAD_MB as MAX_MB, checkImageFile, uploadToStorage } from '@/lib/upload';

export default function ProductEditor({ product, structure }) {
  const router = useRouter();
  const save = useMutation(api.admin.saveProduct);
  const genUploadUrl = useMutation(api.admin.generateUploadUrl);

  const [f, setF] = useState(() => ({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    badge: product?.badge ?? '',
    mockupShape: product?.mockupShape ?? 'card',
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    groupIds: product?.groupIds ?? [],
    primaryGroupId: product?.primaryGroupId ?? null,
  }));
  const [images, setImages] = useState(() => product?.images ?? []); // [{id, url}]
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const primaryCat = structure.find((c) => c.groups.some((g) => g._id === f.primaryGroupId));
  const color = primaryCat?.color ?? '#2B3BFF';

  /* ---------- images ---------- */
  const upload = async (files) => {
    setError(null);
    const list = [...files].filter((file) => {
      const invalid = checkImageFile(file);
      if (invalid) setError(invalid);
      return !invalid;
    });
    if (!list.length) return;
    setUploading(true);
    try {
      for (const file of list) {
        const storageId = await uploadToStorage(genUploadUrl, file);
        setImages((im) => [...im, { id: storageId, url: URL.createObjectURL(file) }]);
      }
    } catch {
      setError('An image failed to upload. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  const moveImage = (i, d) => setImages((im) => {
    const j = i + d; if (j < 0 || j >= im.length) return im;
    const c = [...im]; [c[i], c[j]] = [c[j], c[i]]; return c;
  });

  /* ---------- groups ---------- */
  const toggleGroup = (gid) => {
    const on = f.groupIds.includes(gid);
    const groupIds = on ? f.groupIds.filter((x) => x !== gid) : [...f.groupIds, gid];
    let primaryGroupId = f.primaryGroupId;
    if (on && primaryGroupId === gid) primaryGroupId = groupIds[0] ?? null;
    if (!on && !primaryGroupId) primaryGroupId = gid;
    setF((x) => ({ ...x, groupIds, primaryGroupId }));
  };

  /* ---------- save ---------- */
  const onSave = async (e) => {
    e.preventDefault();
    setError(null);
    if (!f.primaryGroupId) { setError('Choose at least one menu group so the product appears on the site.'); return; }
    setSaving(true);
    try {
      await save({
        id: product?._id ?? null,
        slug: f.slug,
        name: f.name,
        description: f.description,
        badge: f.badge.trim() ? f.badge : null,
        mockupShape: f.mockupShape,
        imageIds: images.map((im) => im.id),
        isFeatured: f.isFeatured,
        isActive: f.isActive,
        groupIds: f.groupIds,
        primaryGroupId: f.primaryGroupId,
      });
      router.push('/admin/products');
    } catch (err) {
      setError(errorMessage(err, 'Could not save. Check the fields and try again.'));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSave} className="a-editor">
      <header className="a-head a-head-sticky">
        <div>
          <Link href="/admin/products" className="a-link">← Products</Link>
          <h1>{product ? f.name || 'Edit product' : 'New product'}</h1>
        </div>
        <div className="a-head-actions">
          <label className="a-inline"><Toggle checked={f.isActive} onChange={(v) => set('isActive', v)} label="Live on website" /> Live</label>
          <button className="a-btn a-btn-primary" disabled={saving || uploading}>{saving ? 'Saving…' : 'Save product'}</button>
        </div>
      </header>
      {error && <p className="a-error" role="alert">{error}</p>}

      <div className="a-grid">
        <div className="a-col">
          <section className="a-card">
            <h2>Details</h2>
            <label className="a-field"><span>Name</span>
              <input className="a-input" required maxLength={80} value={f.name} onChange={(e) => { set('name', e.target.value); if (!slugTouched) set('slug', slugify(e.target.value)); }} />
            </label>
            <label className="a-field"><span>Web address</span>
              <div className="a-prefix"><em>/products/</em><input className="a-input" required maxLength={80} value={f.slug} onChange={(e) => { setSlugTouched(true); set('slug', slugify(e.target.value)); }} /></div>
            </label>
            <label className="a-field"><span>Description</span>
              <textarea className="a-input" rows={5} required maxLength={2000} value={f.description} onChange={(e) => set('description', e.target.value)} />
            </label>
            <div className="a-row3">
              <label className="a-field"><span>Badge (optional)</span><input className="a-input" maxLength={20} value={f.badge} onChange={(e) => set('badge', e.target.value)} placeholder="Bestseller" /></label>
              <label className="a-field a-inline-field"><span>Featured on home page</span><Toggle checked={f.isFeatured} onChange={(v) => set('isFeatured', v)} label="Featured" /></label>
            </div>
          </section>

        </div>

        <div className="a-col">
          <section className="a-card">
            <div className="a-card-head">
              <h2>Photos</h2>
              <span className={`a-display-badge ${images.length ? 'is-photo' : ''}`}>{images.length ? 'Website shows: photos' : 'Website shows: illustration'}</span>
            </div>
            <p className="a-muted a-small">Upload real photos to replace the illustration everywhere (cards, product page, menu). First photo is the main one. JPG/PNG/WebP, up to {MAX_MB} MB.</p>
            <div className="a-images">
              {images.map((im, i) => (
                <div key={im.id} className="a-image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im.url} alt="" />
                  <div className="a-image-bar">
                    <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label="Move left">←</button>
                    <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} aria-label="Move right">→</button>
                    <button type="button" onClick={() => setImages(images.filter((_, k) => k !== i))} aria-label="Remove photo">✕</button>
                  </div>
                </div>
              ))}
              <label className={`a-upload ${uploading ? 'is-busy' : ''}`}>
                <input type="file" accept="image/*" multiple hidden onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
                {uploading ? 'Uploading…' : '+ Add photos'}
              </label>
            </div>
            {images.length > 0 && (
              <button type="button" className="a-link" style={{ marginTop: 10 }} onClick={() => window.confirm('Remove all photos and show the illustration instead? (Takes effect when you save.)') && setImages([])}>
                Use illustration instead
              </button>
            )}
          </section>

          <section className="a-card">
            <h2>Illustration</h2>
            <div className="a-shape-preview" style={{ background: primaryCat?.tint ?? '#eee' }}><Mock shape={f.mockupShape} color={color} /></div>
            <select className="a-input" value={f.mockupShape} onChange={(e) => set('mockupShape', e.target.value)}>
              {SHAPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </section>

          <section className="a-card">
            <h2>Show in menu</h2>
            <p className="a-muted a-small">Tick every menu group this product should appear in. ● marks the main one (sets breadcrumb and colour).</p>
            {structure.map((c) => (
              <div key={c._id} className="a-groupset">
                <h3><i className="dot" style={{ background: c.color }} />{c.name}{!c.isActive && <span className="a-tag-off">hidden</span>}</h3>
                {c.groups.map((g) => {
                  const on = f.groupIds.includes(g._id);
                  return (
                    <div key={g._id} className="a-groupline">
                      <label className="a-check"><input type="checkbox" checked={on} onChange={() => toggleGroup(g._id)} /> {g.name}</label>
                      {on && (
                        <label className={`a-primary ${f.primaryGroupId === g._id ? 'is-on' : ''}`}>
                          <input type="radio" name="primary" checked={f.primaryGroupId === g._id} onChange={() => set('primaryGroupId', g._id)} /> main
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </section>
        </div>
      </div>
    </form>
  );
}
