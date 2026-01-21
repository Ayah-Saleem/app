import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Save, CheckCircle } from 'lucide-react';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    font_size: 'medium',
    contrast_mode: 'normal',
    color_theme: 'light',
    colorblind_mode: 'none',
    text_to_speech_enabled: false,
    keyboard_navigation_hints: true,
    reduced_motion: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings/accessibility');
      if (response.data.success && response.data.settings) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      await api.put('/settings/accessibility', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" data-testid="settings-page">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">Accessibility Settings</h1>
          <p className="text-muted-foreground">Customize your experience</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
          {saved && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2" data-testid="save-success">
              <CheckCircle className="w-5 h-5" />
              <span>Settings saved successfully!</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Font Size</label>
            <select
              value={settings.font_size}
              onChange={(e) => setSettings({ ...settings, font_size: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              data-testid="font-size-select"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="extra_large">Extra Large</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contrast Mode</label>
            <select
              value={settings.contrast_mode}
              onChange={(e) => setSettings({ ...settings, contrast_mode: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              data-testid="contrast-mode-select"
            >
              <option value="normal">Normal</option>
              <option value="high">High Contrast</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Color Theme</label>
            <select
              value={settings.color_theme}
              onChange={(e) => setSettings({ ...settings, color_theme: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              data-testid="color-theme-select"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Colorblind Mode</label>
            <select
              value={settings.colorblind_mode}
              onChange={(e) => setSettings({ ...settings, colorblind_mode: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              data-testid="colorblind-mode-select"
            >
              <option value="none">None</option>
              <option value="deuteranopia">Deuteranopia</option>
              <option value="protanopia">Protanopia</option>
              <option value="tritanopia">Tritanopia</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.text_to_speech_enabled}
                onChange={(e) => setSettings({ ...settings, text_to_speech_enabled: e.target.checked })}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                data-testid="tts-checkbox"
              />
              <span className="text-sm font-medium">Enable Text-to-Speech</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.keyboard_navigation_hints}
                onChange={(e) => setSettings({ ...settings, keyboard_navigation_hints: e.target.checked })}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                data-testid="keyboard-hints-checkbox"
              />
              <span className="text-sm font-medium">Show Keyboard Navigation Hints</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.reduced_motion}
                onChange={(e) => setSettings({ ...settings, reduced_motion: e.target.checked })}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                data-testid="reduced-motion-checkbox"
              />
              <span className="text-sm font-medium">Reduce Motion</span>
            </label>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="save-settings-button"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="spinner"></div>
                Saving...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Save className="w-5 h-5" />
                Save Settings
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;