import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FolderPlus, 
  PlusCircle, 
  Trash2, 
  Edit, 
  ChevronRight, 
  FileText, 
  BookOpen, 
  X, 
  Save, 
  Folder 
} from 'lucide-react';

const Content = () => {
  const [categories, setCategories] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [sections, setSections] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  // Modals / forms state
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState('new');
  const [catAct, setCatAct] = useState('');
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);

  const [chapName, setChapName] = useState('');
  const [isChapModalOpen, setIsChapModalOpen] = useState(false);
  const [editChap, setEditChap] = useState(null);

  const [secName, setSecName] = useState('');
  const [secKeyword, setSecKeyword] = useState('');
  const [secOldVersion, setSecOldVersion] = useState('');
  const [secContentText, setSecContentText] = useState('');
  const [isSecModalOpen, setIsSecModalOpen] = useState(false);
  const [editSec, setEditSec] = useState(null);

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

  const fetchChapters = async (categoryId) => {
    try {
      setChapters([]);
      setSections([]);
      setSelectedChapter(null);
      
      const response = await axios.post('/api/v1/cases/casefilter', {
        categoryId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setChapters(response.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSections = async (chapter) => {
    try {
      setSections([]);
      const response = await axios.get(`/api/v1/cases/getSections/${chapter._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        // Sections are returned in an array
        setSections(response.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    fetchChapters(category._id);
  };

  const handleSelectChapter = (chapter) => {
    setSelectedChapter(chapter);
    fetchSections(chapter);
  };

  // 1. Categories CRUD Actions
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editCat) {
        // Update
        const response = await axios.put(`/api/v1/admin/content/categories/${editCat._id}`, {
          name: catName,
          type: catType,
          act: catAct
        }, { headers: { Authorization: `Bearer ${token}` } });
        if (response.data.status) {
          fetchCategories();
          setIsCatModalOpen(false);
          setEditCat(null);
        }
      } else {
        // Create
        const response = await axios.post('/api/v1/admin/content/categories', {
          name: catName,
          type: catType,
          act: catAct
        }, { headers: { Authorization: `Bearer ${token}` } });
        if (response.data.status) {
          fetchCategories();
          setIsCatModalOpen(false);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete category? All chapters under it will lose reference.')) return;
    try {
      const response = await axios.delete(`/api/v1/admin/content/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        fetchCategories();
        setSelectedCategory(null);
        setChapters([]);
        setSections([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Chapters CRUD Actions
  const handleSaveChapter = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return;
    try {
      if (editChap) {
        // Update
        const response = await axios.put(`/api/v1/admin/content/chapters/${editChap._id}`, {
          name: chapName
        }, { headers: { Authorization: `Bearer ${token}` } });
        if (response.data.status) {
          fetchChapters(selectedCategory._id);
          setIsChapModalOpen(false);
          setEditChap(null);
        }
      } else {
        // Create
        const response = await axios.post('/api/v1/admin/content/chapters', {
          name: chapName,
          categoryId: selectedCategory._id
        }, { headers: { Authorization: `Bearer ${token}` } });
        if (response.data.status) {
          fetchChapters(selectedCategory._id);
          setIsChapModalOpen(false);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteChapter = async (id) => {
    if (!window.confirm('Are you sure you want to delete this chapter?')) return;
    try {
      const response = await axios.delete(`/api/v1/admin/content/chapters/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        fetchChapters(selectedCategory._id);
        setSelectedChapter(null);
        setSections([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Sections CRUD Actions
  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!selectedChapter) return;
    try {
      if (editSec) {
        // Update
        const response = await axios.put(`/api/v1/admin/content/sections/${selectedChapter._id}/${editSec._id}`, {
          name: secName,
          keyword: secKeyword,
          oldversion: secOldVersion,
          contentText: secContentText
        }, { headers: { Authorization: `Bearer ${token}` } });
        if (response.data.status) {
          fetchSections(selectedChapter);
          setIsSecModalOpen(false);
          setEditSec(null);
        }
      } else {
        // Create
        const response = await axios.post('/api/v1/admin/content/sections', {
          chapterId: selectedChapter._id,
          name: secName,
          keyword: secKeyword,
          oldversion: secOldVersion,
          contentText: secContentText
        }, { headers: { Authorization: `Bearer ${token}` } });
        if (response.data.status) {
          fetchSections(selectedChapter);
          setIsSecModalOpen(false);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    try {
      const response = await axios.delete(`/api/v1/admin/content/sections/${selectedChapter._id}/${sectionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        fetchSections(selectedChapter);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)] overflow-hidden">
      
      {/* 1. Categories Column */}
      <div className="flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-full">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categories / Acts</span>
          <button 
            onClick={() => {
              setEditCat(null);
              setCatName('');
              setCatAct('');
              setCatType('new');
              setIsCatModalOpen(true);
            }}
            className="text-emerald-500 hover:text-emerald-700"
          >
            <FolderPlus className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {categories.map((cat) => (
            <div 
              key={cat._id}
              onClick={() => handleSelectCategory(cat)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-150 ${
                selectedCategory?._id === cat._id 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Folder className="h-4.5 w-4.5 flex-shrink-0" />
                <span className="truncate">{cat.name}</span>
              </div>
              <div className="flex items-center gap-2.5 ml-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditCat(cat);
                    setCatName(cat.name);
                    setCatAct(cat.act || '');
                    setCatType(cat.type || 'new');
                    setIsCatModalOpen(true);
                  }}
                  className={`${selectedCategory?._id === cat._id ? 'text-white' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(cat._id);
                  }}
                  className={`${selectedCategory?._id === cat._id ? 'text-white' : 'text-slate-400 hover:text-red-500'}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Chapters Column */}
      <div className="flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-full">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chapters (Casebooks)</span>
          {selectedCategory && (
            <button 
              onClick={() => {
                setEditChap(null);
                setChapName('');
                setIsChapModalOpen(true);
              }}
              className="text-emerald-500 hover:text-emerald-700"
            >
              <PlusCircle className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {selectedCategory ? (
            chapters.map((chap) => (
              <div 
                key={chap._id}
                onClick={() => handleSelectChapter(chap)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-150 ${
                  selectedChapter?._id === chap._id 
                    ? 'bg-emerald-500 text-white shadow-md' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <BookOpen className="h-4.5 w-4.5 flex-shrink-0" />
                  <span className="truncate">{chap.name}</span>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditChap(chap);
                      setChapName(chap.name);
                      setIsChapModalOpen(true);
                    }}
                    className={`${selectedChapter?._id === chap._id ? 'text-white' : 'text-slate-400 hover:text-slate-700'}`}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChapter(chap._id);
                    }}
                    className={`${selectedChapter?._id === chap._id ? 'text-white' : 'text-slate-400 hover:text-red-500'}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">Select a Category/Act to load chapters.</p>
          )}
        </div>
      </div>

      {/* 3. Sections Column */}
      <div className="flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-full">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sections</span>
          {selectedChapter && (
            <button 
              onClick={() => {
                setEditSec(null);
                setSecName('');
                setSecKeyword('');
                setSecOldVersion('');
                setSecContentText('');
                setIsSecModalOpen(true);
              }}
              className="text-emerald-500 hover:text-emerald-700"
            >
              <PlusCircle className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {selectedChapter ? (
            sections.map((sec) => (
              <div 
                key={sec._id}
                className="bg-slate-50 hover:bg-slate-100/70 border border-slate-100 rounded-xl p-4 transition-all duration-150 relative space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Section {sec.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{sec.keyword || 'No keyword'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setEditSec(sec);
                        setSecName(sec.name);
                        setSecKeyword(sec.keyword || '');
                        setSecOldVersion(sec.oldversion || '');
                        setSecContentText(sec.content?.[0]?.content || '');
                        setIsSecModalOpen(true);
                      }}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteSection(sec._id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {sec.oldversion && (
                  <p className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded inline-block">
                    Old version ref: {sec.oldversion}
                  </p>
                )}

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed pt-1.5 border-t border-slate-200/50">
                  {sec.content?.[0]?.content || 'No content details available.'}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">Select a Chapter to load sections.</p>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <form onSubmit={handleSaveCategory} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative border border-slate-100 space-y-4">
            <button type="button" onClick={() => setIsCatModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800">{editCat ? 'Edit Category' : 'Create Category'}</h3>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category Name</label>
              <input
                type="text"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category Type</label>
              <select
                value={catType}
                onChange={(e) => setCatType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none"
              >
                <option value="new">New Law (BNS, BNSS, BSA)</option>
                <option value="old">Old Law (IPC, CrPC, IEA)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category Act Details</label>
              <input
                type="text"
                value={catAct}
                onChange={(e) => setCatAct(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-400"
            >
              <Save className="h-4 w-4" />
              <span>Save Category</span>
            </button>
          </form>
        </div>
      )}

      {/* Chapter Modal */}
      {isChapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <form onSubmit={handleSaveChapter} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative border border-slate-100 space-y-4">
            <button type="button" onClick={() => setIsChapModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800">{editChap ? 'Edit Chapter' : 'Create Chapter'}</h3>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Chapter Name</label>
              <input
                type="text"
                value={chapName}
                onChange={(e) => setChapName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-400"
            >
              <Save className="h-4 w-4" />
              <span>Save Chapter</span>
            </button>
          </form>
        </div>
      )}

      {/* Section Modal */}
      {isSecModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <form onSubmit={handleSaveSection} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl relative border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={() => setIsSecModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800">{editSec ? 'Edit Section' : 'Create Section'}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Section Code/No.</label>
                <input
                  type="text"
                  placeholder="318"
                  value={secName}
                  onChange={(e) => setSecName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Old Version Reference</label>
                <input
                  type="text"
                  placeholder="420"
                  value={secOldVersion}
                  onChange={(e) => setSecOldVersion(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Keyword/Title</label>
              <input
                type="text"
                placeholder="Cheating and dishonestly inducing delivery of property"
                value={secKeyword}
                onChange={(e) => setSecKeyword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Section Content Details</label>
              <textarea
                rows="6"
                placeholder="Write legal text details..."
                value={secContentText}
                onChange={(e) => setSecContentText(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none font-sans leading-relaxed"
                required
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-400"
            >
              <Save className="h-4 w-4" />
              <span>Save Section</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default Content;
