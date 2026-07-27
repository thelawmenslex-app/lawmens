"use client";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Edit3, 
  Save, 
  BookOpen, 
  Plus, 
  Trash2, 
  ClipboardList, 
  CheckCircle2, 
  Folder, 
  RefreshCw 
} from 'lucide-react';

const SchedulesCRUD = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  
  const [activeEditorType, setActiveEditorType] = useState(null); // 'first' or 'second'
  const [editorHtml, setEditorHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const editorRef = useRef(null);
  const imageInputRef = useRef(null);
  const firstPdfInputRef = useRef(null);
  const secondPdfInputRef = useRef(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

  const handlePdfUpload = async (e, scheduleType) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setPublishSuccess(false);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await axios.post(`/api/v1/admin/content/schedule/upload-pdf/${selectedCategoryId}/${scheduleType}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.status) {
        alert(`${scheduleType === 'first' ? 'First' : 'Second'} Schedule PDF uploaded and set active!`);
        fetchCategories(); // Refresh categories to show active PDF URLs
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload schedule PDF.');
    } finally {
      setLoading(false);
      // Reset inputs
      if (firstPdfInputRef.current) firstPdfInputRef.current.value = '';
      if (secondPdfInputRef.current) secondPdfInputRef.current.value = '';
    }
  };

  const handleClearPdf = async (scheduleType) => {
    if (!window.confirm(`Are you sure you want to clear/delete the active PDF copy for the ${scheduleType === 'first' ? 'First' : 'Second'} Schedule?`)) return;
    
    setLoading(true);
    try {
      const response = await axios.delete(`/api/v1/admin/content/schedule/clear-pdf/${selectedCategoryId}/${scheduleType}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        alert('PDF cleared successfully. You can now use the Visual HTML Editor.');
        fetchCategories();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear PDF.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/v1/category', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Sync innerHTML into DOM when editor type activates
  useEffect(() => {
    if (editorRef.current && activeEditorType && editorHtml) {
      editorRef.current.innerHTML = editorHtml;
    }
  }, [activeEditorType, editorHtml]);

  // Dynamic HTML generators for legacy fallback
  const buildFirstScheduleHtmlTable = (rows) => {
    let html = '<table border="1" style="width: 100%; border-collapse: collapse; font-size: 13px;">';
    html += '<thead><tr style="background-color: #f1f5f9;">';
    html += '<th style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Section</th>';
    html += '<th style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Offence</th>';
    html += '<th style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Punishment</th>';
    html += '<th style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Cognizable / Non-cognizable</th>';
    html += '<th style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Bailable / Non-bailable</th>';
    html += '<th style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">By what Court triable</th>';
    html += '</tr></thead><tbody>';
    
    rows.forEach(r => {
      html += '<tr>';
      html += `<td style="padding: 8px; border: 1px solid #cbd5e1;">${r.Section || ''}</td>`;
      html += `<td style="padding: 8px; border: 1px solid #cbd5e1;">${r.Offence || ''}</td>`;
      html += `<td style="padding: 8px; border: 1px solid #cbd5e1;">${r.Punishment || ''}</td>`;
      html += `<td style="padding: 8px; border: 1px solid #cbd5e1;">${r['Cognizable or Non- cognizable'] || ''}</td>`;
      html += `<td style="padding: 8px; border: 1px solid #cbd5e1;">${r['Bailable or Non- bailable'] || ''}</td>`;
      html += `<td style="padding: 8px; border: 1px solid #cbd5e1;">${r['By what Court triable'] || ''}</td>`;
      html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
  };

  const buildSecondScheduleHtml = (forms) => {
    let html = '';
    forms.forEach(f => {
      html += `<h2 style="font-size: 16px; font-weight: bold; color: #0284c7; margin-top: 20px;">${f.formNo || 'FORM No.'}</h2>`;
      html += `<h3 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">${f.title || ''}</h3>`;
      html += `<p style="font-size: 12px; line-height: 1.6; white-space: pre-line; margin-bottom: 15px;">${f.content || ''}</p>`;
      html += '<hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />';
    });
    return html;
  };

  const loadFirstScheduleData = async (catId) => {
    setLoading(true);
    setPublishSuccess(false);
    try {
      const catRes = await axios.get(`/api/v1/category/${catId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const cat = catRes.data.status ? catRes.data.data : null;

      const response = await axios.get(`/api/v1/firstschedule/getLegalEntries/${catId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        let finalHtml = '';
        if (cat && cat.firstScheduleHtml) {
          finalHtml = cat.firstScheduleHtml;
        } else {
          finalHtml = buildFirstScheduleHtmlTable(response.data.data);
        }
        // Set state first, then set editor type (triggers render + useEffect)
        setEditorHtml(finalHtml);
        setActiveEditorType('first');
        // Directly write to DOM after a tick, in case ref is not yet mounted
        setTimeout(() => {
          if (editorRef.current) editorRef.current.innerHTML = finalHtml;
        }, 50);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load First Schedule data.');
    } finally {
      setLoading(false);
    }
  };

  const loadSecondScheduleData = async (catId) => {
    setLoading(true);
    setPublishSuccess(false);
    try {
      const catRes = await axios.get(`/api/v1/category/${catId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const cat = catRes.data.status ? catRes.data.data : null;

      const response = await axios.get(`/api/v1/secondschedule/getLegalEntries/${catId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        let finalHtml = '';
        if (cat && cat.secondScheduleHtml) {
          finalHtml = cat.secondScheduleHtml;
        } else {
          finalHtml = buildSecondScheduleHtml(response.data.data);
        }
        setEditorHtml(finalHtml);
        setActiveEditorType('second');
        setTimeout(() => {
          if (editorRef.current) editorRef.current.innerHTML = finalHtml;
        }, 50);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load Second Schedule data.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishFirstSchedule = async () => {
    setPublishing(true);
    // Always read current DOM content directly — state may be stale if user never typed
    const currentHtml = editorRef.current ? editorRef.current.innerHTML : editorHtml;
    if (!currentHtml || currentHtml.trim() === '') {
      alert('Editor is empty — please add content before publishing.');
      setPublishing(false);
      return;
    }
    try {
      const response = await axios.put(`/api/v1/admin/content/schedule/publish-first/${selectedCategoryId}`, {
        htmlContent: currentHtml
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setPublishSuccess(true);
        setActiveEditorType(null);
        setEditorHtml('');
        fetchCategories(); // refresh cache
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish First Schedule.');
    } finally {
      setPublishing(false);
    }
  };

  const handlePublishSecondSchedule = async () => {
    setPublishing(true);
    // Always read current DOM content directly — state may be stale if user never typed
    const currentHtml = editorRef.current ? editorRef.current.innerHTML : editorHtml;
    if (!currentHtml || currentHtml.trim() === '') {
      alert('Editor is empty — please add content before publishing.');
      setPublishing(false);
      return;
    }
    try {
      const response = await axios.put(`/api/v1/admin/content/schedule/publish-second/${selectedCategoryId}`, {
        htmlContent: currentHtml
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setPublishSuccess(true);
        setActiveEditorType(null);
        setEditorHtml('');
        fetchCategories(); // refresh cache
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish Second Schedule.');
    } finally {
      setPublishing(false);
    }
  };

  // Upload image to backend and insert at cursor position
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Save cursor position before async upload
    const savedSel = window.getSelection();
    let savedRange = null;
    if (savedSel && savedSel.rangeCount > 0) {
      savedRange = savedSel.getRangeAt(0).cloneRange();
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/api/v1/admin/content/schedule/upload-image', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.status) {
        const imageUrl = response.data.data.url;
        // Restore cursor position and insert image
        if (editorRef.current) {
          editorRef.current.focus();
          if (savedRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedRange);
          }
          document.execCommand('insertImage', false, imageUrl);
          // Apply max-width style to inserted image
          const imgs = editorRef.current.querySelectorAll('img');
          imgs.forEach(img => {
            if (!img.style.maxWidth) {
              img.style.maxWidth = '100%';
              img.style.height = 'auto';
              img.style.display = 'block';
              img.style.margin = '10px 0';
              img.style.borderRadius = '4px';
            }
          });
          setEditorHtml(editorRef.current.innerHTML);
        }
      }
    } catch (err) {
      alert('Image upload failed. Please try again.');
    }
    // Reset file input so same file can be re-selected
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  // ContentEditable table manipulation tools
  const addTableRow = () => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    let node = range.startContainer;
    while (node && node.nodeName !== 'TR') {
      node = node.parentNode;
    }
    if (node) {
      const table = node.closest('table');
      if (table) {
        const colsCount = node.cells.length;
        const newRow = table.insertRow(node.rowIndex + 1);
        for (let i = 0; i < colsCount; i++) {
          const newCell = newRow.insertCell(i);
          newCell.style.border = '1px solid #cbd5e1';
          newCell.style.padding = '8px';
          newCell.innerHTML = 'Cell';
        }
        if (editorRef.current) setEditorHtml(editorRef.current.innerHTML);
      }
    }
  };

  const deleteTableRow = () => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    let node = range.startContainer;
    while (node && node.nodeName !== 'TR') {
      node = node.parentNode;
    }
    if (node) {
      const table = node.closest('table');
      if (table) {
        table.deleteRow(node.rowIndex);
        if (editorRef.current) setEditorHtml(editorRef.current.innerHTML);
      }
    }
  };

  const addTableCol = () => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    let node = range.startContainer;
    while (node && node.nodeName !== 'TD' && node.nodeName !== 'TH') {
      node = node.parentNode;
    }
    if (node) {
      const table = node.closest('table');
      if (table) {
        const cellIndex = node.cellIndex;
        for (let r = 0; r < table.rows.length; r++) {
          const row = table.rows[r];
          const isHeader = row.parentNode?.nodeName === 'THEAD' || r === 0;
          const newCell = isHeader ? document.createElement('th') : row.insertCell(cellIndex + 1);
          if (isHeader) {
            newCell.style.border = '1px solid #cbd5e1';
            newCell.style.padding = '8px';
            newCell.style.fontWeight = 'bold';
            newCell.innerHTML = 'Header';
            row.appendChild(newCell);
          } else {
            newCell.style.border = '1px solid #cbd5e1';
            newCell.style.padding = '8px';
            newCell.innerHTML = 'Cell';
          }
        }
        if (editorRef.current) setEditorHtml(editorRef.current.innerHTML);
      }
    }
  };

  const activeCategoryObj = categories.find(c => c._id === selectedCategoryId);

  return (
    <div className="space-y-6">
      
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl"></div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-blue-400" />
            <span>Schedules Visual CRUD Manager</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Select an Act and publish visual rich-formatted schedule HTML blocks directly to MongoDB.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <ClipboardList className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold text-blue-400">Word Engine v1.0</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Category List Sidebar */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Select Target Act</h3>
          
          <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat._id;
              return (
                <div
                  key={cat._id}
                  onClick={() => {
                    setSelectedCategoryId(cat._id);
                    setActiveEditorType(null);
                    setEditorHtml('');
                    setPublishSuccess(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 font-semibold text-xs border ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                      : 'border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Folder className={`h-4 w-4 ${isSelected ? 'text-blue-500' : 'text-slate-400'}`} />
                  <div className="truncate flex-1">
                    <p className="font-bold">{cat.name}</p>
                    <p className={`text-[10px] uppercase mt-0.5 font-bold ${isSelected ? 'text-blue-500' : 'text-slate-400'}`}>{cat.type} Act</p>
                  </div>
                </div>
              );
            })}
            {categories.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-10">No Acts or categories found.</p>
            )}
          </div>
        </div>

        {/* Schedule Selector & Visual Editor Workspace */}
        <div className="lg:col-span-3 space-y-6">
          
          {selectedCategoryId && !activeEditorType && !publishSuccess && (
            <div className="space-y-6 max-w-4xl mx-auto mt-6">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 text-center space-y-2">
                <ClipboardList className="h-10 w-10 text-blue-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">{activeCategoryObj?.name}</h4>
                <p className="text-xs text-slate-500">Choose between the rich text visual editor or upload a direct PDF file.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Schedule Card */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800">First Schedule</span>
                      {activeCategoryObj?.firstSchedulePdfUrl ? (
                        <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded-full font-bold">📄 PDF Copy Active</span>
                      ) : activeCategoryObj?.firstScheduleHtml ? (
                        <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-600 px-2 py-0.5 rounded-full font-bold">📝 WYSIWYG Active</span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold">Empty</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Classification and triability classification table of offences.</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => loadFirstScheduleData(selectedCategoryId)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 py-2.5 text-xs font-bold text-white transition"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Open Visual Rich Text Editor</span>
                    </button>

                    <input
                      ref={firstPdfInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handlePdfUpload(e, 'first')}
                    />
                    
                    <button
                      onClick={() => firstPdfInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 py-2.5 text-xs font-bold text-blue-700 transition"
                    >
                      <span>📤 Upload direct PDF instead</span>
                    </button>

                    {activeCategoryObj?.firstSchedulePdfUrl && (
                      <button
                        onClick={() => handleClearPdf('first')}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 py-2.5 text-xs font-bold text-red-700 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete PDF & Revert</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Second Schedule Card */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800">Second Schedule</span>
                      {activeCategoryObj?.secondSchedulePdfUrl ? (
                        <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded-full font-bold">📄 PDF Copy Active</span>
                      ) : activeCategoryObj?.secondScheduleHtml ? (
                        <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-600 px-2 py-0.5 rounded-full font-bold">📝 WYSIWYG Active</span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold">Empty</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Standard criminal procedure legal forms and templates.</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => loadSecondScheduleData(selectedCategoryId)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 py-2.5 text-xs font-bold text-white transition"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Open Visual Rich Text Editor</span>
                    </button>

                    <input
                      ref={secondPdfInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handlePdfUpload(e, 'second')}
                    />

                    <button
                      onClick={() => secondPdfInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 py-2.5 text-xs font-bold text-blue-700 transition"
                    >
                      <span>📤 Upload direct PDF instead</span>
                    </button>

                    {activeCategoryObj?.secondSchedulePdfUrl && (
                      <button
                        onClick={() => handleClearPdf('second')}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 py-2.5 text-xs font-bold text-red-700 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete PDF & Revert</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Publishing success banner */}
          {publishSuccess && (
            <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-center space-y-4 max-w-md mx-auto mt-10">
              <CheckCircle2 className="h-14 w-14 text-emerald-500" />
              <div>
                <h4 className="text-sm font-bold text-slate-800">Schedule Published Successfully</h4>
                <p className="text-xs text-slate-500 mt-1">Structured documents are saved and the mobile app is refreshed.</p>
              </div>
              <button
                onClick={() => setPublishSuccess(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                Back to Schedule Select
              </button>
            </div>
          )}

          {/* Loading overlay spinner */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-[350px] border border-slate-200 rounded-2xl bg-white space-y-3">
              <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
              <p className="text-xs font-bold text-slate-600">Retrieving schedule data...</p>
            </div>
          )}

          {/* MS Word Visual Editor Workspace */}
          {activeEditorType && !loading && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[650px] w-full">
              {/* Header Editor Bar */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Edit3 className="h-4.5 w-4.5 text-blue-500" />
                  <span>{activeEditorType === 'first' ? 'First' : 'Second'} Schedule Rich Text Editor ({activeCategoryObj?.name})</span>
                </span>
                <span className="text-xs font-bold text-slate-800 bg-slate-200 px-2 py-0.5 rounded">
                  Word Editor Mode
                </span>
              </div>

              {/* WYSIWYG Toolbar */}
              <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => document.execCommand('undo')}
                  className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition text-xs font-bold"
                  title="Undo"
                >
                  Undo
                </button>
                <button
                  type="button"
                  onClick={() => document.execCommand('redo')}
                  className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition text-xs font-bold"
                  title="Redo"
                >
                  Redo
                </button>
                <div className="w-[1px] bg-slate-200 mx-1" />
                <button
                  type="button"
                  onClick={() => document.execCommand('bold')}
                  className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition font-bold"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => document.execCommand('italic')}
                  className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition italic"
                  title="Italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => document.execCommand('underline')}
                  className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition underline"
                  title="Underline"
                >
                  U
                </button>
                <button
                  type="button"
                  onClick={() => document.execCommand('strikeThrough')}
                  className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition line-through"
                  title="Strike"
                >
                  S
                </button>
                <div className="w-[1px] bg-slate-200 mx-1" />
                <button
                  type="button"
                  onClick={() => document.execCommand('justifyLeft')}
                  className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition"
                  title="Align Left"
                >
                  Left
                </button>
                <button
                  type="button"
                  onClick={() => document.execCommand('justifyCenter')}
                  className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition"
                  title="Align Center"
                >
                  Center
                </button>
                <button
                  type="button"
                  onClick={() => document.execCommand('justifyRight')}
                  className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition"
                  title="Align Right"
                >
                  Right
                </button>
                <button
                  type="button"
                  onClick={() => document.execCommand('justifyFull')}
                  className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition"
                  title="Align Justify"
                >
                  Justify
                </button>
                <div className="w-[1px] bg-slate-200 mx-1" />
                <button
                  type="button"
                  onClick={() => document.execCommand('insertUnorderedList')}
                  className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition text-xs font-bold"
                  title="Bullet List"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() => document.execCommand('insertOrderedList')}
                  className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition text-xs font-bold"
                  title="Number List"
                >
                  1. List
                </button>
                <div className="w-[1px] bg-slate-200 mx-1" />
                <select
                  onChange={(e) => document.execCommand('formatBlock', false, e.target.value)}
                  className="text-xs border border-slate-200 rounded bg-white px-1 py-0.5 focus:outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>Style</option>
                  <option value="<p>">Paragraph</option>
                  <option value="<h1>">H1 Title</option>
                  <option value="<h2>">H2 Heading</option>
                  <option value="<h3>">H3 Sub-heading</option>
                </select>
                
                <button
                  type="button"
                  onClick={() => {
                    const r = parseInt(prompt("Enter rows count:", "5") || "0");
                    const c = parseInt(prompt("Enter columns count:", "6") || "0");
                    if (r > 0 && c > 0) {
                      let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 15px 0;"><thead><tr style="background-color: #f1f5f9;">';
                      for (let i = 0; i < c; i++) {
                        tableHtml += '<th style="border: 1px solid #cbd5e1; padding: 8px; font-weight: bold; text-align: left;">Header</th>';
                      }
                      tableHtml += '</tr></thead><tbody>';
                      for (let i = 0; i < r; i++) {
                        tableHtml += '<tr>';
                        for (let j = 0; j < c; j++) {
                          tableHtml += '<td style="border: 1px solid #cbd5e1; padding: 8px;">Cell</td>';
                        }
                        tableHtml += '</tr>';
                      }
                      tableHtml += '</tbody></table>';
                      document.execCommand('insertHTML', false, tableHtml);
                    }
                  }}
                  className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition text-xs font-bold border border-slate-200 bg-white"
                  title="Insert Table"
                >
                  + Table
                </button>

                <button
                  type="button"
                  onClick={addTableRow}
                  className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition text-xs font-bold"
                  title="Add Row Below"
                >
                  + Row
                </button>
                <button
                  type="button"
                  onClick={deleteTableRow}
                  className="p-1.5 hover:bg-slate-200 rounded text-red-600 transition text-xs font-bold"
                  title="Delete Row"
                >
                  - Row
                </button>
                <button
                  type="button"
                  onClick={addTableCol}
                  className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition text-xs font-bold"
                  title="Add Column Right"
                >
                  + Col
                </button>

                {/* Image Upload Button */}
                <div className="w-[1px] bg-slate-200 mx-1" />
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-1 p-1.5 hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-400 rounded text-emerald-700 transition text-xs font-bold bg-white"
                  title="Insert Image"
                >
                  <span>🖼</span>
                  <span>Insert Image</span>
                </button>
              </div>

              {/* Editor Workspace */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50/20">
                <div
                  ref={editorRef}
                  contentEditable
                  className="min-h-[400px] max-h-full border border-slate-200 rounded-xl p-4 bg-white focus:outline-none focus:border-blue-500 font-sans leading-relaxed text-sm shadow-sm"
                  onInput={() => setEditorHtml(editorRef.current.innerHTML)}
                  style={{ minHeight: '400px' }}
                />
              </div>

              {/* Publish Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setActiveEditorType(null);
                    setEditorHtml('');
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={activeEditorType === 'first' ? handlePublishFirstSchedule : handlePublishSecondSchedule}
                  disabled={publishing}
                  className={`flex items-center gap-2 rounded-xl py-3 px-6 text-sm font-bold text-white shadow-md transition-all duration-200 disabled:opacity-50 ${
                    activeEditorType === 'first' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  <Save className="h-4.5 w-4.5" />
                  <span>{publishing ? 'Publishing Changes...' : `Approve & Publish ${activeEditorType === 'first' ? 'First' : 'Second'} Schedule`}</span>
                </button>
              </div>
            </div>
          )}

          {!selectedCategoryId && !publishSuccess && (
            <div className="flex flex-col items-center justify-center h-[350px] border border-dashed border-slate-200 rounded-2xl bg-white text-slate-400 space-y-2">
              <ClipboardList className="h-10 w-10 text-slate-300" />
              <p className="text-xs font-semibold">Select an Act from the sidebar to view and manage its schedules.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default SchedulesCRUD;
