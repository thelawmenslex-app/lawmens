const secondscheduleService = require('./secondschedule.service');
const { sendResponse, errorHandler } = require('../../utils/common_functions');

const addLegalEntry = async (req, res) => {
    try {
        const { body: data } = req;
        const checkEntry = await secondscheduleService.getLegalEntries(data.categoryId);
        const exists = checkEntry.some(e => e.formNo === data.formNo);
        if (exists) {
            return sendResponse(res, false, 200, 'Second schedule form already exists.');
        }
        await secondscheduleService.addLegalEntry(data);
        return sendResponse(res, true, 200, 'Second schedule form added successfully.');
    } catch (error) {
        errorHandler(error, res);
    }
};

const updateLegalEntry = async (req, res) => {
    try {
        const { params: { id }, body: data } = req;
        const updatedEntry = await secondscheduleService.updateLegalEntry({ _id: id }, data);
        if (!updatedEntry) {
            return sendResponse(res, false, 404, 'Second schedule form not found.');
        }
        return sendResponse(res, true, 200, 'Second schedule form updated successfully.', updatedEntry);
    } catch (error) {
        errorHandler(error, res);
    }
};

const getLegalEntries = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const entries = await secondscheduleService.getLegalEntries(categoryId);
        return sendResponse(res, true, 200, 'Second schedule forms retrieved successfully.', entries);
    } catch (error) {
        errorHandler(error, res);
    }
};

const importLegalEntries = async (req, res) => {
    try {
        const { file, params: { id } } = req;
        const importedEntries = await secondscheduleService.importLegalEntries(file, id);
        return sendResponse(res, true, 200, 'Second schedule forms imported successfully.', importedEntries);
    } catch (error) {
        errorHandler(error, res);
    }
};

module.exports = { 
    addLegalEntry, 
    updateLegalEntry, 
    getLegalEntries, 
    importLegalEntries 
};
