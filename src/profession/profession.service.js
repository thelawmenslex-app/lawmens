const Category = require('../models/profession');
const Content = require("../models/contentHistory");
const { createDocument, getDocument ,getDocuments} = require("../../services/common_services");
const addCategory = async (data) => {
    const category = await createDocument(Category, data);
    return category;
};
const getCategory = async (options) => {
    const category = await getDocument(Category, options);
    return category;
};
const getCategories = async () => {
    const category = await Category.find().select({ name: 1, type: 1, image: 1,act:1 }).lean();
    return category;
};

const addHistory = async (data) => {
    const category = await createDocument(Content, data);
    return category;
}
const getHistory = async (options) => {
    const category = await Content.countDocuments(options)
    return category;
}
const updateHistory = async (options, data) => {
    const category = await Content.updatemany(options, data);
    return category;
}
module.exports = { addCategory, getCategory, getCategories, addHistory, getHistory, updateHistory };
