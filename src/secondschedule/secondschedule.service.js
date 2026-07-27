const SecondSchedule = require('../models/secondschedule');
const { readFile } = require("../../services/importAndExportServices");
const fs = require('fs');

const getLegalEntries = async (categoryId) => {
    const filter = categoryId ? { categoryId } : {};
    const entries = await SecondSchedule.find(filter)
        .sort({ formNo: 1 })
        .lean();
    return entries;
};

const addLegalEntry = async (data) => {
    return await SecondSchedule.create(data);
};

const updateLegalEntry = async (options, data) => {
    return await SecondSchedule.updateMany(options, data);
};

const deleteLegalEntry = async (options) => {
    return await SecondSchedule.deleteMany(options);
};

const importLegalEntries = async (file, id) => {
    const data = await readFile(file.path);
    const bulkData = [];

    for (const sheet of data) {
        for (const item of sheet.data) {
            bulkData.push({
                categoryId: id,
                formNo: item.formNo || item.FormNo || item.form || item.Form || "",
                title: item.title || item.Title || item.name || item.Name || "",
                content: item.content || item.Content || item.text || item.Text || ""
            });
        }
    }

    let result = [];
    if (bulkData.length > 0) {
        await SecondSchedule.deleteMany({ categoryId: id });
        result = await SecondSchedule.insertMany(bulkData);
    }
    
    fs.unlink(file.path, () => {});
    return result;
};

module.exports = { 
    getLegalEntries, 
    addLegalEntry,
    updateLegalEntry, 
    deleteLegalEntry,
    importLegalEntries
};
