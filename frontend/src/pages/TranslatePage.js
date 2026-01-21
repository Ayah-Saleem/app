import React, { useState } from 'react';
import api from '../utils/api';
import { Video, Mic, FileText, ArrowRight, CheckCircle, Loader } from 'lucide-react';

const TranslatePage = () => {
  const [inputType, setInputType] = useState('text');
  const [inputContent, setInputContent] = useState('');
  const [outputType, setOutputType] = useState('text');
  const [inputLanguage, setInputLanguage] = useState('en');
  const [outputLanguage, setOutputLanguage] = useState('en');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTranslate = async () => {
    if (!inputContent.trim()) {
      setError('Please provide input content');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/translate', {
        input_type: inputType,
        input_content: inputContent,
        input_language: inputLanguage,
        output_type: outputType,
        output_language: outputLanguage
      });

      if (response.data.success) {
        setResult(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Translation failed');
    } finally {
      setLoading(false);
    }
  };

  const inputTypes = [
    { value: 'text', label: 'Text', icon: <FileText className="w-5 h-5" /> },
    { value: 'audio', label: 'Audio', icon: <Mic className="w-5 h-5" /> },
    { value: 'video', label: 'Video', icon: <Video className="w-5 h-5" /> }
  ];

  const outputTypes = [
    { value: 'text', label: 'Text', icon: <FileText className="w-5 h-5" /> },
    { value: 'audio', label: 'Audio', icon: <Mic className="w-5 h-5" /> },
    { value: 'sign', label: 'Sign Language', icon: <Video className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen py-12 px-4" data-testid="translate-page">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Translate</h1>
          <p className="text-xl text-muted-foreground">Choose your input and output formats</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8" data-testid="input-section">
            <h2 className="text-2xl font-semibold mb-6">Input</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Input Type</label>
              <div className="grid grid-cols-3 gap-3">
                {inputTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setInputType(type.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      inputType === type.value
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                    data-testid={`input-type-${type.value}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {type.icon}
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                value={inputLanguage}
                onChange={(e) => setInputLanguage(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                data-testid="input-language-select"
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              {inputType === 'text' ? (
                <textarea
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg h-40 focus:ring-2 focus:ring-primary"
                  placeholder="Enter text to translate..."
                  data-testid="input-content-textarea"
                />
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                  <p className="mb-2">Upload {inputType} file (Simulated)</p>
                  <input
                    type="text"
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg mt-4"
                    placeholder={`Simulated ${inputType} path...`}
                    data-testid="input-file-path"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8" data-testid="output-section">
            <h2 className="text-2xl font-semibold mb-6">Output</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Output Type</label>
              <div className="grid grid-cols-3 gap-3">
                {outputTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setOutputType(type.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      outputType === type.value
                        ? 'border-secondary bg-secondary/10'
                        : 'border-gray-200 hover:border-secondary/50'
                    }`}
                    data-testid={`output-type-${type.value}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {type.icon}
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                value={outputLanguage}
                onChange={(e) => setOutputLanguage(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-secondary"
                data-testid="output-language-select"
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
            </div>

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6" data-testid="translation-result">
                <div className="flex items-center gap-2 mb-3 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Translation Complete</span>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap">{result.output_content}</p>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Duration: {result.duration?.toFixed(2)}s | 
                  Confidence: {result.result?.confidence ? `${(result.result.confidence * 100).toFixed(0)}%` : 'N/A'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Translate Button */}
        <div className="text-center">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 inline-block" data-testid="translation-error">
              {error}
            </div>
          )}
          <button
            onClick={handleTranslate}
            disabled={loading}
            className="btn-primary text-lg px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="translate-button"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <Loader className="w-5 h-5 animate-spin" />
                Translating...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                Translate
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranslatePage;
