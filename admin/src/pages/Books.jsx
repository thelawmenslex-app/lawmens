import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, BookOpen, AlertTriangle, FileCheck, CheckCircle2, ChevronRight } from 'lucide-react';

const Books = () => {
  const [file, setFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [preview, setPreview] = useState(null);
  const [rawBookData, setRawBookData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const token = localStorage.getItem('adminToken');

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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setPreview(null);
    setRawBookData(null);
    setImportSuccess(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setImportSuccess(false);

    const formData = new FormData();
    formData.append('bookFile', file);

    try {
      const response = await axios.post('/api/v1/admin/books/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.status) {
        setPreview(response.data.data.preview);
        setRawBookData(response.data.data.rawBookData);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'File upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!rawBookData) return;

    setImporting(true);
    try {
      // Allow overriding target categoryId
      const finalBookData = {
        ...rawBookData,
        categoryId: selectedCategoryId || rawBookData.categoryId
      };

      const response = await axios.post('/api/v1/admin/books/import', {
        bookData: finalBookData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status) {
        setImportSuccess(true);
        setPreview(null);
        setRawBookData(null);
        setFile(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Import process failed.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Upload controller card */}
        <div className="md:col-span-1 bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Book Upload Core</h3>
          <p className="text-xs text-slate-400">Select a validated JSON law book schema to parse and import.</p>
          
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition-all duration-200">
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                id="book-file-picker"
              />
              <label htmlFor="book-file-picker" className="cursor-pointer space-y-2">
                <Upload className="h-8 w-8 text-slate-400 mx-auto" />
                <span className="text-xs font-semibold text-slate-500 block">
                  {file ? file.name : 'Choose JSON File'}
                </span>
              </label>
            </div>

            {file && (
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/10 hover:bg-emerald-400"
              >
                {loading ? 'Processing File...' : 'Parse & Validate'}
              </button>
            )}
          </form>
        </div>

        {/* Validation Preview and Import controller card */}
        <div className="md:col-span-2 bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Data Verification & Preview</h3>

          {/* Success banner */}
          {importSuccess && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">Import Process Successful</p>
                <p className="text-xs text-emerald-600 mt-0.5">The legal book has been fully saved into the MongoDB master collections.</p>
              </div>
            </div>
          )}

          {/* Preview box */}
          {preview ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm font-medium text-slate-600">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <span className="text-xs text-slate-400 block mb-1">Detected Book Title</span>
                  <span className="font-bold text-slate-800">{preview.name}</span>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <span className="text-xs text-slate-400 block mb-1">Total Sections count</span>
                  <span className="font-bold text-slate-800">{preview.sectionsCount} Sections</span>
                </div>
              </div>

              {/* Target Category Overrider */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Override Target Category/Act</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none"
                >
                  <option value="">Keep JSON default Category ID ({preview.categoryId})</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.type})</option>
                  ))}
                </select>
              </div>

              {/* Duplicate checking results */}
              {preview.duplicates.length > 0 ? (
                <div className="flex gap-3 bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-xs font-semibold">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold">Duplicate Section Codes Detected</p>
                    <p className="text-amber-600 mt-0.5">Duplicate section numbers found: {preview.duplicates.join(', ')}</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-emerald-800 text-xs font-semibold">
                  <FileCheck className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <p>Structure check verified. No duplicate section numbers found.</p>
                </div>
              )}

              {/* Action trigger button */}
              <button
                onClick={handleImport}
                disabled={importing}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {importing ? 'Importing into DB...' : 'Confirm Bulk Import to Database'}
              </button>
            </div>
          ) : (
            !importSuccess && <p className="text-sm text-slate-400">Please choose and upload a JSON file to inspect parsing preview.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Books;
