const MinorAct = require('../models/minorAct');
const MinorActSection = require('../models/minorActSection');

const getMinorActs = async () => {
    return await MinorAct.find({ isActive: { $ne: false } }).sort({ order: 1, createdAt: 1 }).lean();
};

const getMinorActSections = async (minorActId) => {
    return await MinorActSection.find({ minorActId }).sort({ createdAt: 1 }).lean();
};

module.exports = {
    getMinorActs,
    getMinorActSections
};
