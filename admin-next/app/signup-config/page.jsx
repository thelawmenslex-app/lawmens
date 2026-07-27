"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FormInput, Save, Plus, Trash2, ToggleLeft, ToggleRight, AlertCircle, CheckCircle2, ArrowUp, ArrowDown } from 'lucide-react';

const SignupConfigPage = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Custom field add state
  const [newLabel, setNewLabel] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newType, setNewType] = useState('text');
  const [newRequired, setNewRequired] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/v1/admin/signup-config', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status) {
        setFields(res.data.data);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to fetch signup config.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleToggleEnable = (index) => {
    const updated = [...fields];
    updated[index].isEnabled = !updated[index].isEnabled;
    setFields(updated);
  };

  const handleToggleRequired = (index) => {
    const updated = [...fields];
    updated[index].isRequired = !updated[index].isRequired;
    setFields(updated);
  };

  const handleFieldChange = (index, key, val) => {
    const updated = [...fields];
    updated[index][key] = val;
    setFields(updated);
  };

  const handleMove = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === fields.length - 1) return;
    const updated = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFields(updated);
  };

  const handleAddCustomField = () => {
    if (!newLabel.trim()) {
      alert('Field Label is required.');
      return;
    }
    const generatedKey = newKey.trim() || `custom_${newLabel.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    const newField = {
      fieldKey: generatedKey,
      label: newLabel.trim(),
      fieldType: newType,
      isRequired: newRequired,
      isEnabled: true,
      order: fields.length + 1,
      placeholder: `Enter ${newLabel.trim()}`
    };
    setFields([...fields, newField]);
    setNewLabel('');
    setNewKey('');
    setNewType('text');
    setNewRequired(false);
  };

  const handleRemoveField = (index) => {
    const field = fields[index];
    const coreKeys = ['firstName', 'lastName', 'email', 'phoneNumber', 'password'];
    if (coreKeys.includes(field.fieldKey)) {
      alert('Core authentication fields cannot be deleted. You may disable them if needed.');
      return;
    }
    const updated = fields.filter((_, i) => i !== index);
    setFields(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await axios.post('/api/v1/admin/signup-config', { fields }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status) {
        setFields(res.data.data);
        setMessage({ type: 'success', text: 'Signup form configuration saved successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save configuration.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* Title Header */}
      <div className="neu-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#25AAE2]/10 rounded-xl border border-[#25AAE2]/20 text-[#25AAE2]">
              <FormInput className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">Dynamic Signup Form Builder</h1>
          </div>
          <p className="text-sm text-slate-600 pl-11">
            Customize user registration fields. Enable, disable, toggle required flags, or add custom fields for the mobile signup screen.
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="neu-btn flex items-center justify-center gap-2 px-6 py-3 disabled:opacity-50 text-white font-bold text-sm"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold border ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Field Config List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="neu-card p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 pb-2 border-b border-[#c6deeb]">Form Fields Reordering & Toggles</h2>
            
            {loading ? (
              <div className="text-center py-12 text-slate-500 font-semibold">Loading signup configuration...</div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, idx) => {
                  const isCore = ['firstName', 'lastName', 'email', 'phoneNumber', 'password'].includes(field.fieldKey);
                  return (
                    <div 
                      key={field.fieldKey || idx}
                      className={`neu-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                        !field.isEnabled ? 'opacity-60 bg-slate-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex flex-col gap-1 text-slate-400">
                          <button 
                            onClick={() => handleMove(idx, 'up')} 
                            disabled={idx === 0} 
                            className="hover:text-[#25AAE2] disabled:opacity-30"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleMove(idx, 'down')} 
                            disabled={idx === fields.length - 1} 
                            className="hover:text-[#25AAE2] disabled:opacity-30"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm">{field.label}</span>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#d7f0fa] text-[#25AAE2]">
                              {field.fieldType}
                            </span>
                            {isCore && (
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                                Core
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 font-mono">key: {field.fieldKey}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-center">
                        <button
                          onClick={() => handleToggleRequired(idx)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${
                            field.isRequired 
                              ? 'bg-amber-100 text-amber-800 border-amber-300' 
                              : 'neu-btn-secondary text-slate-600'
                          }`}
                        >
                          {field.isRequired ? 'Required' : 'Optional'}
                        </button>

                        <button
                          onClick={() => handleToggleEnable(idx)}
                          className="text-slate-600 hover:text-[#25AAE2] transition-colors"
                        >
                          {field.isEnabled ? (
                            <ToggleRight className="h-7 w-7 text-[#25AAE2]" />
                          ) : (
                            <ToggleLeft className="h-7 w-7 text-slate-400" />
                          )}
                        </button>

                        {!isCore && (
                          <button
                            onClick={() => handleRemoveField(idx)}
                            className="text-red-500 hover:text-red-700 p-1 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Add Custom Field Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="neu-card p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-800 pb-2 border-b border-[#c6deeb] flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#25AAE2]" />
              <span>Add Custom Field</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Field Label</label>
                <input
                  type="text"
                  placeholder="e.g. Bar Council Number"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full neu-input p-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#25AAE2]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Field Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full neu-input p-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#25AAE2]"
                >
                  <option value="text">Text Input</option>
                  <option value="number">Numeric</option>
                  <option value="email">Email</option>
                  <option value="textarea">Textarea / Multiline</option>
                </select>
              </div>

              <div className="flex items-end gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={newRequired}
                    onChange={(e) => setNewRequired(e.target.checked)}
                    className="rounded text-[#25AAE2] focus:ring-[#25AAE2]"
                  />
                  <span className="text-xs font-bold text-slate-700">Required</span>
                </label>

                <button
                  type="button"
                  onClick={handleAddCustomField}
                  className="neu-btn flex-1 py-2 px-4 text-sm font-bold"
                >
                  Add Field
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupConfigPage;
