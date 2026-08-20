import rawData from '../Assets/Data/lawData.json';

// 1. IPC to BNS Section Cross-Reference Mapping
export const IPC_BNS_MAPPING = {
  '1': { bnsSec: '1', title: 'Title and extent of operation of the Code' },
  '2': { bnsSec: '1', title: 'Punishment of offences committed within India' },
  '3': { bnsSec: '1', title: 'Punishment of offences committed beyond India' },
  '4': { bnsSec: '1', title: 'Extension of Code to extra-territorial offences' },
  '53': { bnsSec: '4', title: 'Punishments (Community Service added in BNS)' },
  '120A': { bnsSec: '61', title: 'Definition of criminal conspiracy' },
  '120B': { bnsSec: '61', title: 'Punishment of criminal conspiracy' },
  '124A': { bnsSec: '152', title: 'Act endangering sovereignty, unity and integrity of India (Replaced Sedition)' },
  '141': { bnsSec: '189', title: 'Unlawful assembly' },
  '147': { bnsSec: '191', title: 'Punishment for rioting' },
  '149': { bnsSec: '190', title: 'Every member of unlawful assembly guilty of offence' },
  '153A': { bnsSec: '196', title: 'Promoting enmity between different groups' },
  '299': { bnsSec: '100', title: 'Culpable homicide' },
  '300': { bnsSec: '101', title: 'Murder' },
  '302': { bnsSec: '103', title: 'Punishment for murder' },
  '304': { bnsSec: '105', title: 'Punishment for culpable homicide not amounting to murder' },
  '304A': { bnsSec: '106', title: 'Causing death by negligence (Hit and run provisions)' },
  '304B': { bnsSec: '80', title: 'Dowry death' },
  '307': { bnsSec: '109', title: 'Attempt to murder' },
  '312': { bnsSec: '88', title: 'Causing miscarriage' },
  '319': { bnsSec: '114', title: 'Hurt' },
  '320': { bnsSec: '116', title: 'Grievous hurt' },
  '323': { bnsSec: '115', title: 'Punishment for voluntarily causing hurt' },
  '324': { bnsSec: '118', title: 'Voluntarily causing hurt by dangerous weapons' },
  '326': { bnsSec: '117', title: 'Voluntarily causing grievous hurt by dangerous weapons' },
  '326A': { bnsSec: '124', title: 'Voluntarily causing grievous hurt by use of acid, etc.' },
  '354': { bnsSec: '74', title: 'Assault or criminal force to woman with intent to outrage modesty' },
  '354A': { bnsSec: '75', title: 'Sexual harassment and punishment for sexual harassment' },
  '354B': { bnsSec: '76', title: 'Assault or use of criminal force to woman with intent to disrobe' },
  '354C': { bnsSec: '77', title: 'Voyeurism' },
  '354D': { bnsSec: '78', title: 'Stalking' },
  '375': { bnsSec: '63', title: 'Rape' },
  '376': { bnsSec: '64', title: 'Punishment for rape' },
  '376D': { bnsSec: '70', title: 'Gang rape' },
  '377': { bnsSec: 'Omitted / Repealed', title: 'Unnatural offences (Omitted in BNS)' },
  '378': { bnsSec: '303', title: 'Theft' },
  '379': { bnsSec: '303(2)', title: 'Punishment for theft' },
  '383': { bnsSec: '308', title: 'Extortion' },
  '390': { bnsSec: '309', title: 'Robbery' },
  '391': { bnsSec: '310', title: 'Dacoity' },
  '395': { bnsSec: '310(2)', title: 'Punishment for dacoity' },
  '405': { bnsSec: '316', title: 'Criminal breach of trust' },
  '406': { bnsSec: '316(2)', title: 'Punishment for criminal breach of trust' },
  '415': { bnsSec: '318', title: 'Cheating' },
  '420': { bnsSec: '318(4)', title: 'Cheating and dishonestly inducing delivery of property' },
  '425': { bnsSec: '324', title: 'Mischief' },
  '441': { bnsSec: '329', title: 'Criminal trespass' },
  '463': { bnsSec: '336', title: 'Forgery' },
  '465': { bnsSec: '336(2)', title: 'Punishment for forgery' },
  '498A': { bnsSec: '85', title: 'Husband or relative of husband subjecting woman to cruelty' },
  '499': { bnsSec: '356', title: 'Defamation' },
  '500': { bnsSec: '356(2)', title: 'Punishment for defamation (Community service included)' },
  '506': { bnsSec: '351', title: 'Punishment for criminal intimidation' },
  '509': { bnsSec: '79', title: 'Word, gesture or act intended to insult modesty of woman' },
  '511': { bnsSec: '62', title: 'Punishment for attempting to commit offences' },
};

