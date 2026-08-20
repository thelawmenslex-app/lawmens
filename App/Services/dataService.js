import rawData from '../Assets/Data/lawData.json';

const categoryCodeMap = {
  'bns': '6657529c84091c0faa66efdf',
  'bnss': '665752a184091c0faa66efe2',
  'bsa': '665752a784091c0faa66efe5',
  'ipc': '6657528684091c0faa66efd6',
  'crpc': '6657528b84091c0faa66efd9',
  'iea': '6657529084091c0faa66efdc',
};

export const DataService = {
  getCategories: () => {
    return rawData.categories || [];
  },

  getChaptersByCategory: (catIdOrCode) => {
    const targetCatId = categoryCodeMap[catIdOrCode?.toLowerCase()] || catIdOrCode;
    const chapters = (rawData.casebooks || []).filter(c => {
      const cId = typeof c.categoryId === 'object' ? c.categoryId.$oid : c.categoryId;
      return cId === targetCatId;
    });
    return chapters;
  },

  getMinorActs: () => {
    return rawData.minoracts || [];
  },

  getSecondSchedule: () => {
    return rawData.secondschedule || [];
  },

  searchSections: (query) => {
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    const results = [];

    for (const chapter of rawData.casebooks || []) {
      for (const sec of chapter.section || []) {
        const secName = (sec.name || '').toLowerCase();
        const contentText = (sec.content || []).map(c => c.content || '').join(' ').toLowerCase();
        if (secName.includes(q) || contentText.includes(q)) {
          results.push({
            chapterName: chapter.name,
            categoryId: chapter.categoryId,
            section: sec,
          });
        }
      }
    }
    return results.slice(0, 50);
  }
};
