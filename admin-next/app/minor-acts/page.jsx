"use client";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  FileText, 
  UploadCloud, 
  Trash2, 
  Plus, 
  Save, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  FileDown,
  XCircle,
  Eye
} from 'lucide-react';

const MinorActsAdmin = () => {
  const [acts, setActs] = useState([]);
  const [actName, setActName] = useState('');
  const [actDescription, setActDescription] = useState('');
  
  // Modes: 'pdf' (direct upload) or 'parse' (json mapping editor)
  const [activeMode, setActiveMode] = useState('pdf'); 

  // File Upload State
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  
  // JSON Parser state
  const [parsedSections, setParsedSections] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

  const fetchMinorActs = async () => {
    setIsLoadingList(true);
    try {
      const response = await axios.get('/api/v1/admin/content/minor-acts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setActs(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load minor acts:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchMinorActs();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setErrorMsg('');
      
      // Auto-fill act name from filename if not typed yet
      if (!actName) {
        const nameGuess = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        setActName(nameGuess);
      }
    }
  };

  const handleDirectUpload = async () => {
    if (!actName.trim()) {
      setErrorMsg('Please specify the Criminal Minor Act name.');
      return;
    }
    if (!file) {
      setErrorMsg('Please select a PDF file to upload.');
      return;
    }

    setIsPublishing(true);
    setErrorMsg('');
    setPublishSuccess(false);

    const formData = new FormData();
    formData.append('name', actName);
    formData.append('description', actDescription);
    formData.append('pdf', file);

    try {
      const response = await axios.post('/api/v1/admin/content/minor-acts/upload-pdf', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status) {
        setPublishSuccess(true);
        setActName('');
        setActDescription('');
        setFile(null);
        setFileName('');
        fetchMinorActs();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to upload PDF.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleParse = async () => {
    if (!file) {
      setErrorMsg('Please select a PDF or TXT file to parse.');
      return;
    }
    
    setIsParsing(true);
    setErrorMsg('');
    setPublishSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/v1/admin/content/minor-acts/parse', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status) {
        setParsedSections(response.data.data.sections);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to parse file. Ensure it has readable section headings.');
    } finally {
      setIsParsing(false);
    }
  };

  const handlePublishSections = async () => {
    if (!actName.trim()) {
      setErrorMsg('Please specify the Criminal Minor Act name.');
      return;
    }
    if (parsedSections.length === 0) {
      setErrorMsg('No sections mapped to publish.');
      return;
    }

    setIsPublishing(true);
    setErrorMsg('');

    try {
      const response = await axios.post('/api/v1/admin/content/minor-acts/publish', {
        name: actName,
        description: actDescription,
        sections: parsedSections
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status) {
        setPublishSuccess(true);
        setParsedSections([]);
        setActName('');
        setActDescription('');
        setFile(null);
        setFileName('');
        fetchMinorActs();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to publish Minor Act.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClearPdf = async (id) => {
    if (!window.confirm('Are you sure you want to clear the PDF document for this Act?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/v1/admin/content/minor-acts/clear-pdf/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        alert('PDF cleared successfully.');
        fetchMinorActs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear PDF.');
    }
  };

  const handleDeleteAct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Minor Act entirely? This cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/v1/admin/content/minor-acts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        alert('Minor Act deleted successfully.');
        fetchMinorActs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete Minor Act.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-400" />
            <span>Criminal Minor Acts Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Upload PDF books directly (same as Schedules) or auto-parse files into structured JSON sections.</p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => { setActiveMode('pdf'); setParsedSections([]); setErrorMsg(''); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${activeMode === 'pdf' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Direct PDF Uploader
          </button>
          <button
            onClick={() => { setActiveMode('parse'); setErrorMsg(''); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${activeMode === 'parse' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            PDF / Text to JSON Parser
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Input Form & Control Panel */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-3 border-slate-100">
              <UploadCloud className="h-4.5 w-4.5 text-indigo-600" />
              <span>{activeMode === 'pdf' ? 'Direct PDF Uploader' : 'Import & Parse Document'}</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Act Book Name</label>
                <input
                  type="text"
                  value={actName}
                  onChange={(e) => setActName(e.target.value)}
                  placeholder="e.g. Arms Act, 1959"
                  className="w-full text-xs font-semibold text-slate-800 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Description</label>
                <input
                  type="text"
                  value={actDescription}
                  onChange={(e) => setActDescription(e.target.value)}
                  placeholder="Short explanation of the act"
                  className="w-full text-xs font-semibold text-slate-800 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
                />
              </div>
            </div>

            {/* Document Uploader */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50 rounded-xl p-6 text-center cursor-pointer transition"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={activeMode === 'pdf' ? '.pdf' : '.pdf,.txt'}
                className="hidden"
                onChange={handleFileChange}
              />
              <UploadCloud className="h-10 w-10 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Click to upload Minor Act document</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {activeMode === 'pdf' ? 'Supports PDF files only' : 'Supports PDF or Plain Text (.txt)'}
              </p>
            </div>

            {fileName && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                <div className="truncate flex-1 pr-2">
                  <p className="text-xs font-bold text-slate-700 truncate">{fileName}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Ready</p>
                </div>
                <button 
                  onClick={() => { setFile(null); setFileName(''); }}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 flex items-start gap-2 text-xs font-semibold">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {activeMode === 'pdf' ? (
              <button
                onClick={handleDirectUpload}
                disabled={isPublishing || !file || !actName.trim()}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading PDF...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Upload & Publish PDF</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleParse}
                disabled={isParsing || !file}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Parsing structure...</span>
                  </>
                ) : (
                  <span>Convert to Structured JSON</span>
                )}
              </button>
            )}
          </div>

          {/* Upload Status Card */}
          {publishSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-5 text-center space-y-2 shadow-sm">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
              <h4 className="text-xs font-bold">Act Published Successfully!</h4>
              <p className="text-[10px] text-emerald-600/90">The Minor Act is now live and instantly accessible by mobile users.</p>
              <button 
                onClick={() => setPublishSuccess(false)}
                className="text-[10px] underline font-bold text-emerald-700 hover:text-emerald-950 mt-1 block mx-auto"
              >
                Dismiss
              </button>
            </div>
          )}

        </div>

        {/* Dynamic Workspace Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {parsedSections.length > 0 ? (
            /* JSON Parse Editor */
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">MAPPED STRUCTURE ({parsedSections.length} sections found)</span>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">Draft mode</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {parsedSections.map((sec, i) => (
                  <div key={i} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3 relative">
                    <button 
                      onClick={() => setParsedSections(parsedSections.filter((_, idx) => idx !== i))}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-600 p-1 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-8">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Chapter</label>
                        <input
                          type="text"
                          value={sec.chapter}
                          onChange={(e) => {
                            const updated = [...parsedSections];
                            updated[i].chapter = e.target.value;
                            setParsedSections(updated);
                          }}
                          className="w-full text-xs font-medium text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Sec Number</label>
                        <input
                          type="text"
                          value={sec.sectionNumber}
                          onChange={(e) => {
                            const updated = [...parsedSections];
                            updated[i].sectionNumber = e.target.value;
                            setParsedSections(updated);
                          }}
                          className="w-full text-xs font-bold text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Sec Title</label>
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => {
                            const updated = [...parsedSections];
                            updated[i].title = e.target.value;
                            setParsedSections(updated);
                          }}
                          className="w-full text-xs font-semibold text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Content Description</label>
                      <textarea
                        rows={2}
                        value={sec.content}
                        onChange={(e) => {
                          const updated = [...parsedSections];
                          updated[i].content = e.target.value;
                          setParsedSections(updated);
                        }}
                        className="w-full text-xs text-slate-700 border border-slate-200 rounded-lg p-2.5 bg-white leading-relaxed resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
                <button
                  onClick={() => setParsedSections([])}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 transition text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublishSections}
                  disabled={isPublishing}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving sections...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Approve & Save Sections</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Acts CRUD Table List (Schedules CRUD counterpart) */
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Minor Acts Catalog ({acts.length} acts total)</h3>
                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-bold">50 PDFs Scalable</span>
              </div>

              {isLoadingList ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2">
                  <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
                  <span className="text-xs text-slate-400">Fetching acts...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                    <thead className="bg-slate-50 font-bold text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Act Name</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Document Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {acts.map((act) => (
                        <tr key={act._id} className="hover:bg-slate-50/50 transition">
                          <td className="px-4 py-3 font-bold text-slate-800">{act.name}</td>
                          <td className="px-4 py-3 text-slate-500 truncate max-w-[150px]">{act.description || 'No description'}</td>
                          <td className="px-4 py-3">
                            {act.pdfUrl ? (
                              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg w-fit font-semibold">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                <span>PDF Uploaded</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg w-fit font-semibold">
                                <XCircle className="h-3.5 w-3.5 text-slate-400" />
                                <span>Structured JSON Only</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right space-x-1.5">
                            {act.pdfUrl && (
                              <>
                                <a 
                                  href={`/api/v1${act.pdfUrl}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-1 rounded-lg hover:bg-indigo-100 transition"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>View</span>
                                </a>
                                <button
                                  onClick={() => handleClearPdf(act._id)}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 px-2 py-1 rounded-lg hover:bg-rose-100 transition"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  <span>Clear PDF</span>
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteAct(act._id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Delete Act entirely"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {acts.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-10 text-slate-400 font-semibold">No Criminal Minor Acts published yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default MinorActsAdmin;
