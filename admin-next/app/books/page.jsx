"use client";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Upload, BookOpen, AlertTriangle, FileCheck, CheckCircle2, 
  ChevronRight, RefreshCw, Layers, History, Edit3, Trash2, 
  Plus, Save, Check, X, ArrowLeft, ArrowUpCircle, Play
} from 'lucide-react';

const Books = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [bookName, setBookName] = useState('');
  
  // File state
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // Job tracking
  const [activeJobId, setActiveJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [changelog, setChangelog] = useState('');

  // Editing state
  const [editedJson, setEditedJson] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(null);

  // History & rollbacks
  const [historyList, setHistoryList] = useState([]);
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  // Schedules state
  const [activeEditorType, setActiveEditorType] = useState(null); // null (book tree), 'first', 'second'
  const [scheduleRows, setScheduleRows] = useState([]);
  const [secondScheduleForms, setSecondScheduleForms] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [selectedFormIndex, setSelectedFormIndex] = useState(null);

  const [editorHtml, setEditorHtml] = useState('');
  const editorRef = useRef(null);

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

  // ContentEditable DOM helper actions
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

  // Set innerHTML once when activeEditorType changes
  useEffect(() => {
    if (editorRef.current && activeEditorType) {
      editorRef.current.innerHTML = editorHtml;
    }
  }, [activeEditorType]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

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

  const fetchHistory = async (catId) => {
    if (!catId) return;
    try {
      const response = await axios.get(`/api/v1/admin/content/import/versions/${catId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setHistoryList(response.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchHistory(selectedCategoryId);
    } else {
      setHistoryList([]);
    }
  }, [selectedCategoryId]);

  // Poll job status
  useEffect(() => {
    let interval;
    if (activeJobId) {
      interval = setInterval(async () => {
        try {
          const response = await axios.get(`/api/v1/admin/content/import/status/${activeJobId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.status) {
            const job = response.data.data;
            setJobStatus(job);
            if (job.status === 'validated' || job.status === 'failed' || job.status === 'imported') {
              clearInterval(interval);
              setLoading(false);
              if (job.extractedJson) {
                setEditedJson(job.extractedJson);
              }
            }
          }
        } catch (err) {
          console.error(err);
          clearInterval(interval);
          setLoading(false);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [activeJobId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!bookName) {
        // Auto fill book name from file name
        const cleanName = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        setBookName(cleanName.toUpperCase());
      }
    }
  };

  const [importType, setImportType] = useState('book'); // 'book', 'first-schedule', 'second-schedule'

  const loadFirstScheduleData = async (catId) => {
    setLoading(true);
    setPublishSuccess(false);
    setEditedJson(null);
    setJobStatus(null);
    setActiveEditorType('first');
    setSelectedRowIndex(null);
    try {
      const catRes = await axios.get(`/api/v1/category/${catId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const cat = catRes.data.status ? catRes.data.data : null;

      const response = await axios.get(`/api/v1/firstschedule/getLegalEntries/${catId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setScheduleRows(response.data.data);
        if (cat && cat.firstScheduleHtml) {
          setEditorHtml(cat.firstScheduleHtml);
        } else {
          setEditorHtml(buildFirstScheduleHtmlTable(response.data.data));
        }
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
    setEditedJson(null);
    setJobStatus(null);
    setActiveEditorType('second');
    setSelectedFormIndex(null);
    try {
      const catRes = await axios.get(`/api/v1/category/${catId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const cat = catRes.data.status ? catRes.data.data : null;

      const response = await axios.get(`/api/v1/secondschedule/getLegalEntries/${catId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setSecondScheduleForms(response.data.data);
        if (cat && cat.secondScheduleHtml) {
          setEditorHtml(cat.secondScheduleHtml);
        } else {
          setEditorHtml(buildSecondScheduleHtml(response.data.data));
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load Second Schedule data.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishFirstSchedule = async () => {
    setPublishing(true);
    try {
      const response = await axios.put(`/api/v1/admin/content/schedule/publish-first/${selectedCategoryId}`, {
        htmlContent: editorHtml
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setPublishSuccess(true);
        setActiveEditorType(null);
        setEditorHtml('');
        fetchCategories(); // refresh categories list cache
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish First Schedule.');
    } finally {
      setPublishing(false);
    }
  };

  const handlePublishSecondSchedule = async () => {
    setPublishing(true);
    try {
      const response = await axios.put(`/api/v1/admin/content/schedule/publish-second/${selectedCategoryId}`, {
        htmlContent: editorHtml
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setPublishSuccess(true);
        setActiveEditorType(null);
        setEditorHtml('');
        fetchCategories(); // refresh categories list cache
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish Second Schedule.');
    } finally {
      setPublishing(false);
    }
  };

  const handleLoadExisting = async () => {
    if (!selectedCategoryId) return;
    setLoading(true);
    setPublishSuccess(false);
    setEditedJson(null);
    setJobStatus(null);
    setIsEditingExisting(true);
    setActiveEditorType(null);
    
    try {
      const response = await axios.get(`/api/v1/admin/content/export/${selectedCategoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setEditedJson(response.data.data.extractedJson);
        setActiveJobId(response.data.data.jobId);
        const cat = categories.find(c => c._id === selectedCategoryId);
        if (cat) {
          setBookName(cat.name.toUpperCase());
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load existing book data.');
      setIsEditingExisting(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      alert("Please select a Target Category/Act first.");
      return;
    }
    if (importType === 'book' && !bookName) {
      alert("Please enter a Book Title/Name.");
      return;
    }
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setPublishSuccess(false);
    setEditedJson(null);
    setJobStatus(null);
    setIsEditingExisting(false);

    if (importType !== 'book') {
      const formData = new FormData();
      formData.append('upload', file);
      const endpoint = importType === 'first-schedule'
        ? `/api/v1/firstschedule/importLegalEntries/${selectedCategoryId}`
        : `/api/v1/secondschedule/importLegalEntries/${selectedCategoryId}`;

      try {
        const response = await axios.post(endpoint, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.status) {
          alert(importType === 'first-schedule' ? 'First schedule imported successfully!' : 'Second schedule imported successfully!');
          if (importType === 'first-schedule') {
            await loadFirstScheduleData(selectedCategoryId);
          } else {
            await loadSecondScheduleData(selectedCategoryId);
          }
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Schedule upload failed.');
        setLoading(false);
      }
      return;
    }

    const formData = new FormData();
    formData.append('bookFile', file);
    formData.append('categoryId', selectedCategoryId);
    formData.append('bookName', bookName);

    try {
      const response = await axios.post('/api/v1/admin/content/import/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.status) {
        setActiveJobId(response.data.data.jobId);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'File upload failed.');
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!activeJobId || !editedJson) return;
    setPublishing(true);
    try {
      if (isEditingExisting) {
        const response = await axios.put(`/api/v1/admin/content/import/publish-existing/${selectedCategoryId}`, {
          extractedJson: editedJson,
          changelog: changelog || 'Manual Existing Book Edit'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.status) {
          setPublishSuccess(true);
          setActiveJobId(null);
          setJobStatus(null);
          setEditedJson(null);
          setBookName('');
          setIsEditingExisting(false);
          fetchHistory(selectedCategoryId);
        }
      } else {
        // First save edited corrections
        await axios.put(`/api/v1/admin/content/import/edit/${activeJobId}`, {
          extractedJson: editedJson
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Then publish
        const response = await axios.post(`/api/v1/admin/content/import/publish/${activeJobId}`, {
          changelog: changelog || 'AI Book Import'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.status) {
          setPublishSuccess(true);
          setActiveJobId(null);
          setJobStatus(null);
          setEditedJson(null);
          setFile(null);
          setBookName('');
          fetchHistory(selectedCategoryId);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish book.');
    } finally {
      setPublishing(false);
    }
  };

  const handleRollback = async (historyJobId) => {
    if (!window.confirm("Roll back this category to this backup version? Current data will be replaced!")) return;
    try {
      const response = await axios.post(`/api/v1/admin/content/import/rollback/${historyJobId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        alert("Rollback executed successfully.");
        fetchHistory(selectedCategoryId);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Rollback failed.');
    }
  };

  const updateSectionField = (chapIdx, secIdx, field, val) => {
    if (!editedJson) return;
    const copy = { ...editedJson };
    copy.chapters[chapIdx].sections[secIdx][field] = val;
    setEditedJson(copy);
  };

  const handleAddChapter = () => {
    if (!editedJson) return;
    const copy = { ...editedJson };
    if (!copy.chapters) copy.chapters = [];
    copy.chapters.push({
      chapterNo: (copy.chapters.length + 1).toString(),
      chapterTitle: 'New Chapter Title',
      sections: []
    });
    setEditedJson(copy);
  };

  const handleDeleteChapter = (cIdx, e) => {
    e.stopPropagation();
    if (!editedJson) return;
    if (!window.confirm("Are you sure you want to delete this chapter and all its sections?")) return;
    const copy = { ...editedJson };
    copy.chapters.splice(cIdx, 1);
    setEditedJson(copy);
    if (activeChapterIndex === cIdx) {
      setActiveChapterIndex(null);
      setActiveSectionIndex(null);
      setActiveSection(null);
    }
  };

  const handleAddSection = (cIdx, e) => {
    e.stopPropagation();
    if (!editedJson) return;
    const copy = { ...editedJson };
    const chapter = copy.chapters[cIdx];
    if (!chapter.sections) chapter.sections = [];
    const newSec = {
      sectionNo: (chapter.sections.length + 1).toString(),
      title: 'New Section Title',
      content: 'No content available',
      oldversion: '',
      sectionId: ''
    };
    chapter.sections.push(newSec);
    setEditedJson(copy);
    setActiveChapterIndex(cIdx);
    setActiveSectionIndex(chapter.sections.length - 1);
    setActiveSection(newSec);
  };

  const handleDeleteSection = (cIdx, sIdx, e) => {
    e.stopPropagation();
    if (!editedJson) return;
    if (!window.confirm("Are you sure you want to delete this section?")) return;
    const copy = { ...editedJson };
    copy.chapters[cIdx].sections.splice(sIdx, 1);
    setEditedJson(copy);
    if (activeChapterIndex === cIdx && activeSectionIndex === sIdx) {
      setActiveChapterIndex(null);
      setActiveSectionIndex(null);
      setActiveSection(null);
    }
  };

  const handleAddFirstScheduleRow = () => {
    const newRow = {
      Section: 'New Section',
      Offence: 'Offence description',
      Punishment: 'Punishment details',
      'Cognizable or Non- cognizable': 'Cognizable',
      'Bailable or Non- bailable': 'Bailable',
      'By what Court triable': 'Court of Session'
    };
    const updated = [...scheduleRows, newRow];
    setScheduleRows(updated);
    setSelectedRowIndex(updated.length - 1);
    if (editedJson) {
      setEditedJson({ ...editedJson, firstSchedule: updated });
    }
  };

  const handleDeleteFirstScheduleRow = (rIdx, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this offence row?")) return;
    const copy = [...scheduleRows];
    copy.splice(rIdx, 1);
    setScheduleRows(copy);
    if (selectedRowIndex === rIdx) setSelectedRowIndex(null);
    if (editedJson) {
      setEditedJson({ ...editedJson, firstSchedule: copy });
    }
  };

  const handleUpdateFirstScheduleRow = (rIdx, key, val) => {
    const copy = [...scheduleRows];
    copy[rIdx][key] = val;
    setScheduleRows(copy);
    if (editedJson) {
      setEditedJson({ ...editedJson, firstSchedule: copy });
    }
  };

  const handleAddSecondScheduleForm = () => {
    const newForm = {
      formNo: 'Form No',
      title: 'Form Title',
      content: 'Form Content Body...'
    };
    const updated = [...secondScheduleForms, newForm];
    setSecondScheduleForms(updated);
    setSelectedFormIndex(updated.length - 1);
    if (editedJson) {
      setEditedJson({ ...editedJson, secondSchedule: updated });
    }
  };

  const handleDeleteSecondScheduleForm = (fIdx, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this form?")) return;
    const copy = [...secondScheduleForms];
    copy.splice(fIdx, 1);
    setSecondScheduleForms(copy);
    if (selectedFormIndex === fIdx) setSelectedFormIndex(null);
    if (editedJson) {
      setEditedJson({ ...editedJson, secondSchedule: copy });
    }
  };

  const handleUpdateSecondScheduleForm = (fIdx, key, val) => {
    const copy = [...secondScheduleForms];
    copy[fIdx][key] = val;
    setSecondScheduleForms(copy);
    if (editedJson) {
      setEditedJson({ ...editedJson, secondSchedule: copy });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl"></div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">AI Law Book Import System</h2>
          <p className="text-xs text-slate-400 mt-1">Upload files, extract structure using Grok AI OCR pipeline, and publish content.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Layers className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold text-emerald-400">Production Engine v2.0</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload & Form Column */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configure Import Job</h3>
            
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Target Category/Act</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm bg-white focus:border-emerald-500 focus:outline-none"
                  required
                >
                  <option value="">Select Act to overwrite...</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.type})</option>
                  ))}
                </select>
                {selectedCategoryId && (
                  <button
                    type="button"
                    onClick={handleLoadExisting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-950 hover:bg-slate-800 py-3 text-xs font-bold text-white shadow-sm transition-all duration-200 mt-2 border border-slate-800"
                  >
                    <BookOpen className="h-4 w-4 text-emerald-400" />
                    <span>Load & Edit Existing Book Data</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Book Title / Name</label>
                <input
                  type="text"
                  placeholder="E.g. BHARATIYA NYAYA SANHITA"
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Target File</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 bg-slate-50"
                >
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.json"
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                  <span className="text-xs font-bold text-slate-600 block">
                    {file ? file.name : 'Upload PDF, Word, or JSON'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">Maximum file size 10MB</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !file || !selectedCategoryId || !bookName}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/10 hover:bg-emerald-400 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Start AI Import Pipeline</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Historical versions log */}
          {selectedCategoryId && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>Version History</span>
              </h3>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {historyList.length > 0 ? (
                  historyList.map((h) => (
                    <div key={h._id} className="border border-slate-100 rounded-xl p-3.5 space-y-2.5 bg-slate-50">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800">Version {h.version}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(h.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold">{h.changelog}</p>
                      <button
                        onClick={() => handleRollback(h._id)}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-lg py-1.5 text-[11px] font-bold"
                      >
                        Restore Rollback Backup
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">No previous version history found.</p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Status & Preview Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Job Progress Stepper */}
          {jobStatus && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Progress Stepper</h3>
                <span className="text-xs font-bold text-emerald-500">{jobStatus.progress}% Complete</span>
              </div>

              {/* Progress Pipeline Visualization */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { name: 'Upload', status: 'extracting', active: ['extracting', 'ocr', 'parsed', 'validated', 'imported'] },
                  { name: 'Extract', status: 'extracting', active: ['ocr', 'parsed', 'validated', 'imported'] },
                  { name: 'OCR Pipeline', status: 'ocr', active: ['parsed', 'validated', 'imported'] },
                  { name: 'Validation', status: 'validated', active: ['imported'] }
                ].map((step, idx) => {
                  const isActive = step.active.includes(jobStatus.status) || jobStatus.status === step.status;
                  const isCurrent = jobStatus.status === step.status;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className={`h-2.5 rounded-full transition-all duration-300 ${
                        isActive ? 'bg-emerald-500' : isCurrent ? 'bg-emerald-400 animate-pulse' : 'bg-slate-100'
                      }`} />
                      <span className={`text-[10px] font-bold block text-center ${
                        isActive || isCurrent ? 'text-slate-800' : 'text-slate-400'
                      }`}>{step.name}</span>
                    </div>
                  );
                })}
              </div>

              {/* Validation reports alerts */}
              {jobStatus.validationReport && (
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  {jobStatus.validationReport.errors?.map((err, i) => (
                    <div key={i} className="flex gap-2.5 bg-red-50 border border-red-200 p-3 rounded-xl text-red-800 text-xs font-semibold">
                      <AlertTriangle className="h-4.5 w-4.5 text-red-500 flex-shrink-0" />
                      <p>{err}</p>
                    </div>
                  ))}
                  {jobStatus.validationReport.warnings?.map((warn, i) => (
                    <div key={i} className="flex gap-2.5 bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-800 text-xs font-semibold">
                      <AlertTriangle className="h-4.5 w-4.5 text-amber-500 flex-shrink-0" />
                      <p>{warn}</p>
                    </div>
                  ))}
                  {jobStatus.validationReport.errors?.length === 0 && jobStatus.validationReport.warnings?.length === 0 && (
                    <div className="flex gap-2.5 bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-800 text-xs font-semibold">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />
                      <p>All legal structure validations successfully verified. No errors or warnings found.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Success Banner */}
          {publishSuccess && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-emerald-800">
              <CheckCircle2 className="h-9 w-9 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">Law Book Published Successfully</p>
                <p className="text-xs text-emerald-600 mt-0.5">The database has been updated and a forced incremental synchronization trigger has been broadcast to all mobile apps.</p>
              </div>
            </div>
          )}

          {/* Extracted Tree Preview / Inline Editor */}
          {editedJson && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[650px]">
              
              {/* Tab Switcher Bar */}
              <div className="flex border-b border-slate-200 bg-slate-50 p-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveEditorType(null);
                  }}
                  className={`flex-grow py-2 text-xs font-bold rounded-xl transition ${
                    activeEditorType === null ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Book Chapters ({editedJson.chapters?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveEditorType('first');
                    setScheduleRows(editedJson.firstSchedule || []);
                    setSelectedRowIndex(null);
                  }}
                  className={`flex-grow py-2 text-xs font-bold rounded-xl transition ${
                    activeEditorType === 'first' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  First Schedule ({editedJson.firstSchedule?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveEditorType('second');
                    setSecondScheduleForms(editedJson.secondSchedule || []);
                    setSelectedFormIndex(null);
                  }}
                  className={`flex-grow py-2 text-xs font-bold rounded-xl transition ${
                    activeEditorType === 'second' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Second Schedule ({editedJson.secondSchedule?.length || 0})
                </button>
              </div>

              {activeEditorType === null && (
                <>
                  {/* Header Editor Bar */}
                  <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Edit3 className="h-4.5 w-4.5" />
                      <span>AI Extracted Structure Editor</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAddChapter}
                        className="flex items-center gap-1 rounded bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-slate-800 transition"
                      >
                        <Plus className="h-3 w-3 text-emerald-400" />
                        <span>Add Chapter</span>
                      </button>
                      <span className="text-xs font-bold text-slate-800 bg-slate-200 px-2 py-0.5 rounded">
                        {editedJson.chapters?.length || 0} Chapters
                      </span>
                    </div>
                  </div>

                  {/* Main Split Interface */}
                  <div className="flex flex-grow overflow-hidden">
                
                {/* Chapters/Sections Tree List */}
                <div className="w-1/3 border-r border-slate-200 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
                  {editedJson.chapters?.map((chap, cIdx) => (
                    <div key={cIdx} className="space-y-1.5 border-b border-slate-100 pb-2">
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 min-w-0">
                          <BookOpen className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                          <input
                            type="text"
                            value={chap.chapterTitle}
                            onChange={(e) => {
                              const copy = { ...editedJson };
                              copy.chapters[cIdx].chapterTitle = e.target.value;
                              setEditedJson(copy);
                            }}
                            className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none font-bold text-slate-800 truncate py-0.5 w-[90px]"
                          />
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleAddSection(cIdx, e)}
                            title="Add Section to Chapter"
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-emerald-600 transition"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteChapter(cIdx, e)}
                            title="Delete Chapter"
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-red-600 transition"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="pl-3 space-y-1">
                        {chap.sections?.map((sec, sIdx) => {
                          const isActive = activeChapterIndex === cIdx && activeSectionIndex === sIdx;
                          return (
                            <div 
                              key={sIdx}
                              onClick={() => {
                                setActiveChapterIndex(cIdx);
                                setActiveSectionIndex(sIdx);
                                setActiveSection(sec);
                              }}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all group/sec ${
                                isActive ? 'bg-emerald-500 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-600'
                              }`}
                            >
                              <span className="truncate mr-2">Sec {sec.sectionNo} - {sec.title}</span>
                              <button
                                onClick={(e) => handleDeleteSection(cIdx, sIdx, e)}
                                title="Delete Section"
                                className={`p-0.5 rounded opacity-0 group-hover/sec:opacity-100 transition-opacity ${
                                  isActive ? 'hover:bg-emerald-600 text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-red-600'
                                }`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inline Editing Form */}
                <div className="w-2/3 p-5 overflow-y-auto space-y-4">
                  {activeSection ? (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
                        Edit Section details - Chapter {editedJson.chapters[activeChapterIndex].chapterNo}
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Section Code/No.</label>
                          <input
                            type="text"
                            value={activeSection.sectionNo}
                            onChange={(e) => {
                              setActiveSection({ ...activeSection, sectionNo: e.target.value });
                              updateSectionField(activeChapterIndex, activeSectionIndex, 'sectionNo', e.target.value);
                            }}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-semibold text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Old Version Reference</label>
                          <input
                            type="text"
                            value={activeSection.oldversion || ''}
                            onChange={(e) => {
                              setActiveSection({ ...activeSection, oldversion: e.target.value });
                              updateSectionField(activeChapterIndex, activeSectionIndex, 'oldversion', e.target.value);
                            }}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-semibold text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Keyword/Title</label>
                        <input
                          type="text"
                          value={activeSection.title}
                          onChange={(e) => {
                            setActiveSection({ ...activeSection, title: e.target.value });
                            updateSectionField(activeChapterIndex, activeSectionIndex, 'title', e.target.value);
                          }}
                          className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 font-semibold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Section Content</label>
                        <textarea
                          rows={6}
                          value={activeSection.content}
                          onChange={(e) => {
                            setActiveSection({ ...activeSection, content: e.target.value });
                            updateSectionField(activeChapterIndex, activeSectionIndex, 'content', e.target.value);
                          }}
                          className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 font-sans leading-relaxed text-slate-800"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                      <BookOpen className="h-8 w-8 text-slate-300" />
                      <p className="text-xs">Select any section on the left to edit its details inline.</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Publish Control Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Publish Changelog Notes</label>
                  <input
                    type="text"
                    placeholder="E.g. Updated Section 318 text and mappings"
                    value={changelog}
                    onChange={(e) => setChangelog(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none bg-white font-semibold text-slate-800"
                  />
                </div>
                
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-all duration-200 disabled:opacity-50"
                >
                  <Save className="h-4.5 w-4.5" />
                  <span>{publishing ? 'Publishing Changes...' : 'Approve & Publish to MongoDB'}</span>
                </button>
              </div>
                </>
              )}

              {activeEditorType === 'first' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[650px] w-full">
                  {/* Header Editor Bar */}
                  <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Edit3 className="h-4.5 w-4.5 text-amber-500" />
                      <span>First Schedule Rich Text Editor (Classification of Offences)</span>
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
                  </div>

                  {/* Editor Workspace */}
                  <div className="flex-1 overflow-y-auto p-4 bg-slate-50/20">
                    <div
                      ref={editorRef}
                      contentEditable
                      className="min-h-[400px] max-h-full border border-slate-200 rounded-xl p-4 bg-white focus:outline-none focus:border-amber-500 font-sans leading-relaxed text-sm shadow-sm"
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
                      onClick={handlePublishFirstSchedule}
                      disabled={publishing}
                      className="flex items-center gap-2 rounded-xl py-3 px-6 text-sm font-bold text-white shadow-md bg-amber-500 hover:bg-amber-600 transition-all duration-200 disabled:opacity-50"
                    >
                      <Save className="h-4.5 w-4.5" />
                      <span>{publishing ? 'Publishing Changes...' : 'Approve & Publish First Schedule'}</span>
                    </button>
                  </div>
                </div>
              )}

              {activeEditorType === 'second' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[650px] w-full">
                  {/* Header Editor Bar */}
                  <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Edit3 className="h-4.5 w-4.5 text-blue-500" />
                      <span>Second Schedule Rich Text Editor (Forms)</span>
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
                      onClick={handlePublishSecondSchedule}
                      disabled={publishing}
                      className="flex items-center gap-2 rounded-xl py-3 px-6 text-sm font-bold text-white shadow-md bg-blue-500 hover:bg-blue-600 transition-all duration-200 disabled:opacity-50"
                    >
                      <Save className="h-4.5 w-4.5" />
                      <span>{publishing ? 'Publishing Changes...' : 'Approve & Publish Second Schedule'}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* First Schedule Editor */}
          {activeEditorType === 'first' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[650px]">
              {/* Header Editor Bar */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Edit3 className="h-4.5 w-4.5 text-amber-500" />
                  <span>First Schedule Rich Text Editor (Classification of Offences)</span>
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
              </div>

              {/* Editor Workspace */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50/20">
                <div
                  ref={editorRef}
                  contentEditable
                  className="min-h-[400px] max-h-full border border-slate-200 rounded-xl p-4 bg-white focus:outline-none focus:border-amber-500 font-sans leading-relaxed text-sm shadow-sm"
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
                  onClick={handlePublishFirstSchedule}
                  disabled={publishing}
                  className="flex items-center gap-2 rounded-xl py-3 px-6 text-sm font-bold text-white shadow-md bg-amber-500 hover:bg-amber-600 transition-all duration-200 disabled:opacity-50"
                >
                  <Save className="h-4.5 w-4.5" />
                  <span>{publishing ? 'Publishing Changes...' : 'Approve & Publish First Schedule'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Second Schedule Editor */}
          {activeEditorType === 'second' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[650px]">
              {/* Header Editor Bar */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Edit3 className="h-4.5 w-4.5 text-blue-500" />
                  <span>Second Schedule Rich Text Editor (Forms)</span>
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
                  onClick={handlePublishSecondSchedule}
                  disabled={publishing}
                  className="flex items-center gap-2 rounded-xl py-3 px-6 text-sm font-bold text-white shadow-md bg-blue-500 hover:bg-blue-600 transition-all duration-200 disabled:opacity-50"
                >
                  <Save className="h-4.5 w-4.5" />
                  <span>{publishing ? 'Publishing Changes...' : 'Approve & Publish Second Schedule'}</span>
                </button>
              </div>
            </div>
          )}

          {!editedJson && !jobStatus && !publishSuccess && !activeEditorType && (
            <div className="flex flex-col items-center justify-center h-[350px] border border-dashed border-slate-200 rounded-2xl bg-white text-slate-400 space-y-2">
              <Upload className="h-10 w-10 text-slate-300" />
              <p className="text-xs font-semibold">Upload a legal book to start processing.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Books;
