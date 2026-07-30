import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Plus, Eye, Pencil, Copy, Trash2, Upload, Archive, Search,
  Save, X, ChevronUp, ChevronDown, FileText, Settings, GripVertical,
} from 'lucide-react';
import { toast } from 'react-toastify';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader';
import AdminKpiCard from '../../components/admin/AdminKpiCard';
import AdminDataTable from '../../components/admin/AdminDataTable';
import AdminPagination from '../../components/admin/AdminPagination';
import BlogBlocks from '../../components/blog/BlogBlocks';
import { useAdminPaginatedList } from '../../hooks/useAdminPaginatedList';
import { BLOG_BLOCK_TYPES, createEmptyBlock, slugify } from '../../lib/blog-blocks';
import {
  EMPTY_BLOG,
  adminFetchAnalytics,
  adminFetchBlogs,
  adminFetchBlog,
  adminCreateBlog,
  adminUpdateBlog,
  adminPublishBlog,
  adminUnpublishBlog,
  adminDuplicateBlog,
  adminDeleteBlog,
} from '../../lib/admin-blog-api';
import { focusRing } from '../../theme/tokens';

const PAGE_SIZE = 12;

const EDITOR_TABS = [
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'preview', label: 'Preview', icon: Eye },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'meta', label: 'Meta', icon: Settings },
];

const BLOCK_LABELS = {
  heading: 'Heading',
  paragraph: 'Paragraph',
  bullets: 'Bullet list',
  numbered: 'Numbered list',
  code: 'Code block',
  quote: 'Quote',
  table: 'Table',
  divider: 'Divider',
};

