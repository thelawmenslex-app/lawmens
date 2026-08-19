const categoryService = require('./profession.service');
const { sendResponse, errorHandler } = require('../../utils/common_functions');
// Add a new end - use.
const addEndUse = async (req, res) => {
    try {
        const { body: data } = req;
        const checkCategory=await categoryService.getCategory({name:data.name});
        if(checkCategory){
        return sendResponse(res, false, 200, 'Category already exists.');
        }
        await categoryService.addCategory(data);
        return sendResponse(res, true, 200, 'Category added successfully.');
    } catch (error) {
        errorHandler(error, res);
    }
};
// Get available end use.
const getEndUses = async (req, res) => {
    try {
        const endUse = await categoryService.getCategories();
        return sendResponse(res, true, 200, 'Category available.', endUse);
    } catch (error) {
        errorHandler(error, res);
    }
};
module.exports = { addEndUse, getEndUses };
