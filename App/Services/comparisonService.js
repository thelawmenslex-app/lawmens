import rawData from '../Assets/Data/lawData.json';
import mappingData from '../Assets/Data/comprehensiveMappings.json';

// Build dynamic lookup maps from comprehensiveMappings.json
const dynamicIpcMap = {};
(mappingData.ipcToBns || []).forEach(m => {
  dynamicIpcMap[m.oldSec] = { bnsSec: m.newSec, title: m.title };
});

const dynamicCrpcMap = {};
(mappingData.crpcToBnss || []).forEach(m => {
  dynamicCrpcMap[m.oldSec] = { bnssSec: m.newSec, title: m.title };
});

const dynamicIeaMap = {};
(mappingData.ieaToBsa || []).forEach(m => {
  dynamicIeaMap[m.oldSec] = { bsaSec: m.newSec, title: m.title };
});

export const IPC_BNS_MAPPING = dynamicIpcMap;
export const CRPC_BNSS_MAPPING = dynamicCrpcMap;
export const IEA_BSA_MAPPING = dynamicIeaMap;

// Compute Word Diffs between two legal texts
export function computeLegalDiff(oldText = '', newText = '') {
  const oldWords = oldText.split(/(\s+)/);
  const newWords = newText.split(/(\s+)/);

  const diffItems = [];
  let diffCount = 0;

  const maxLen = Math.max(oldWords.length, newWords.length);
  for (let i = 0; i < maxLen; i++) {
    const ow = oldWords[i] || '';
    const nw = newWords[i] || '';

    if (ow === nw) {
      diffItems.push({ type: 'UNCHANGED', text: ow });
    } else if (!ow && nw) {
      diffItems.push({ type: 'INSERTED', text: nw, label: '[+ ADDED]' });
      if (nw.trim().length > 0) diffCount++;
    } else if (ow && !nw) {
      diffItems.push({ type: 'DELETED', text: ow, label: '[- REMOVED]' });
      if (ow.trim().length > 0) diffCount++;
    } else {
      diffItems.push({ type: 'UPDATED', oldText: ow, newText: nw, label: '[~ MODIFIED]' });
      if (ow.trim().length > 0 || nw.trim().length > 0) diffCount++;
    }
  }

  return { diffItems, diffCount };
}

export const ComparisonService = {
  getMappingForIpc: (ipcSec) => {
    const s = String(ipcSec || '').trim();
    if (IPC_BNS_MAPPING[s]) return IPC_BNS_MAPPING[s];
    const base = s.split('(')[0].trim();
    return IPC_BNS_MAPPING[base] || null;
  },
  getMappingForCrpc: (crpcSec) => {
    const s = String(crpcSec || '').trim();
    if (CRPC_BNSS_MAPPING[s]) return CRPC_BNSS_MAPPING[s];
    const base = s.split('(')[0].trim();
    return CRPC_BNSS_MAPPING[base] || null;
  },
  getMappingForIea: (ieaSec) => {
    const s = String(ieaSec || '').trim();
    if (IEA_BSA_MAPPING[s]) return IEA_BSA_MAPPING[s];
    const base = s.split('(')[0].trim();
    return IEA_BSA_MAPPING[base] || null;
  },

  getComparisonPairInfo: (actCodeOrTitle = '') => {
    const code = (actCodeOrTitle || '').toUpperCase();
    if (code.includes('CRPC') || code.includes('BNSS') || code.includes('PROCEDURE') || code.includes('NAGARIK') || code.includes('SURAKSHA')) {
      return {
        oldCode: 'CrPC',
        oldTitle: 'Code of Criminal Procedure , 1973',
        newCode: 'BNSS',
        newTitle: 'Bharatiya Nagarik Suraksha Sanhita , 2023',
        headerSubtitle: 'Code of Criminal Procedure , 1973 vs Bharatiya Nagarik Suraksha Sanhita , 2023 Comparison',
        oldCatId: '6657528b84091c0faa66efd9',
        newCatId: '665752a184091c0faa66efe2',
        mapping: CRPC_BNSS_MAPPING,
      };
    }
    if (code.includes('IEA') || code.includes('BSA') || code.includes('EVIDENCE') || code.includes('SAKSHYA') || code.includes('ADHINIYAM')) {
      return {
        oldCode: 'IEA',
        oldTitle: 'India Evidence Act , 1872',
        newCode: 'BSA',
        newTitle: 'Bharatiya Sakshya Adhiniyam , 2023',
        headerSubtitle: 'India Evidence Act , 1872 vs Bharatiya Sakshya Adhiniyam , 2023 Comparison',
        oldCatId: '6657529084091c0faa66efdc',
        newCatId: '665752a784091c0faa66efe5',
        mapping: IEA_BSA_MAPPING,
      };
    }
    // Default to IPC <-> BNS
    return {
      oldCode: 'IPC',
      oldTitle: 'Indian Penal Code , 1860',
      newCode: 'BNS',
      newTitle: 'Bharatiya Nyaya Sanhita , 2023',
      headerSubtitle: 'Indian Penal Code , 1860 vs Bharatiya Nyaya Sanhita , 2023 Comparison',
      oldCatId: '6657528684091c0faa66efd6',
      newCatId: '6657529c84091c0faa66efdf',
      mapping: IPC_BNS_MAPPING,
    };
  }
};
