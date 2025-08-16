import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaThumbsUp, FaThumbsDown, FaSearch, FaSort, FaPlus, FaTrash, FaEdit, FaBars, FaTimes, FaHeart, FaBookmark, FaShare } from 'react-icons/fa';
import { toast } from 'react-toastify';
import InterviewCommentSection from '../components/InterviewCommentSection';
import slugify from '../utils/slugify';
import FormattedText from '../components/FormattedText';


export default function InterviewQuestions() {
  const { currentUser } = useSelector((state) => state.user);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topics, setTopics] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    questions: [{ question: '', answer: '', images: [] }]
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [imagesFilesByIndex, setImagesFilesByIndex] = useState({});
  const [imageModal, setImageModal] = useState({ open: false, images: [], index: 0 });

  const openImageModal = (images, startIndex) => {
    setImageModal({ open: true, images, index: startIndex });
  };

  const closeImageModal = () => {
    setImageModal((prev) => ({ ...prev, open: false }));
  };

  const showPrevImage = (e) => {
    e?.stopPropagation();
    setImageModal((prev) => ({
      ...prev,
      index: (prev.index - 1 + prev.images.length) % prev.images.length,
    }));
  };

  const showNextImage = (e) => {
    e?.stopPropagation();
    setImageModal((prev) => ({
      ...prev,
      index: (prev.index + 1) % prev.images.length,
    }));
  };

  const navigate = useNavigate();
  const { topicSlug } = useParams();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (sortBy) params.append('sort', sortBy);
        if (sortOrder) params.append('order', sortOrder);
        
        const res = await axios.get(`/backend/interview-questions/get?${params.toString()}`);
        setQuestions(res.data);
        
        const uniqueTopics = [...new Set(res.data.map(q => q.topic))];
        setTopics(uniqueTopics);
        
        if (topicSlug) {
          const questionBySlug = res.data.find(q => slugify(q.topic) === topicSlug);
          if (questionBySlug) {
            setSelectedTopic(questionBySlug._id);
          } else if (res.data.length > 0) {
            setSelectedTopic(res.data[0]._id);
            navigate(`/interview-questions/${slugify(res.data[0].topic)}`, { replace: true });
          }
        } else if (res.data.length > 0) {
          setSelectedTopic(res.data[0]._id);
          navigate(`/interview-questions/${slugify(res.data[0].topic)}`, { replace: true });
        }
        
        setLoading(false);
      } catch (error) {
        setError(true);
        setLoading(false);
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, [searchTerm, sortBy, sortOrder, topicSlug]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!imageModal.open) return;
      if (e.key === 'Escape') closeImageModal();
      if (e.key === 'ArrowLeft') showPrevImage();
      if (e.key === 'ArrowRight') showNextImage();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [imageModal.open]);

  const handleLike = async (questionId) => {
    if (!currentUser) {
      toast.error('Please sign in to like questions');
      return;
    }

    try {
      const res = await axios.post(`/backend/interview-questions/like/${questionId}`);
      setQuestions(questions.map(q => q._id === questionId ? res.data : q));
    } catch (error) {
      console.error('Error liking question:', error);
      toast.error('Failed to like question');
    }
  };

  const handleDislike = async (questionId) => {
    if (!currentUser) {
      toast.error('Please sign in to dislike questions');
      return;
    }

    try {
      const res = await axios.post(`/backend/interview-questions/dislike/${questionId}`);
      setQuestions(questions.map(q => q._id === questionId ? res.data : q));
    } catch (error) {
      console.error('Error disliking question:', error);
      toast.error('Failed to dislike question');
    }
  };

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { question: '', answer: '', images: [] }]
    });
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      questions: newQuestions
    });
    // Clean up the images for this index
    setImagesFilesByIndex((prev) => {
      const copy = { ...prev };
      delete copy[index];
      // Reindex remaining images
      const reindexed = {};
      Object.keys(copy).forEach(key => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          reindexed[oldIndex - 1] = copy[key];
        } else {
          reindexed[key] = copy[key];
        }
      });
      return reindexed;
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;
    setFormData({
      ...formData,
      questions: newQuestions
    });
  };

  const handleImagesChange = (index, files) => {
    const fileArray = Array.from(files || []);
    setImagesFilesByIndex((prev) => ({ ...prev, [index]: fileArray }));
  };

  // Function to remove existing image from a question
  const handleRemoveExistingImage = (questionIndex, imageIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].images = newQuestions[questionIndex].images.filter((_, idx) => idx !== imageIndex);
    setFormData({
      ...formData,
      questions: newQuestions
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (isEditing) {
        const payload = new FormData();
        payload.append('topic', formData.topic);
        payload.append('description', formData.description);
        const normalized = formData.questions.map((q) => ({ 
          question: q.question, 
          answer: q.answer, 
          images: q.images || [] 
        }));
        payload.append('questions', JSON.stringify(normalized));
        Object.entries(imagesFilesByIndex).forEach(([idx, files]) => {
          files.forEach((file) => payload.append(`images_${idx}`, file));
        });
        res = await axios.post(`/backend/interview-questions/update/${editQuestionId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
        setQuestions(questions.map(q => q._id === editQuestionId ? res.data : q));
        toast.success('Question set updated successfully!');
      } else {
        const payload = new FormData();
        payload.append('topic', formData.topic);
        payload.append('description', formData.description);
        const normalized = formData.questions.map((q) => ({ 
          question: q.question, 
          answer: q.answer, 
          images: q.images || [] 
        }));
        payload.append('questions', JSON.stringify(normalized));
        Object.entries(imagesFilesByIndex).forEach(([idx, files]) => {
          files.forEach((file) => payload.append(`images_${idx}`, file));
        });
        res = await axios.post('/backend/interview-questions/create', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
        setQuestions([...questions, res.data]);
        toast.success('Question set created successfully!');
      }
      
      // Reset form
      setShowForm(false);
      setIsEditing(false);
      setEditQuestionId(null);
      setFormData({
        topic: '',
        description: '',
        questions: [{ question: '', answer: '', images: [] }]
      });
      setImagesFilesByIndex({});
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} question set:`, error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} question set`);
    }
  };

  const handleEdit = (question) => {
    // Properly set the form data including existing images
    setFormData({
      topic: question.topic,
      description: question.description,
      questions: question.questions.map(q => ({
        question: q.question,
        answer: q.answer,
        images: q.images || [] // Preserve existing images
      })),
    });
    setEditQuestionId(question._id);
    setIsEditing(true);
    setShowForm(true);
    // Clear new image files when editing
    setImagesFilesByIndex({});
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/backend/interview-questions/delete/${id}`);
      setQuestions(questions.filter(q => q._id !== id));
      toast.success('Question set deleted successfully!');
    } catch (error) {
      console.error('Error deleting question set:', error);
      toast.error('Failed to delete question set');
    }
  };

  const selectedQuestion = questions.find(q => q._id === selectedTopic);

  return (
    <div className="flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Sidebar Toggle Button for mobile */}
      <button
        className="lg:hidden fixed top-20 right-4 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full shadow-2xl backdrop-blur-sm border border-white/20 hover:scale-110 transition-all duration-300"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
      </button>

      {/* Backdrop for mobile */}
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Made narrower */}
      <div
        className={`
          w-full bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl z-40 transition-all duration-500 fixed inset-y-0 overflow-y-auto
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} right-0
          lg:w-72 lg:left-0 lg:right-auto lg:translate-x-0 lg:relative
        `}
      >
        <div className="pt-28 p-4">
          {/* Close button for mobile */}
          {isSidebarOpen && window.innerWidth < 1024 && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
            >
              <FaTimes size={20} />
            </button>
          )}

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Interview Topics
            </h2>
            <p className="text-xs text-gray-500">Explore questions by category</p>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search topics..."
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3.5 text-gray-400 text-xs" />
          </div>

          {/* Topics List */}
          <div className="space-y-1.5">
            {topics.map((topic, index) => (
              <button
                key={topic}
                onClick={() => {
                  const question = questions.find(q => q.topic === topic);
                  if (question) {
                    setSelectedTopic(question._id);
                    navigate(`/interview-questions/${slugify(question.topic)}`);
                    if (window.innerWidth < 1024) {
                      setIsSidebarOpen(false);
                    }
                  }
                }}
                className={`w-full text-left p-3 rounded-xl transition-all duration-300 group hover:scale-[1.02] ${
                  selectedQuestion?.topic === topic
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'hover:bg-white/80 hover:shadow-md border border-gray-100'
                }`}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{topic}</span>
                  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    selectedQuestion?.topic === topic 
                      ? 'bg-white/80' 
                      : 'bg-blue-500/50 group-hover:bg-blue-500'
                  }`} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Now takes more space */}
      <div className="flex-1 overflow-y-auto pt-24 p-4 lg:p-6 xl:p-8 lg:ml-0 mt-16">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-red-700 mb-2">Something went wrong</h3>
              <p className="text-red-600">Please try again later or refresh the page.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 max-w-none">
            {/* Admin Controls */}
            {currentUser?.isUserAdmin && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 xl:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                      Admin Dashboard
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Manage interview question sets</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowForm(!showForm);
                      setIsEditing(false);
                      setEditQuestionId(null);
                      setFormData({
                        topic: '',
                        description: '',
                        questions: [{ question: '', answer: '', images: [] }]
                      });
                      setImagesFilesByIndex({});
                    }}
                    className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 hover:scale-105"
                  >
                    <FaPlus className="text-sm" />
                    {showForm ? 'Cancel' : 'Add New Set'}
                  </button>
                </div>

                {showForm && (
                  <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50/50 rounded-xl p-6">
                    <div className="grid lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Topic</label>
                        <input
                          type="text"
                          value={formData.topic}
                          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                          rows="3"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-4">Questions and Answers</label>
                      <div className="space-y-6">
                        {formData.questions.map((qa, index) => (
                          <div key={index} className="p-4 border border-gray-200 rounded-xl bg-white">
                            <div className="flex justify-between items-center mb-3">
                              <h3 className="font-semibold text-gray-700">Question {index + 1}</h3>
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestion(index)}
                                  className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                                >
                                  <FaTrash />
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              value={qa.question}
                              onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                              placeholder="Enter your question..."
                              className="w-full p-3 border border-gray-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                              required
                            />
                            <textarea
                              value={qa.answer}
                              onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                              placeholder="Enter the answer..."
                              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                              rows="3"
                              required
                            />
                            
                            {/* Existing Images Display and Management */}
                            {qa.images && qa.images.length > 0 && (
                              <div className="mt-4">
                                <label className="block text-gray-700 font-medium mb-2">Current Images:</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                  {qa.images.map((imgUrl, imgIdx) => (
                                    <div key={imgIdx} className="relative group">
                                      <img
                                        src={imgUrl}
                                        alt={`Current image ${imgIdx + 1}`}
                                        className="w-full h-20 object-cover rounded-lg border border-gray-200"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveExistingImage(index, imgIdx)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove image"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* New Images Upload */}
                            <div className="mt-3">
                              <label className="block text-gray-700 font-medium mb-2">
                                {isEditing ? 'Add new images (optional)' : 'Attach images (optional)'}
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleImagesChange(index, e.target.files)}
                                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              />
                              {imagesFilesByIndex[index]?.length ? (
                                <p className="text-xs text-gray-500 mt-1">
                                  {imagesFilesByIndex[index].length} new image(s) selected
                                </p>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 mt-4"
                      >
                        <FaPlus />
                        Add Another Question
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      {isEditing ? 'Update Question Set' : 'Create Question Set'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Selected Question Content */}
            {selectedQuestion ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6 xl:p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <h1 className="text-2xl xl:text-3xl font-bold mb-3">{selectedQuestion.topic}</h1>
                      <p className="text-blue-100 text-sm xl:text-base opacity-90 leading-relaxed">
                        {selectedQuestion.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {currentUser?.isUserAdmin && (
                        <>
                          <button
                            onClick={() => handleEdit(selectedQuestion)}
                            className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-200 backdrop-blur-sm"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(selectedQuestion._id)}
                            className="p-3 rounded-xl bg-white/20 hover:bg-red-500/80 transition-all duration-200 backdrop-blur-sm"
                          >
                            <FaTrash size={16} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleLike(selectedQuestion._id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 backdrop-blur-sm ${
                          selectedQuestion.likes.includes(currentUser?._id)
                            ? 'bg-white/30 text-white'
                            : 'bg-white/20 hover:bg-white/30 text-white'
                        }`}
                      >
                        <FaThumbsUp size={14} />
                        <span className="font-medium">{selectedQuestion.numberOfLikes}</span>
                      </button>
                      <button
                        onClick={() => handleDislike(selectedQuestion._id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 backdrop-blur-sm ${
                          selectedQuestion.dislikes.includes(currentUser?._id)
                            ? 'bg-white/30 text-white'
                            : 'bg-white/20 hover:bg-white/30 text-white'
                        }`}
                      >
                        <FaThumbsDown size={14} />
                        <span className="font-medium">{selectedQuestion.numberOfDislikes}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Questions List - Now Single Column */}
                <div className="p-6 xl:p-8">
                  <div className="space-y-6">
                    {selectedQuestion.questions.map((qa, index) => (
                      <div 
                        key={index} 
                        className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 leading-relaxed">
                              {qa.question}
                            </h3>
                            <div className="bg-blue-50/50 border-l-4 border-blue-500 pl-4 py-3 rounded-r-lg">
                              <div className="text-sm">
                                <FormattedText text={qa.answer} />
                              </div>
                            </div>
                            {Array.isArray(qa.images) && qa.images.length > 0 && (
                              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {qa.images.map((imgUrl, imgIdx) => (
                                  <button
                                    type="button"
                                    key={imgIdx}
                                    onClick={() => openImageModal(qa.images, imgIdx)}
                                    className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label={`Open image ${imgIdx + 1}`}
                                  >
                                    <img
                                      src={imgUrl}
                                      alt={`Answer image ${imgIdx + 1}`}
                                      className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                                      loading="lazy"
                                    />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comments Section */}
                <div className="border-t border-gray-200 bg-gray-50/30 p-6 xl:p-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    💬 Discussion
                    <span className="text-sm font-normal text-gray-500">Share your thoughts</span>
                  </h2>
                  <InterviewCommentSection expId={selectedQuestion._id} />
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-12 max-w-md mx-auto">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Topic</h3>
                  <p className="text-gray-500">Choose a topic from the sidebar to view interview questions</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {imageModal.open && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative flex items-center justify-center">
              <button
                type="button"
                onClick={showPrevImage}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow"
                aria-label="Previous image"
              >
                ‹
              </button>
              <img
                src={imageModal.images[imageModal.index]}
                alt={`Preview ${imageModal.index + 1}`}
                className="max-h-[80vh] w-full object-contain rounded-lg border border-white/20"
              />
              <button
                type="button"
                onClick={showNextImage}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow"
                aria-label="Next image"
              >
                ›
              </button>
              <button
                type="button"
                onClick={closeImageModal}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white text-gray-700 rounded-full p-2 shadow hover:bg-gray-100"
                aria-label="Close"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>

            <div className="mt-4 text-center text-white text-sm opacity-80">
              {imageModal.index + 1} / {imageModal.images.length}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}