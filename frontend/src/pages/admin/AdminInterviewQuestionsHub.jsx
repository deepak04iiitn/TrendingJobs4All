import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader';
import AdminDataTable from '../../components/admin/AdminDataTable';
import {
  fetchInterviewQuestions,
  deleteInterviewQuestion,
  createInterviewQuestion,
} from '../../lib/admin-api';
import { focusRing } from '../../theme/tokens';

export default function AdminInterviewQuestionsHub() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    questions: [{ question: '', answer: '' }],
  });
  const [imagesFilesByIndex, setImagesFilesByIndex] = useState({});

  const load = (q = search) => {
    setLoading(true);
    fetchInterviewQuestions(q ? { search: q } : {})
      .then((data) => setQuestions(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load question sets'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(() => load(search), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('topic', formData.topic);
      payload.append('description', formData.description);
      const questionsMinimal = formData.questions.map((q) => ({
        question: q.question,
        answer: q.answer,
        images: q.images || [],
      }));
      payload.append('questions', JSON.stringify(questionsMinimal));
      Object.entries(imagesFilesByIndex).forEach(([idx, files]) => {
        files.forEach((file) => payload.append(`images_${idx}`, file));
      });

      await createInterviewQuestion(payload);
      toast.success('Question set created');
      setShowForm(false);
      setFormData({ topic: '', description: '', questions: [{ question: '', answer: '' }] });
      setImagesFilesByIndex({});
      load();
    } catch {
      toast.error('Create failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question set?')) return;
    try {
      await deleteInterviewQuestion(id);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <AdminSectionHeader
        title="Interview questions"
        description="Create and manage topic-based Q&A sets for QA and SDET practice."
        actions={
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className={`inline-flex items-center gap-1.5 rounded-xl bg-[#2C241B] px-4 py-2 text-sm font-medium text-[#FFFDF8] hover:bg-[#1A1510] ${focusRing}`}
          >
            <Plus className="h-4 w-4" /> New set
          </button>
        }
      />

      <div className="mb-4">
        <label className="relative block max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716C]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topic, question, or answer..."
            className={`w-full rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#C4A574] ${focusRing}`}
          />
        </label>
      </div>

      <AdminDataTable
        rows={questions}
        loading={loading}
        empty="No question sets yet."
        columns={[
            {
              key: 'topic',
              label: 'Topic',
              render: (q) => (
                <div>
                  <p className="font-medium text-[#1C1917]">{q.topic}</p>
                  <p className="line-clamp-1 text-[11px] text-[#78716C]">{q.description}</p>
                </div>
              ),
            },
            {
              key: 'count',
              label: 'Questions',
              render: (q) => q.questions?.length ?? 0,
            },
            {
              key: 'actions',
              label: '',
              render: (q) => (
                <button
                  type="button"
                  onClick={() => handleDelete(q._id)}
                  className={`rounded-lg p-2 text-rose-600 hover:bg-rose-50 ${focusRing}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ),
            },
          ]}
        />

      {showForm && (
        <>
          <div className="fixed inset-0 z-[2147483646] bg-[#2C241B]/40" onClick={() => setShowForm(false)} aria-hidden />
          <aside className="fixed inset-y-0 right-0 z-[2147483647] flex w-full max-w-xl flex-col border-l border-[#E5DCCE] bg-[#FFFDF8] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5DCCE] px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-[#1C1917]">New question set</h2>
              <button type="button" onClick={() => setShowForm(false)} className={`rounded-lg p-2 text-[#6B5A48] ${focusRing}`}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                <input
                  required
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="Topic"
                  className="w-full rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5 text-sm outline-none focus:border-[#C4A574]"
                />
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description"
                  rows={2}
                  className="w-full rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5 text-sm outline-none focus:border-[#C4A574]"
                />
                {formData.questions.map((item, index) => (
                  <div key={index} className="space-y-2 rounded-xl border border-[#E5DCCE] p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#6B5A48]">Q{index + 1}</span>
                      {formData.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              questions: formData.questions.filter((_, i) => i !== index),
                            })
                          }
                          className="text-xs text-rose-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      required
                      value={item.question}
                      onChange={(e) => {
                        const questions = [...formData.questions];
                        questions[index] = { ...questions[index], question: e.target.value };
                        setFormData({ ...formData, questions });
                      }}
                      placeholder="Question"
                      className="w-full rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2 text-sm"
                    />
                    <textarea
                      required
                      value={item.answer}
                      onChange={(e) => {
                        const questions = [...formData.questions];
                        questions[index] = { ...questions[index], answer: e.target.value };
                        setFormData({ ...formData, questions });
                      }}
                      placeholder="Answer"
                      rows={3}
                      className="w-full rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2 text-sm"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        setImagesFilesByIndex((prev) => ({
                          ...prev,
                          [index]: Array.from(e.target.files || []),
                        }))
                      }
                      className="block w-full text-xs text-[#78716C]"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      questions: [...formData.questions, { question: '', answer: '' }],
                    })
                  }
                  className="text-sm text-[#C4A574] hover:underline"
                >
                  + Add question
                </button>
              </div>
              <div className="border-t border-[#E5DCCE] px-5 py-4">
                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full rounded-xl bg-[#2C241B] py-2.5 text-sm font-medium text-[#FFFDF8] disabled:opacity-50 ${focusRing}`}
                >
                  {saving ? 'Saving...' : 'Create set'}
                </button>
              </div>
            </form>
          </aside>
        </>
      )}
    </div>
  );
}
