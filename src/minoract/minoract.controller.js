const minoractService = require('./minoract.service');
const { sendResponse, errorHandler } = require('../../utils/common_functions');

// Retrieve all active minor acts
const getMinorActs = async (req, res) => {
    try {
        const data = await minoractService.getMinorActs();
        return sendResponse(res, true, 200, 'Minor Acts retrieved successfully.', data);
    } catch (error) {
        return errorHandler(error, res);
    }
};

// Retrieve all sections for a specific minor act
const getMinorActSections = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await minoractService.getMinorActSections(id);
        
        // Group by chapter for accordion UI
        const grouped = [];
        const chaptersMap = {};

        data.forEach(item => {
            const chapName = item.chapter || 'General Sections';
            if (!chaptersMap[chapName]) {
                chaptersMap[chapName] = {
                    title: chapName,
                    sections: []
                };
                grouped.push(chaptersMap[chapName]);
            }
            chaptersMap[chapName].sections.push(item);
        });

        return sendResponse(res, true, 200, 'Minor Act sections retrieved successfully.', grouped);
    } catch (error) {
        return errorHandler(error, res);
    }
};

module.exports = {
    getMinorActs,
    getMinorActSections
};
