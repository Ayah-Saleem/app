import React, { useState } from 'react';
import api from '../utils/api';
import { Star, Send, CheckCircle, AlertCircle } from 'lucide-react';

const FeedbackPage = () => {
  const [formData, setFormData] = useState({
    feedback_type: 'general',
    rating: 5,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const response = await api.post('/feedback', formData);
      if (response.data.success) {
        setSuccess(true);
        setFormData({ feedback_type: 'general', rating: 5, comment: '' });
      }
    } catch (err) {
      setError('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4" data-testid="feedback-page">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">Feedback</h1>
          <p className="text-muted-foreground">Help us improve Jusoor</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2" data-testid="success-message">
              <CheckCircle className="w-5 h-5" />
              <span>Thank you! Your feedback has been submitted.</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2" data-testid="error-message">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="feedback-form">
            <div>
              <label className="block text-sm font-medium mb-2">Feedback Type</label>
              <select
                value={formData.feedback_type}
                onChange={(e) => setFormData({ ...formData, feedback_type: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                data-testid="feedback-type-select"
              >
                <option value="general">General</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="translation_quality">Translation Quality</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Rating</label>
              <div className="flex gap-2" data-testid="rating-selector">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: value })}
                    className="transition-transform hover:scale-110"
                    data-testid={`rating-star-${value}`}
                  >
                    <Star
                      className={`w-8 h-8 ${value <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Comments</label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg h-32 focus:ring-2 focus:ring-primary"
                placeholder="Share your thoughts..."
                required
                data-testid="comment-textarea"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="submit-feedback-button"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="spinner"></div>
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  Submit Feedback
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;