// 2. CrPC to BNSS Section Cross-Reference Mapping
export const CRPC_BNSS_MAPPING = {
  '1': { bnssSec: '1', title: 'Short title, extent and commencement' },
  '2': { bnssSec: '2', title: 'Definitions (Electronic communication and records added)' },
  '6': { bnssSec: '6', title: 'Classes of Criminal Courts' },
  '24': { bnssSec: '18', title: 'Public Prosecutors' },
  '41': { bnssSec: '35', title: 'When police may arrest without warrant (Prior permission for elderly/infirm)' },
  '41A': { bnssSec: '35(3)', title: 'Notice of appearance before police officer' },
  '46': { bnssSec: '43', title: 'Arrest how made (Handcuff provisions)' },
  '54': { bnssSec: '53', title: 'Examination of arrested person by medical officer' },
  '63': { bnssSec: '63', title: 'Form of summons (Electronic summons included)' },
  '82': { bnssSec: '84', title: 'Proclamation for person absconding' },
  '100': { bnssSec: '103', title: 'Persons in charge of closed place to allow search (Videography mandated)' },
  '102': { bnssSec: '106', title: 'Power of police officer to seize certain property' },
  '105A': { bnssSec: '111', title: 'Attachment and forfeiture of property' },
  '125': { bnssSec: '144', title: 'Order for maintenance of wives, children and parents' },
  '144': { bnssSec: '163', title: 'Power to issue order in urgent cases of nuisance' },
  '154': { bnssSec: '173', title: 'Information in cognizable cases (Zero FIR & e-FIR mandated)' },
  '156': { bnssSec: '175', title: 'Police officer’s power to investigate cognizable case' },
  '161': { bnssSec: '180', title: 'Examination of witnesses by police (Audio-video recording)' },
  '164': { bnssSec: '183', title: 'Recording of confessions and statements (Audio-video electronic means)' },
  '167': { bnssSec: '187', title: 'Procedure when investigation cannot be completed in 24 hours' },
  '173': { bnssSec: '193', title: 'Report of police officer on completion of investigation' },
  '190': { bnssSec: '210', title: 'Cognizance of offences by Magistrates' },
  '200': { bnssSec: '223', title: 'Examination of complainant (Notice to accused before taking cognizance)' },
  '265A': { bnssSec: '289', title: 'Plea Bargaining' },
  '313': { bnssSec: '351', title: 'Power to examine the accused (Audio-video electronic means)' },
  '357A': { bnssSec: '396', title: 'Victim compensation scheme' },
  '436A': { bnssSec: '479', title: 'Maximum period for which an undertrial prisoner can be detained' },
  '437': { bnssSec: '480', title: 'When bail may be taken in case of non-bailable offence' },
  '438': { bnssSec: '482', title: 'Direction for grant of bail to person apprehending arrest (Anticipatory Bail)' },
  '439': { bnssSec: '483', title: 'Special powers of High Court or Court of Session regarding bail' },
  '482': { bnssSec: '528', title: 'Saving of inherent powers of High Court' },
};

// 3. IEA to BSA Section Cross-Reference Mapping
export const IEA_BSA_MAPPING = {
  '1': { bsaSec: '1', title: 'Short title, extent and commencement' },
  '3': { bsaSec: '2', title: 'Interpretation clause (Electronic and digital records included)' },
  '6': { bsaSec: '4', title: 'Relevancy of facts forming part of same transaction (Res Gestae)' },
  '8': { bsaSec: '6', title: 'Motive, preparation and previous or subsequent conduct' },
  '10': { bsaSec: '8', title: 'Things said or done by conspirator in reference to common design' },
  '17': { bsaSec: '15', title: 'Admission defined' },
  '24': { bsaSec: '22', title: 'Confession caused by inducement, threat or promise' },
  '25': { bsaSec: '23', title: 'Confession to police officer not to be proved' },
  '26': { bsaSec: '23(2)', title: 'Confession by accused while in custody of police not to be proved' },
  '27': { bsaSec: '23 Proviso', title: 'How much of information received from accused may be proved' },
  '32': { bsaSec: '26', title: 'Cases in which statement of relevant fact by person dead is relevant (Dying Declaration)' },
  '45': { bsaSec: '39', title: 'Opinions of experts' },
  '59': { bsaSec: '54', title: 'Proof of facts by oral evidence' },
  '61': { bsaSec: '56', title: 'Proof of contents of documents' },
  '62': { bsaSec: '57', title: 'Primary evidence (Includes electronic records created simultaneously)' },
  '63': { bsaSec: '58', title: 'Secondary evidence' },
  '65': { bsaSec: '60', title: 'Cases in which secondary evidence relating to documents may be given' },
  '65B': { bsaSec: '63', title: 'Admissibility of electronic records (Mandatory certificate in Schedule format)' },
  '101': { bsaSec: '104', title: 'Burden of proof' },
  '113B': { bsaSec: '118', title: 'Presumption as to dowry death' },
  '114A': { bsaSec: '120', title: 'Presumption as to absence of consent in certain prosecutions for rape' },
  '118': { bsaSec: '124', title: 'Who may testify' },
  '126': { bsaSec: '132', title: 'Professional communications (Attorney-client privilege)' },
  '137': { bsaSec: '142', title: 'Examination-in-chief, Cross-examination and Re-examination' },
  '145': { bsaSec: '148', title: 'Cross-examination as to previous statements in writing' },
  '154': { bsaSec: '157', title: 'Question by party to his own witness (Hostile witness)' },
};

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
  getMappingForIpc: (ipcSec) => IPC_BNS_MAPPING[ipcSec] || null,
  getMappingForCrpc: (crpcSec) => CRPC_BNSS_MAPPING[crpcSec] || null,
  getMappingForIea: (ieaSec) => IEA_BSA_MAPPING[ieaSec] || null,

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
