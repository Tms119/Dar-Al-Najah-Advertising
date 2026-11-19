'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { ConvexError } from 'convex/values';
import { api } from '@convex/_generated/api';
import Mock, { SHAPES } from '@/components/Mock';
import Toggle from '@/components/admin/Toggle';

const blankCat = { id: null, slug: '', name: '', shortName: '', tagline: '', color: '#2B3BFF', tint: '#E6E8FF', heroShape: 'card', isActive: true };
const errText = (e) => (e instanceof ConvexError ? String(e.data) : 'Something went wrong.');

export default function AdminMenu() {
  const structure = useQuery(api.admin.structure);
  const saveCategory = useMutation(api.admin.saveCategory);
  const moveCategory = useMutation(api.admin.moveCategory);
  const deleteCategory = useMutation(api.admin.deleteCategory);
  const saveGroup = useMutation(api.admin.saveGroup);
  const moveGroup = useMutation(api.admin.moveGroup);
  const deleteGroup = useMutation(api.admin.deleteGroup);
  const [editing, setEditing] = useState(null); // category form state
  const [openGroup, setOpenGroup] = useState(null);
  const [error, setError] = useState(null);

  const run = async (fn) => { setError(null); try { await fn(); } catch (e) { setError(errText(e)); } };

  if (structure === undefined) return <p className="a-muted">Loading…</p>;

  return (
    <>
      <header className="a-head">
        <div>
          <h1>Menu & categories</h1>
          <p className="a-muted">The website menu is built from these. Empty groups and hidden categories never appear.</p>
        </div>
        <button className="a-btn a-btn-primary" onClick={() => setEditing({ ...blankCat })}>+ New category</button>
      </header>
      {error && <p className="a-error" role="alert">{error}</p>}

      {editing && (
        <CategoryForm
          value={editing}
          onCancel={() => setEditing(null)}
          onSave={(v) => run(async () => { await saveCategory(v); setEditing(null); })}
        />
      )}

      {structure.map((c, ci) => (
        <section key={c._id} className={`a-card a-cat ${c.isActive ? '' : 'is-off'}`}>
          <div className="a-cat-head">
            <span className="a-cat-swatch" style={{ background: c.tint }}><Mock shape={c.heroShape} color={c.color} /></span>
            <div className="a-cat-title">
              <h2>{c.name}</h2>
              <span className="a-muted a-small">/{c.slug} · {c.groups.reduce((a, g) => a + g.productCount, 0)} placements</span>
            </div>
            <div className="a-actions">
              <label className="a-inline a-small"><Toggle checked={c.isActive} onChange={(v) => run(() => saveCategory({ id: c._id, slug: c.slug, name: c.name, shortName: c.shortName, tagline: c.tagline, color: c.color, tint: c.tint, heroShape: c.heroShape, isActive: v }))} label={`Show ${c.name}`} /> Live</label>
              <button className="a-btn a-btn-sm a-btn-ghost" disabled={ci === 0} onClick={() => run(() => moveCategory({ id: c._id, direction: 'up' }))} aria-label="Move up">↑</button>
              <button className="a-btn a-btn-sm a-btn-ghost" disabled={ci === structure.length - 1} onClick={() => run(() => moveCategory({ id: c._id, direction: 'down' }))} aria-label="Move down">↓</button>
              <button className="a-btn a-btn-sm" onClick={() => setEditing({ id: c._id, slug: c.slug, name: c.name, shortName: c.shortName, tagline: c.tagline, color: c.color, tint: c.tint, heroShape: c.heroShape, isActive: c.isActive })}>Edit</button>
              <button className="a-btn a-btn-sm a-btn-danger" onClick={() => window.confirm(`Delete category "${c.name}"?`) && run(() => deleteCategory({ id: c._id }))} aria-label="Delete category">✕</button>
            </div>
          </div>

          <ul className="a-groups">
            {c.groups.map((g, gi) => (
              <li key={g._id}>
                <div className="a-group-row">
                  <button className="a-group-name" onClick={() => setOpenGroup(openGroup === g._id ? null : g._id)}>
                    <span className={`a-caret ${openGroup === g._id ? 'is-open' : ''}`}>▸</span>{g.name} <span className="a-muted a-small">({g.productCount})</span>
                  </button>
                  <div className="a-actions">
                    <button className="a-btn a-btn-sm a-btn-ghost" disabled={gi === 0} onClick={() => run(() => moveGroup({ id: g._id, direction: 'up' }))} aria-label="Move up">↑</button>
                    <button className="a-btn a-btn-sm a-btn-ghost" disabled={gi === c.groups.length - 1} onClick={() => run(() => moveGroup({ id: g._id, direction: 'down' }))} aria-label="Move down">↓</button>
                    <button className="a-btn a-btn-sm" onClick={() => { const name = window.prompt('Group name', g.name); if (name) run(() => saveGroup({ id: g._id, categoryId: c._id, name })); }}>Rename</button>
                    <button className="a-btn a-btn-sm a-btn-danger" onClick={() => window.confirm(`Delete group "${g.name}"?`) && run(() => deleteGroup({ id: g._id }))} aria-label="Delete group">✕</button>
                  </div>
                </div>
                {openGroup === g._id && <GroupProducts groupId={g._id} onError={setError} />}
              </li>
            ))}
          </ul>
          <button className="a-link" onClick={() => { const name = window.prompt(`New group in ${c.name}`); if (name) run(() => saveGroup({ id: null, categoryId: c._id, name })); }}>+ Add group</button>
        </section>
      ))}
    </>
  );
}

