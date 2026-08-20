import rawData from '../Assets/Data/lawData.json';
import mappingData from '../Assets/Data/comprehensiveMappings.json';

const categoryCodeMap = {
  'bns': '6657529c84091c0faa66efdf',
  'bnss': '665752a184091c0faa66efe2',
  'bsa': '665752a784091c0faa66efe5',
  'ipc': '6657528684091c0faa66efd6',
  'crpc': '6657528b84091c0faa66efd9',
  'iea': '6657529084091c0faa66efdc',
};

const CAT_MAP = {
  '6657528684091c0faa66efd6': { code: 'IPC', name: 'Indian Penal Code, 1860', companion: 'BNS', companionName: 'Bharatiya Nyaya Sanhita, 2023', pairKey: 'ipcToBns' },
  '6657529c84091c0faa66efdf': { code: 'BNS', name: 'Bharatiya Nyaya Sanhita, 2023', companion: 'IPC', companionName: 'Indian Penal Code, 1860', pairKey: 'ipcToBns' },
  '6657528b84091c0faa66efd9': { code: 'CrPC', name: 'Code of Criminal Procedure, 1973', companion: 'BNSS', companionName: 'Bharatiya Nagarik Suraksha Sanhita, 2023', pairKey: 'crpcToBnss' },
  '665752a184091c0faa66efe2': { code: 'BNSS', name: 'Bharatiya Nagarik Suraksha Sanhita, 2023', companion: 'CrPC', companionName: 'Code of Criminal Procedure, 1973', pairKey: 'crpcToBnss' },
  '6657529084091c0faa66efdc': { code: 'IEA', name: 'Indian Evidence Act, 1872', companion: 'BSA', companionName: 'Bharatiya Sakshya Adhiniyam, 2023', pairKey: 'ieaToBsa' },
  '665752a784091c0faa66efe5': { code: 'BSA', name: 'Bharatiya Sakshya Adhiniyam, 2023', companion: 'IEA', companionName: 'Indian Evidence Act, 1872', pairKey: 'ieaToBsa' }
};

export const DataService = {
  getCategories: () => {
    return rawData.categories || [];
  },

  getChaptersByCategory: (catIdOrCode) => {
    const codeKey = String(catIdOrCode || '').toLowerCase().trim();
    const targetCatId = categoryCodeMap[codeKey] || catIdOrCode;

    const chapters = (rawData.casebooks || []).filter(c => {
      const cId = typeof c.categoryId === 'object' ? c.categoryId?.$oid : c.categoryId;
      return cId === targetCatId;
    });
    return chapters;
  },

  getSections: (catIdOrCode, chapterName) => {
    const chapters = DataService.getChaptersByCategory(catIdOrCode);
    if (!chapterName) {
      return chapters.flatMap(c => c.section || []);
    }
    const found = chapters.find(c => (c.name || '').toLowerCase() === String(chapterName).toLowerCase());
    return found ? (found.section || []) : [];
  },

  getMinorActs: () => {
    return rawData.minoracts || [];
  },

  getSecondSchedule: () => {
    return rawData.secondschedule || [];
  },

  searchSections: (query) => {
    if (!query || query.trim().length < 1) return [];
    const q = query.toLowerCase().trim();
    const results = [];

    for (const chapter of rawData.casebooks || []) {
      const cId = chapter.categoryId?.$oid || chapter.categoryId;
      const catInfo = CAT_MAP[cId];
      if (!catInfo) continue;

      for (const sec of chapter.section || []) {
        const secName = String(sec.name || '').trim();
        const keyword = (sec.keyword || '').trim();
        const content = (sec.content?.[0]?.content || '').trim();

        if (secName.toLowerCase() === q || secName.toLowerCase().startsWith(q) || keyword.toLowerCase().includes(q) || content.toLowerCase().includes(q)) {
          const pairList = mappingData[catInfo.pairKey] || [];
          let foundCompanion = null;

          if (catInfo.code === 'IPC' || catInfo.code === 'CrPC' || catInfo.code === 'IEA') {
            foundCompanion = pairList.find(p => p.oldSec === secName);
          } else {
            foundCompanion = pairList.find(p => p.newSec === secName);
          }

          const companionSec = foundCompanion
            ? (catInfo.code === 'IPC' || catInfo.code === 'CrPC' || catInfo.code === 'IEA' ? foundCompanion.newSec : foundCompanion.oldSec)
            : secName;

          const companionContent = foundCompanion
            ? (catInfo.code === 'IPC' || catInfo.code === 'CrPC' || catInfo.code === 'IEA' ? foundCompanion.newContent : foundCompanion.oldContent)
            : '';

          results.push({
            id: `${catInfo.code}_${secName}_${results.length}`,
            sourceLawCode: catInfo.code,
            sourceLawName: catInfo.name,
            sourceSec: secName,
            companionLawCode: catInfo.companion,
            companionLawName: catInfo.companionName,
            companionSec: companionSec,
            title: keyword || `Section ${secName}`,
            sourceContent: content,
            companionContent: companionContent
          });
        }
      }
    }
    return results.slice(0, 50);
  }
};
