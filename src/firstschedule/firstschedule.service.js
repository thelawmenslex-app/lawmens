const FirstSchedule = require('../models/firstschedule');
const { createDocument, getDocument, getDocuments } = require("../../services/common_services");
const { readFile } = require("../../services/importAndExportServices");
const fs = require('fs');

const addLegalEntry = async (data) => {
    const legalEntry = await createDocument(FirstSchedule, data);
    return legalEntry;
};

const getLegalEntry = async (options) => {
    const legalEntry = await getDocument(FirstSchedule, options);
    return legalEntry;
};


const getLegalEntryById = async () => {
    try {
        // Hardcoded ObjectId
        const objectId = '66caa05e2c835afc2e098bce'; // Replace this with the actual ObjectId

        // Fetch the document by ObjectId
        const legalEntry = await FirstSchedule.findById(objectId).lean();

        // Print the fetched document
        console.log('Fetched Legal Entry:', legalEntry);

        return legalEntry;
    } catch (error) {
        console.error('Error fetching legal entry:', error);
    }
};

const getLegalEntries = async (categoryId) => {
    const filter = categoryId ? { categoryId } : {};
    const legalEntries = await FirstSchedule.find(filter)
        .select({ Section: 1, Offence: 1, Punishment: 1, 'Cognizable or Non- cognizable' : 1, 'Bailable or Non- bailable': 1,  'By what Court triable': 1 })
        .sort({ Section: 1 })
        .lean();
    return legalEntries;
};

const updateLegalEntry = async (options, data) => {
    const legalEntry = await FirstSchedule.updateMany(options, data);
    return legalEntry;
};

const deleteLegalEntry = async (options) => {
    const legalEntry = await FirstSchedule.deleteMany(options);
    return legalEntry;
};

const importLegalEntries = async (file, id) => {
    const data = await readFile(file.path);
    const bulkData = [];

    for (const sheet of data) {
        for (const item of sheet.data) {
            bulkData.push({
                categoryId: id,
                Section: item.Section || item.section || "",
                Offence: item.Offence || item.offence || "",
                Punishment: item.Punishment || item.punishment || "",
                'Cognizable or Non- cognizable': item['Cognizable or Non- cognizable'] || item.Cognizable || item.cognizable || "",
                'Bailable or Non- bailable': item['Bailable or Non- bailable'] || item.Bailable || item.bailable || "",
                'By what Court triable': item['By what Court triable'] || item.Court || item.court || ""
            });
        }
    }

    let result = [];
    if (bulkData.length > 0) {
        await FirstSchedule.deleteMany({ categoryId: id });
        result = await FirstSchedule.insertMany(bulkData);
    }
    
    // Clean up file async after processing
    fs.unlink(file.path, () => {});
    return result;
};

module.exports = { 
    addLegalEntry, 
    getLegalEntry, 
    getLegalEntries, 
    updateLegalEntry, 
    deleteLegalEntry,
    getLegalEntryById,
    importLegalEntries
};