function GroupProducts({ groupId, onError }) {
  const items = useQuery(api.admin.groupProducts, { groupId });
  const move = useMutation(api.admin.moveProductInGroup);
  if (items === undefined) return <p className="a-muted a-small a-indent">Loading…</p>;
  if (!items.length) return <p className="a-muted a-small a-indent">No products yet — assign them from a product&apos;s editor.</p>;
  return (
    <ol className="a-order">
      {items.map((it, i) => (
        <li key={it.linkId} className={it.isActive ? '' : 'is-off'}>
          <span>{it.name}{!it.isActive && <span className="a-tag-off">hidden</span>}</span>
          <span className="a-actions">
            <button className="a-btn a-btn-xs a-btn-ghost" disabled={i === 0} onClick={() => move({ linkId: it.linkId, direction: 'up' }).catch((e) => onError(errText(e)))} aria-label="Move up">↑</button>
            <button className="a-btn a-btn-xs a-btn-ghost" disabled={i === items.length - 1} onClick={() => move({ linkId: it.linkId, direction: 'down' }).catch((e) => onError(errText(e)))} aria-label="Move down">↓</button>
          </span>
        </li>
      ))}
    </ol>
  );
}

function CategoryForm({ value, onSave, onCancel }) {
  const [v, setV] = useState(value);
  const set = (k, x) => setV((s) => ({ ...s, [k]: x }));
  const slugify = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return (
    <form className="a-card a-catform" onSubmit={(e) => { e.preventDefault(); onSave(v); }}>
      <h2>{v.id ? 'Edit category' : 'New category'}</h2>
      <div className="a-row3">
        <label className="a-field"><span>Name</span><input className="a-input" required maxLength={60} value={v.name} onChange={(e) => { set('name', e.target.value); if (!v.id) set('slug', slugify(e.target.value)); }} /></label>
        <label className="a-field"><span>Short name (menu pill)</span><input className="a-input" required maxLength={20} value={v.shortName} onChange={(e) => set('shortName', e.target.value)} /></label>
        <label className="a-field"><span>Web address</span><input className="a-input" required value={v.slug} onChange={(e) => set('slug', slugify(e.target.value))} /></label>
      </div>
      <label className="a-field"><span>Tagline</span><input className="a-input" maxLength={160} value={v.tagline} onChange={(e) => set('tagline', e.target.value)} /></label>
      <div className="a-row3">
        <label className="a-field"><span>Colour</span><input className="a-input a-color" type="color" value={v.color} onChange={(e) => set('color', e.target.value.toUpperCase())} /></label>
        <label className="a-field"><span>Background tint</span><input className="a-input a-color" type="color" value={v.tint} onChange={(e) => set('tint', e.target.value.toUpperCase())} /></label>
        <label className="a-field"><span>Illustration</span>
          <select className="a-input" value={v.heroShape} onChange={(e) => set('heroShape', e.target.value)}>{SHAPES.map((s) => <option key={s}>{s}</option>)}</select>
        </label>
      </div>
      <div className="a-actions">
        <button type="button" className="a-btn" onClick={onCancel}>Cancel</button>
        <button className="a-btn a-btn-primary">Save category</button>
      </div>
    </form>
  );
}
