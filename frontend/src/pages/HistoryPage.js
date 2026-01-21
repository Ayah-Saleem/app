import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Trash2, Search, Filter, Calendar } from 'lucide-react';

const HistoryPage = () => {
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/translations/history');
      if (response.data.success) {
        setTranslations(response.data.translations);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this translation?')) return;
    
    try {
      await api.delete(`/translations/${id}`);
      setTranslations(translations.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const filteredTranslations = translations.filter(t =>
    t.input_content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.output_content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" data-testid="history-page">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold gradient-text">Translation History</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search translations..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              data-testid="search-input"
            />
          </div>
        </div>

        {filteredTranslations.length === 0 ? (
          <div className="text-center py-16" data-testid="no-history">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">No translations found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTranslations.map((translation) => (
              <div key={translation.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 card-hover" data-testid={`translation-item-${translation.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {translation.input_type} → {translation.output_type}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(translation.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Input:</p>
                        <p className="text-gray-900 dark:text-gray-100">{translation.input_content?.substring(0, 100)}...</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Output:</p>
                        <p className="text-gray-900 dark:text-gray-100">{translation.output_content?.substring(0, 100)}...</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(translation.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                    data-testid={`delete-button-${translation.id}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;