import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function AdminInterviewQuestions() {
  const { currentUser } = useSelector((state) => state.user);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    questions: [{ question: '', answer: '' }]
  });
  const [imagesFilesByIndex, setImagesFilesByIndex] = useState({}); // { [qIndex]: File[] }
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser?.isUserAdmin) {
      navigate('/');
      return;
    }

    const fetchQuestions = async () => {
      try {
        const res = await axios.get('/backend/interview-questions/get');
        setQuestions(res.data);
        setLoading(false);
      } catch (error) {
        setError(true);
        setLoading(false);
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, [currentUser, navigate]);

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { question: '', answer: '' }]
    });
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      questions: newQuestions
    });
    setImagesFilesByIndex((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append('topic', formData.topic);
      payload.append('description', formData.description);
      // Include existing images arrays as empty (create) to keep schema consistent
      const questionsMinimal = formData.questions.map((q) => ({ question: q.question, answer: q.answer, images: q.images || [] }));
      payload.append('questions', JSON.stringify(questionsMinimal));
      // Append files per question index with key images_{index}
      Object.entries(imagesFilesByIndex).forEach(([idx, files]) => {
        files.forEach((file) => payload.append(`images_${idx}`, file));
      });

      const res = await axios.post('/backend/interview-questions/create', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      setQuestions([...questions, res.data]);
      setShowForm(false);
      setFormData({
        topic: '',
        description: '',
        questions: [{ question: '', answer: '' }]
      });
      setImagesFilesByIndex({});
      toast.success('Question set created successfully!');
    } catch (error) {
      console.error('Error creating question set:', error);
      toast.error('Failed to create question set');
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Something went wrong. Please try again later.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 mt-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Manage Interview Questions</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
        >
          <FaPlus className="mr-2" />
          {showForm ? 'Cancel' : 'Add New Question Set'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Topic</label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded"
              rows="3"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Questions and Answers</label>
            {formData.questions.map((qa, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Question {index + 1}</h3>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={qa.question}
                  onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                  placeholder="Question"
                  className="w-full p-2 border rounded mb-2"
                  required
                />
                <textarea
                  value={qa.answer}
                  onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                  placeholder="Answer"
                  className="w-full p-2 border rounded"
                  rows="3"
                  required
                />
                <div className="mt-3">
                  <label className="block text-gray-700 mb-2">Attach images (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImagesChange(index, e.target.files)}
                  />
                  {imagesFilesByIndex[index]?.length ? (
                    <p className="text-sm text-gray-500 mt-1">{imagesFilesByIndex[index].length} image(s) selected</p>
                  ) : null}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddQuestion}
              className="text-blue-500 hover:text-blue-700 flex items-center"
            >
              <FaPlus className="mr-2" />
              Add Another Question
            </button>
          </div>

          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Create Question Set
          </button>
        </form>
      )}

      <div className="space-y-4">
        {questions.map((question) => (
          <div key={question._id} className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">{question.topic}</h2>
                <p className="text-gray-600">{question.description}</p>
              </div>
              <button
                onClick={() => handleDelete(question._id)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
            </div>
            <div className="space-y-4">
              {question.questions.map((qa, index) => (
                <div key={index} className="border-b pb-4">
                  <h3 className="font-semibold">Q: {qa.question}</h3>
                  <p className="text-gray-700">A: {qa.answer}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 