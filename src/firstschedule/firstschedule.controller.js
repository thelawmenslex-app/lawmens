const firstscheduleService = require('./firstschedule.service');
const { sendResponse, errorHandler } = require('../../utils/common_functions');

// Add a new legal entry
const addLegalEntry = async (req, res) => {
    try {
        const { body: data } = req;
        const checkEntry = await firstscheduleService.getLegalEntry({ section: data.section });
        if (checkEntry) {
            return sendResponse(res, false, 200, 'Legal entry already exists.');
        }
        await firstscheduleService.addLegalEntry(data);
        return sendResponse(res, true, 200, 'Legal entry added successfully.');
    } catch (error) {
        errorHandler(error, res);
    }
};

// Update an existing legal entry
const updateLegalEntry = async (req, res) => {
    try {
        const { params: { id }, body: data } = req;
        const updatedEntry = await firstscheduleService.updateLegalEntry({ _id: id }, data);
        if (!updatedEntry) {
            return sendResponse(res, false, 404, 'Legal entry not found.');
        }
        return sendResponse(res, true, 200, 'Legal entry updated successfully.', updatedEntry);
    } catch (error) {
        errorHandler(error, res);
    }
};

// Add a new section
const addSection = async (req, res) => {
    try {
        const { body: data } = req;
        await firstscheduleService.addSection(data);
        return sendResponse(res, true, 200, 'Section added successfully.');
    } catch (error) {
        errorHandler(error, res);
    }
};

// Add a new subsection
const addSubsection = async (req, res) => {
    try {
        const { body: data } = req;
        await firstscheduleService.addSubsection(data);
        return sendResponse(res, true, 200, 'Subsection added successfully.');
    } catch (error) {
        errorHandler(error, res);
    }
};

// Retrieve all legal entries
const getLegalEntries = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const legalEntries = await firstscheduleService.getLegalEntries(categoryId);
        return sendResponse(res, true, 200, 'Legal entries retrieved successfully.', legalEntries);
    } catch (error) {
        errorHandler(error, res);
    }
};

// Filter cases based on criteria
const caseFilter = async (req, res) => {
    try {
        const { body: filterCriteria } = req;
        const filteredCases = await firstscheduleService.caseFilter(filterCriteria);
        return sendResponse(res, true, 200, 'Cases filtered successfully.', filteredCases);
    } catch (error) {
        errorHandler(error, res);
    }
};

// Import legal entries from a file
const importLegalEntries = async (req, res) => {
    try {
        const { file, params: { id } } = req;
        const importedEntries = await firstscheduleService.importLegalEntries(file, id);
        return sendResponse(res, true, 200, 'Legal entries imported successfully.', importedEntries);
    } catch (error) {
        errorHandler(error, res);
    }
};

module.exports = { 
    addLegalEntry, 
    updateLegalEntry, 
    addSection, 
    addSubsection, 
    getLegalEntries, 
    caseFilter, 
    importLegalEntries 
};