function BlockEditor({ blocks, onChange }) {
  const updateBlock = (index, patch) => {
    const next = blocks.map((b, i) => (i === index ? { ...b, ...patch } : b));
    onChange(next);
  };

  const updateListItem = (blockIndex, itemIndex, value) => {
    const block = blocks[blockIndex];
    const items = [...block.items];
    items[itemIndex] = value;
    updateBlock(blockIndex, { items });
  };

  const moveBlock = (index, dir) => {
    const next = [...blocks];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const removeBlock = (index) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const addBlock = (type) => {
    onChange([...blocks, createEmptyBlock(type)]);
  };

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => (
        <div key={i} className="rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-[#78716C]" />
              <span className="text-xs font-semibold uppercase tracking-wide text-[#6B5A48]">
                {BLOCK_LABELS[block.type] || block.type}
              </span>
            </div>
            <div className="flex gap-1">
              <button type="button" onClick={() => moveBlock(i, -1)} className={`rounded p-1 text-[#78716C] hover:bg-[#F7F3EC] ${focusRing}`} aria-label="Move up">
                <ChevronUp className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => moveBlock(i, 1)} className={`rounded p-1 text-[#78716C] hover:bg-[#F7F3EC] ${focusRing}`} aria-label="Move down">
                <ChevronDown className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => removeBlock(i)} className={`rounded p-1 text-rose-600 hover:bg-rose-50 ${focusRing}`} aria-label="Delete block">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {block.type === 'heading' && (
            <div className="space-y-2">
              <select
                value={block.level}
                onChange={(e) => updateBlock(i, { level: parseInt(e.target.value, 10) })}
                className="rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] px-2 py-1 text-sm"
              >
                <option value={2}>H2</option>
                <option value={3}>H3</option>
              </select>
              <input
                value={block.text}
                onChange={(e) => updateBlock(i, { text: e.target.value })}
                placeholder="Heading text"
                className="w-full rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2 text-sm outline-none focus:border-[#C4A574]"
              />
            </div>
          )}

          {(block.type === 'paragraph' || block.type === 'quote') && (
            <textarea
              value={block.text}
              onChange={(e) => updateBlock(i, { text: e.target.value })}
              rows={block.type === 'quote' ? 3 : 4}
              placeholder="Text (supports **bold**, *italic*, `code`, [links](url))"
              className="w-full rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2 text-sm outline-none focus:border-[#C4A574]"
            />
          )}

          {(block.type === 'bullets' || block.type === 'numbered') && (
            <div className="space-y-2">
              {block.items.map((item, j) => (
                <div key={j} className="flex gap-2">
                  <input
                    value={item}
                    onChange={(e) => updateListItem(i, j, e.target.value)}
                    className="flex-1 rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2 text-sm outline-none focus:border-[#C4A574]"
                  />
                  <button
                    type="button"
                    onClick={() => updateBlock(i, { items: block.items.filter((_, k) => k !== j) })}
                    className="text-rose-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => updateBlock(i, { items: [...block.items, ''] })}
                className="text-xs text-[#6B5A48] hover:underline"
              >
                + Add item
              </button>
            </div>
          )}

          {block.type === 'code' && (
            <div className="space-y-2">
              <input
                value={block.lang}
                onChange={(e) => updateBlock(i, { lang: e.target.value })}
                placeholder="Language (javascript, python...)"
                className="w-full rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2 text-sm outline-none focus:border-[#C4A574]"
              />
              <textarea
                value={block.code}
                onChange={(e) => updateBlock(i, { code: e.target.value })}
                rows={8}
                className="w-full rounded-lg border border-[#E5DCCE] bg-[#1C1917] px-3 py-2 font-mono text-sm text-[#FFFDF8] outline-none"
              />
            </div>
          )}

          {block.type === 'table' && (
            <div className="space-y-3 overflow-x-auto">
              <div className="flex gap-2">
                {block.headers.map((h, j) => (
                  <input
                    key={j}
                    value={h}
                    onChange={(e) => {
                      const headers = [...block.headers];
                      headers[j] = e.target.value;
                      updateBlock(i, { headers });
                    }}
                    className="min-w-[100px] flex-1 rounded border border-[#E5DCCE] bg-[#F7F3EC] px-2 py-1 text-sm"
                  />
                ))}
              </div>
              {block.rows.map((row, j) => (
                <div key={j} className="flex gap-2">
                  {row.map((cell, k) => (
                    <input
                      key={k}
                      value={cell}
                      onChange={(e) => {
                        const rows = block.rows.map((r) => [...r]);
                        rows[j][k] = e.target.value;
                        updateBlock(i, { rows });
                      }}
                      className="min-w-[100px] flex-1 rounded border border-[#E5DCCE] bg-[#F7F3EC] px-2 py-1 text-sm"
                    />
                  ))}
                </div>
              ))}
            </div>
          )}

          {block.type === 'divider' && <hr className="border-[#E5DCCE]" />}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        {BLOG_BLOCK_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => addBlock(type)}
            className={`rounded-lg border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-1.5 text-xs font-medium text-[#6B5A48] hover:bg-[#F7F3EC] ${focusRing}`}
          >
            + {BLOCK_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AdminBlogsHub() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isCreate = location.pathname.endsWith('/create');
  const isEdit = location.pathname.includes('/edit/') && Boolean(id);

  const [analytics, setAnalytics] = useState(null);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [form, setForm] = useState(EMPTY_BLOG);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [coverFile, setCoverFile] = useState(null);

  useEffect(() => {
    adminFetchAnalytics()
      .then(setAnalytics)
      .catch(() => toast.error('Failed to load blog analytics'));
  }, []);

  const fetcher = useCallback(async ({ page, limit, status: s, q: query }) => {
    const data = await adminFetchBlogs({ status: s || undefined, q: query || undefined, page, limit });
    return { items: data.blogs || [], total: data.total || 0 };
  }, []);

  const { page, goToPage, rows: blogs, total, totalPages, limit, loading, error, reload } = useAdminPaginatedList(
    fetcher,
    { status, q },
    PAGE_SIZE
  );

  useEffect(() => {
    if (error) toast.error('Failed to load blogs');
  }, [error]);

  // The create/edit editor is a full-screen drawer that opens on top of this same
  // dashboard page (so the sidebar never disappears) — driven entirely by the route.
  useEffect(() => {
    if (isCreate) {
      setForm(EMPTY_BLOG);
      setEditId(null);
      setActiveTab('content');
      setDrawerOpen(true);
    } else if (isEdit) {
      setActiveTab('content');
      adminFetchBlog(id)
        .then((blog) => {
          setForm({
            ...EMPTY_BLOG,
            ...blog,
            tags: blog.tags || [],
            content: Array.isArray(blog.content) ? blog.content : [{ type: 'paragraph', text: '' }],
            seo: blog.seo || EMPTY_BLOG.seo,
            faq: blog.faq || [],
            relatedSlugs: blog.relatedSlugs || [],
          });
          setEditId(id);
          setDrawerOpen(true);
        })
        .catch(() => toast.error('Failed to load blog'));
    } else {
      setDrawerOpen(false);
    }
  }, [isCreate, isEdit, id]);

  const patchForm = (patch) => setForm((f) => ({ ...f, ...patch }));

  const run = async (fn, okMsg) => {
    try {
      await fn();
      toast.success(okMsg);
      reload();
    } catch {
      toast.error('Action failed');
    }
  };

  const handleSave = async (publish = false) => {
    if (!form.title || !form.category) {
      toast.error('Title and category are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.title),
        coverImageFile: coverFile,
        status: publish ? 'published' : form.status,
      };

      let saved;
      if (editId) {
        saved = await adminUpdateBlog(editId, payload);
        if (publish) saved = await adminPublishBlog(editId);
      } else {
        saved = await adminCreateBlog(payload);
        if (publish) saved = await adminPublishBlog(saved._id);
        setEditId(saved._id);
      }

      setForm((f) => ({ ...f, ...saved, content: saved.content || f.content }));
      setCoverFile(null);
      toast.success(publish ? 'Published' : 'Saved');
      reload();
      if (!editId) navigate(`/admin/blogs/edit/${saved._id}`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const closeDrawer = () => navigate('/admin/blogs');

  const handleUnpublish = async () => {
    if (!editId) return;
    try {
      await adminUnpublishBlog(editId);
      patchForm({ status: 'draft' });
      toast.success('Unpublished');
      reload();
    } catch {
      toast.error('Unpublish failed');
    }
  };

  const addFaq = () => patchForm({ faq: [...(form.faq || []), { q: '', a: '' }] });
  const updateFaq = (i, field, value) => {
    const faq = form.faq.map((item, j) => (j === i ? { ...item, [field]: value } : item));
    patchForm({ faq });
  };

  return (
    <div>
      <AdminSectionHeader
        title="Blogs"
        description="Metrics and publishing controls. Open the CMS editor to write or revise blog posts."
        actions={
          <Link
            to="/admin/blogs/create"
            className={`inline-flex items-center gap-1.5 rounded-xl bg-[#2C241B] px-4 py-2 text-sm font-medium text-[#FFFDF8] hover:bg-[#1A1510] ${focusRing}`}
          >
            <Plus className="h-4 w-4" /> New blog
          </Link>
        }
      />

      {analytics && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AdminKpiCard label="Total posts" value={analytics.totalBlogs} />
          <AdminKpiCard label="Published" value={analytics.publishedBlogs} tone="bronze" />
          <AdminKpiCard label="Total views" value={analytics.totalViews?.toLocaleString()} />
          <AdminKpiCard label="Total likes" value={analytics.totalLikes?.toLocaleString()} />
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716C]" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title or slug..."
            className={`w-full rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#C4A574] ${focusRing}`}
          />
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={`w-48 shrink-0 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-2 text-sm text-[#2C241B] outline-none focus:border-[#C4A574] ${focusRing}`}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      <AdminDataTable
        rows={blogs}
        loading={loading}
        empty="No blog posts yet. Create the first one."
        columns={[
          {
            key: 'title',
            label: 'Title',
            render: (b) => (
              <div>
                <p className="font-medium text-[#1C1917]">{b.title}</p>
                <p className="text-[11px] text-[#78716C]">/{b.slug}</p>
              </div>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (b) => (
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  b.status === 'published'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-[#EFE8DC] text-[#6B5A48]'
                }`}
              >
                {b.status}
              </span>
            ),
          },
          { key: 'category', label: 'Category' },
          {
            key: 'views',
            label: 'Views',
            render: (b) => b.views?.toLocaleString?.() ?? b.views ?? 0,
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (b) => (
              <div className="flex flex-wrap gap-1">
                {b.status === 'published' && (
                  <a
                    href={`/blogs/${b.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`rounded-lg p-1.5 text-[#6B5A48] hover:bg-[#F7F3EC] ${focusRing}`}
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                )}
                <Link
                  to={`/admin/blogs/edit/${b._id}`}
                  className={`rounded-lg p-1.5 text-[#6B5A48] hover:bg-[#F7F3EC] ${focusRing}`}
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  title="Duplicate"
                  onClick={() => run(() => adminDuplicateBlog(b._id), 'Duplicated')}
                  className={`rounded-lg p-1.5 text-[#6B5A48] hover:bg-[#F7F3EC] ${focusRing}`}
                >
                  <Copy className="h-4 w-4" />
                </button>
                {b.status === 'published' ? (
                  <button
                    type="button"
                    title="Unpublish"
                    onClick={() => run(() => adminUnpublishBlog(b._id), 'Unpublished')}
                    className={`rounded-lg p-1.5 text-[#6B5A48] hover:bg-[#F7F3EC] ${focusRing}`}
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    title="Publish"
                    onClick={() => run(() => adminPublishBlog(b._id), 'Published')}
                    className={`rounded-lg p-1.5 text-[#6B5A48] hover:bg-[#F7F3EC] ${focusRing}`}
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  title="Delete"
                  onClick={() => {
                    if (window.confirm('Delete this blog permanently?')) {
                      run(() => adminDeleteBlog(b._id), 'Deleted');
                    }
                  }}
                  className={`rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 ${focusRing}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />
      <AdminPagination page={page} totalPages={totalPages} total={total} limit={limit} loading={loading} onPageChange={goToPage} />

      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-[2147483646] bg-[#2C241B]/40" onClick={closeDrawer} aria-hidden />
          <aside className="fixed inset-y-0 right-0 z-[2147483647] flex w-full max-w-3xl flex-col border-l border-[#E5DCCE] bg-[#FFFDF8] shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-[#E5DCCE] px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-[#1C1917]">
                {editId ? 'Edit blog' : 'New blog'}
              </h2>
              <button type="button" onClick={closeDrawer} className={`rounded-lg p-2 text-[#6B5A48] hover:bg-[#F7F3EC] ${focusRing}`}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex shrink-0 gap-1 border-b border-[#E5DCCE] px-5">
              {EDITOR_TABS.map(({ id: tabId, label, icon: Icon }) => (
                <button
                  key={tabId}
                  type="button"
                  onClick={() => setActiveTab(tabId)}
                  className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-medium transition ${activeTab === tabId ? 'border-[#C4A574] text-[#2C241B]' : 'border-transparent text-[#78716C] hover:text-[#2C241B]'}`}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {activeTab === 'content' && (
                <div className="space-y-4">
                  <input
                    value={form.title}
                    onChange={(e) => patchForm({ title: e.target.value, slug: form.slug || slugify(e.target.value) })}
                    placeholder="Title"
                    className="w-full rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-4 py-3 text-lg font-medium outline-none focus:border-[#C4A574]"
                  />
                  <input
                    value={form.subtitle}
                    onChange={(e) => patchForm({ subtitle: e.target.value })}
                    placeholder="Subtitle (optional)"
                    className="w-full rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2 text-sm outline-none focus:border-[#C4A574]"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      value={form.slug}
                      onChange={(e) => patchForm({ slug: slugify(e.target.value) })}
                      placeholder="slug-url"
                      className="rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2 text-sm outline-none focus:border-[#C4A574]"
                    />
                    <input
                      value={form.category}
                      onChange={(e) => patchForm({ category: e.target.value })}
                      placeholder="Category"
                      className="rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2 text-sm outline-none focus:border-[#C4A574]"
                    />
                  </div>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) => patchForm({ excerpt: e.target.value })}
                    placeholder="Excerpt"
                    rows={2}
                    className="w-full rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2 text-sm outline-none focus:border-[#C4A574]"
                  />
                  <input
                    value={(form.tags || []).join(', ')}
                    onChange={(e) => patchForm({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
                    placeholder="Tags (comma-separated)"
                    className="w-full rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2 text-sm outline-none focus:border-[#C4A574]"
                  />
                  <div>
                    <label className="text-xs font-medium text-[#6B5A48]">Cover image</label>
                    <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} className="mt-1 block w-full text-sm" />
                    {(form.coverImage || coverFile) && (
                      <p className="mt-1 text-xs text-[#78716C]">{coverFile?.name || form.coverImage}</p>
                    )}
                  </div>
                  <BlockEditor blocks={form.content} onChange={(content) => patchForm({ content })} />
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] p-6">
                  <h1 className="font-display mb-2 text-2xl font-semibold text-[#1C1917]">{form.title || 'Untitled'}</h1>
                  {form.subtitle && <p className="mb-4 text-[#78716C]">{form.subtitle}</p>}
                  <BlogBlocks blocks={form.content} />
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-[#6B5A48]">Meta title ({form.seo?.metaTitle?.length || 0}/60)</label>
                    <input
                      value={form.seo?.metaTitle || ''}
                      onChange={(e) => patchForm({ seo: { ...form.seo, metaTitle: e.target.value } })}
                      className="mt-1 w-full rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2 text-sm outline-none focus:border-[#C4A574]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#6B5A48]">Meta description ({form.seo?.metaDescription?.length || 0}/160)</label>
                    <textarea
                      value={form.seo?.metaDescription || ''}
                      onChange={(e) => patchForm({ seo: { ...form.seo, metaDescription: e.target.value } })}
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2 text-sm outline-none focus:border-[#C4A574]"
                    />
                  </div>
                  <input
                    value={(form.seo?.keywords || []).join(', ')}
                    onChange={(e) => patchForm({ seo: { ...form.seo, keywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean) } })}
                    placeholder="Keywords (comma-separated)"
                    className="w-full rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2 text-sm outline-none focus:border-[#C4A574]"
                  />
                  <input
                    value={form.seo?.ogImage || ''}
                    onChange={(e) => patchForm({ seo: { ...form.seo, ogImage: e.target.value } })}
                    placeholder="OG image URL (optional)"
                    className="w-full rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2 text-sm outline-none focus:border-[#C4A574]"
                  />
                </div>
              )}

              {activeTab === 'meta' && (
                <div className="space-y-4">
                  <select
                    value={form.status}
                    onChange={(e) => patchForm({ status: e.target.value })}
                    className="w-full rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2 text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm text-[#57534E]">
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => patchForm({ isFeatured: e.target.checked })} />
                    Featured on listing page
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input value={form.author?.name || ''} onChange={(e) => patchForm({ author: { ...form.author, name: e.target.value } })} placeholder="Author name" className="rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2 text-sm" />
                    <input value={form.author?.role || ''} onChange={(e) => patchForm({ author: { ...form.author, role: e.target.value } })} placeholder="Author role" className="rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2 text-sm" />
                    <input value={form.author?.avatar || ''} onChange={(e) => patchForm({ author: { ...form.author, avatar: e.target.value } })} placeholder="Avatar URL" className="rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2 text-sm" />
                  </div>
                  <input
                    value={(form.relatedSlugs || []).join(', ')}
                    onChange={(e) => patchForm({ relatedSlugs: e.target.value.split(',').map((s) => slugify(s.trim())).filter(Boolean) })}
                    placeholder="Related slugs (comma-separated)"
                    className="w-full rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2 text-sm"
                  />
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-[#6B5A48]">FAQ</span>
                      <button type="button" onClick={addFaq} className="text-xs text-[#C4A574] hover:underline">+ Add FAQ</button>
                    </div>
                    {(form.faq || []).map((item, i) => (
                      <div key={i} className="mb-3 space-y-2 rounded-lg border border-[#E5DCCE] p-3">
                        <input value={item.q} onChange={(e) => updateFaq(i, 'q', e.target.value)} placeholder="Question" className="w-full rounded border border-[#E5DCCE] bg-[#F7F3EC] px-2 py-1.5 text-sm" />
                        <textarea value={item.a} onChange={(e) => updateFaq(i, 'a', e.target.value)} placeholder="Answer" rows={2} className="w-full rounded border border-[#E5DCCE] bg-[#F7F3EC] px-2 py-1.5 text-sm" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap gap-2 border-t border-[#E5DCCE] px-5 py-4">
              <button type="button" disabled={saving} onClick={() => handleSave(false)} className={`inline-flex items-center gap-2 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-2 text-sm font-medium text-[#6B5A48] hover:bg-[#F7F3EC] disabled:opacity-50 ${focusRing}`}>
                <Save className="h-4 w-4" /> Save draft
              </button>
              <button type="button" disabled={saving} onClick={() => handleSave(true)} className={`inline-flex items-center gap-2 rounded-xl bg-[#2C241B] px-4 py-2 text-sm font-medium text-[#FFFDF8] hover:bg-[#1A1510] disabled:opacity-50 ${focusRing}`}>
                <Eye className="h-4 w-4" /> Publish
              </button>
              {form.status === 'published' && editId && (
                <button type="button" onClick={handleUnpublish} className={`rounded-xl border border-[#E5DCCE] px-4 py-2 text-sm text-[#6B5A48] hover:bg-[#F7F3EC] ${focusRing}`}>
                  Unpublish
                </button>
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
