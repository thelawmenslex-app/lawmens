const casebookService = require('./casebook.service');
const { sendResponse, errorHandler } = require('../../utils/common_functions');
const { ObjectId } = require("mongodb")
const { getCategory } = require("../category/category.service")
const { generatePDF } = require("../../services/pdf.services");
const fs = require("fs")
const { addHistory } = require("../category/category.service");
const path = require('path');
const { readFile } = require("../../services/importAndExportServices");
const addSsn = async (req, res) => {
    try {
        const { body: data } = req;
        const checkCategory = await casebookService.getCasebook({ name: data.name });
        if (checkCategory) {
            return sendResponse(res, false, 200, 'SSN already exists.');
        }
        const casebook = await casebookService.addCasebook(data);
        return sendResponse(res, true, 200, 'SSN added successfully.', casebook);
    } catch (error) {
        errorHandler(error, res);
    }
};
const addSection = async (req, res) => {
    try {
        const { body: data, params: { ssnId } } = req;
        const checkCategory = await casebookService.getCasebook({ _id: ssnId });
        if (!checkCategory) {
            return sendResponse(res, false, 200, 'SSN does not exists.');
        } else {
            const update = await casebookService.updateCasebooks({ _id: ssnId, 'section.name': { $ne: data.name } }, { $push: { section: data } })
            return sendResponse(res, true, 200, 'Section added successfully.');
        }
    } catch (error) {
        errorHandler(error, res);
    }
};

const addSectionContent = async (req, res) => {
    try {
        const { body: data, params: { ssnId, sectionId } } = req;
        const checkCategory = await casebookService.getCasebook({ _id: ssnId });
        if (!checkCategory) {
            return sendResponse(res, false, 200, 'SSN does not exists.');
        } else {
            const update = await casebookService.updateCasebooks({ _id: ssnId, 'section._id': sectionId }, { "section.$.content": data.content })
            return sendResponse(res, true, 200, 'Content added successfully.');
        }
    } catch (error) {
        errorHandler(error, res);
    }
};

const addSubSection = async (req, res) => {
    try {
        const { body: data, params: { ssnId } } = req;

        const checkCategory = await casebookService.getSubsection({ name: data.name });
        if (checkCategory) {
            return sendResponse(res, false, 200, 'Sub section already exists.');
        }
        const casebook = await casebookService.addSubsection(data);
        return sendResponse(res, true, 200, 'Section added successfully.', casebook);

    } catch (error) {
        errorHandler(error, res);
    }
};
const addUnderSection = async (req, res) => {
    try {
        const { body: data, params: { subsectionId } } = req;
        const checkCategory = await casebookService.getSubsection({ _id: subsectionId });
        if (!checkCategory) {
            return sendResponse(res, false, 200, 'Sub section does not exists.');
        } else {
            const update = await casebookService.addUndersection({ _id: subsectionId, 'underSection.name': { $ne: data.name } }, { $push: { underSection: data } })
            return sendResponse(res, true, 200, 'Under section added successfully.');
        }
    } catch (error) {
        errorHandler(error, res);
    }
};
const addContent = async (req, res) => {
    try {
        const { body: data, params: { subsectionId, undersectionId } } = req;
        const checkCategory = await casebookService.getSubsection({ _id: subsectionId });
        if (!checkCategory) {
            return sendResponse(res, false, 200, 'Sub section does not exists.');
        } else {
            const update = await casebookService.addUndersection({ _id: subsectionId, 'underSection._id': undersectionId }, { $push: { 'underSection.$.content': data } })
            return sendResponse(res, true, 200, 'Content added successfully.');
        }
    } catch (error) {
        errorHandler(error, res);
    }
};
const getcases = async (req, res) => {
    try {
        const { body: data, params: { ssnId } } = req;
        const checkCategory = await casebookService.getChilds({});
        return sendResponse(res, true, 200, 'Section added successfully.', checkCategory);
    } catch (error) {
        errorHandler(error, res);
    }
};
const caseFilter = async (req, res) => {
    try {
        const { body: data, query: { search } } = req;
        const mongoose = require('mongoose');

        // Sanitize categoryId to prevent CastErrors
        if (data && data.categoryId) {
            if (Array.isArray(data.categoryId)) {
                data.categoryId = data.categoryId.filter(id => mongoose.Types.ObjectId.isValid(id));
            } else if (typeof data.categoryId === 'string') {
                if (mongoose.Types.ObjectId.isValid(data.categoryId)) {
                    data.categoryId = [data.categoryId];
                } else {
                    data.categoryId = [];
                }
            }
        } else {
            if (data) {
                data.categoryId = [];
            }
        }

        const checkCategory = await casebookService.getFilters(data, search);
        return sendResponse(res, true, 200, 'Section added successfully.', checkCategory);
    } catch (error) {
        errorHandler(error, res);
    }
}
const getSections = async (req, res) => {
    try {
        const { params: { snsId }, profile } = req;
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(snsId)) {
            return sendResponse(res, true, 200, 'Section not available.', []);
        }

        const checkCategory = await casebookService.getCasebook({ _id: snsId });
        if (checkCategory) {
                checkCategory.section = checkCategory.section.map((item) => {
                    const result = { 
                        _id: item._id, 
                        name: item.name, 
                        baseId: snsId, 
                        content: item.content || [], 
                        keyword: item.keyword || '',
                        oldversion: item.oldversion || '',
                        sectionId: item.sectionId || '',
                        title: item.keyword || '', 
                        bookMark: false 
                    };
                    return result;
                })
            return sendResponse(res, true, 200, 'Section  available.', checkCategory.section ? checkCategory.section : []);
        } else {
            return sendResponse(res, true, 200, 'Section not available.', []);
        }
    } catch (error) {
        errorHandler(error, res);
    }
}
const getSubSections = async (req, res) => {
    try {
        const { params: { sectionId } } = req;
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(sectionId)) {
            return sendResponse(res, true, 200, 'Section not available.', []);
        }

        const checkCategory = await casebookService.getChilds({ sectionId: sectionId }, { name: 1 });
        if (checkCategory.length) {
            for (const order of checkCategory) {
                order.sectionId = sectionId
            }
            return sendResponse(res, true, 200, 'Section  available.', checkCategory);
        } else {
            return sendResponse(res, true, 200, 'Section not available.', []);
        }
    } catch (error) {
        errorHandler(error, res);
    }
}
const getUndersections = async (req, res) => {
    try {
        const { params: { subsectionId } } = req;
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(subsectionId)) {
            return sendResponse(res, true, 200, 'Section not available.', []);
        }

        const checkCategory = await casebookService.getSubsection({ _id: subsectionId }, { 'underSection.name': 1, 'underSection._id': 1 });
        if (checkCategory && checkCategory.underSection && checkCategory.underSection.length) {
            for (const order of checkCategory.underSection) {
                order.subSectionId = subsectionId
            }
            return sendResponse(res, true, 200, 'Section  available.', checkCategory.underSection);
        } else {
            return sendResponse(res, true, 200, 'Section not available.', []);
        }
    } catch (error) {
        errorHandler(error, res);
    }
}
const getContent = async (req, res) => {
    try {
        const { params: { subsectionId, underSectionId, page }, profile } = req;
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(subsectionId) || !mongoose.Types.ObjectId.isValid(underSectionId)) {
            return sendResponse(res, true, 200, 'Section not available.', { content: "", page: 1, totalpage: 1 });
        }

        const checkCategory = await casebookService.getSubsection({ _id: subsectionId, 'underSection._id': underSectionId }, { underSection: 1 });
        if (checkCategory && checkCategory.underSection && checkCategory.underSection.length) {
            const content = checkCategory.underSection.find(item => item._id.toString() === underSectionId.toString())
            if (content) {
                const htmlContent = content.content.find(item => item.page === Number(page))
                if (htmlContent) {
                    const result = { subsectionId: subsectionId, underSectionId: underSectionId, content: htmlContent.content, page: page, totalPage: content.content.length, bookMark: false }
                    if (profile.bookMarks.length) {
                        const profileResult = profile.bookMarks.find(itemEntry => itemEntry.sectionId === underSectionId.toString())
                        if (profileResult) {
                            result.bookMark = true
                        }
                    }
                    return sendResponse(res, true, 200, 'Section  available.', result);
                } else {

                    return sendResponse(res, true, 200, 'Section not available.', { content: "", page: 1, totalpage: 1 });
                }
            } else {
                return sendResponse(res, true, 200, 'Section not available.', { content: "", page: 1, totalpage: 1 });
            }
        } else {
            return sendResponse(res, true, 200, 'Section not available.', { content: "", page: 1, totalpage: 1 });
        }
    } catch (error) {
        errorHandler(error, res);
    }
}
const getAct = async (req, res) => {
    try {
        const actData = { content: "<h1>helllllllllllllllllllllllllllllllllo</h1>", page: 1, totaPage: 1 }
        return sendResponse(res, true, 200, 'Section not available.', actData);
    } catch (error) {
        errorHandler(error, res);
    }
}
const getSectionContent = async (req, res) => {
    try {
        const { params: { chapterId, sectionId, page }, query: { type }, profile, userId } = req;
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(chapterId) || !mongoose.Types.ObjectId.isValid(sectionId)) {
            return sendResponse(res, false, 400, 'Invalid Chapter ID or Section ID.');
        }

        console.log("[DEBUG] getSectionContent Params:", { chapterId, sectionId, page, type });
        let oldCase = {
            content: "not content available",
            bookMark: false,
            title: "",
            chapterId: chapterId,
            sectionId: sectionId,
            name: " ",
            bookName: ""
        }, newCase = {
            content: "not content available",
            bookMark: false,
            title: "",
            name: " ",
            chapterId: chapterId,
            sectionId: sectionId,
            bookName: ""
        }, checkOldVersion = null, newVersion = null;

        const checkCategory = await casebookService.getCasebookPopulate({ _id: chapterId });
        console.log("[DEBUG] getSectionContent checkCategory found:", checkCategory ? { _id: checkCategory._id, name: checkCategory.name, sectionsCount: checkCategory.section?.length } : "null");
        if (checkCategory) {
                const content = checkCategory.section.find(item => 
                    item._id.toString() === sectionId.toString() ||
                    (item.sectionId && item.sectionId.toString() === sectionId.toString())
                );
                console.log("[DEBUG] getSectionContent content found:", content ? { _id: content._id, name: content.name, sectionId: content.sectionId } : "null");
                if (content) {
                    let formattedText = "No content available";
                    if (Array.isArray(content.content) && content.content.length > 0) {
                        const parts = content.content.map(item => typeof item === 'string' ? item : item?.content).filter(Boolean);
                        if (parts.length > 0) {
                            formattedText = parts.join("\n\n");
                        }
                    } else if (typeof content.content === 'string' && content.content.trim()) {
                        formattedText = content.content;
                    }

                    oldCase = {
                        content: formattedText,
                        title: content.keyword || "",
                        bookMark: false,
                        chapterId: chapterId,
                        sectionId: content._id ? content._id.toString() : sectionId,
                        oldversion: content.oldversion ? content.oldversion : 0,
                        name: content.name,
                        bookName: checkCategory?.categoryId?.name
                    }
                    if (profile.bookMarks.length) {
                        const profileResult = profile.bookMarks.find(itemEntry => itemEntry.sectionId === content._id.toString())
                        if (profileResult) {
                            oldCase.bookMark = true
                        }
                    }
                    if (type) {
                        if (!content.sectionId) {
                            checkOldVersion = await casebookService.getCasebookPopulate({ 'section.oldversion': content.name, categoryId: { $in: [checkCategory?.categoryId?._id?.toString(), checkCategory?.categoryId?.parentId?.toString()] } });
                        } else {
                            checkOldVersion = await casebookService.getCasebookPopulate({ 'section._id': content.sectionId });
                        }
                        if (checkOldVersion) {
                            newVersion = !content.sectionId 
                                ? checkOldVersion.section.find(item => item.oldversion && content.name.toString() === item.oldversion.toString()) 
                                : checkOldVersion.section.find(item => item._id && item._id.toString() === content.sectionId.toString());
                            
                            if (newVersion) {
                                newCase = {
                                    content: newVersion.content ? newVersion.content.map(item => item.content).toString() : "No content available",
                                    title: newVersion.keyword || "",
                                    bookMark: false,
                                    chapterId: checkOldVersion._id,
                                    sectionId: newVersion._id,
                                    oldversion: newVersion.oldversion ? newVersion.oldversion : 0,
                                    name: newVersion.name || "",
                                    bookName: checkOldVersion?.categoryId?.name || ""
                                };
                                if (profile.bookMarks.length) {
                                    const profileResult = profile.bookMarks.find(itemEntry => itemEntry.sectionId === newVersion._id.toString());
                                    if (profileResult) {
                                        newCase.bookMark = true;
                                    }
                                }
                            }
                        }
                        let finalOld = oldCase;
                        let finalNew = newCase;

                        if (checkCategory?.categoryId?.type === 'new') {
                            finalNew = oldCase;
                            finalOld = newCase;
                        } else if (checkCategory?.categoryId?.type === 'old') {
                            finalNew = newCase;
                            finalOld = oldCase;
                        }

                        // Fallback handling if one side is missing or has placeholder text
                        if (oldCase.title && !newCase.title) {
                            finalOld = oldCase;
                            finalNew = newCase;
                        }
                        if (newCase.title && !oldCase.title) {
                            finalOld = newCase;
                            finalNew = oldCase;
                        }

                        const response = {
                            old: finalOld,
                            new: finalNew
                        };
                        await addHistory({ userId: userId, chapterId: chapterId, sectionId: sectionId })
                        return sendResponse(res, true, 200, 'Section  available.', response);
                    } else {
                        const finalContent = content.content.find(item => item.page === Number(page))
                        if (finalContent) {
                            finalContent.bookMark = false
                            if (profile.bookMarks.length) {
                                const profileResult = profile.bookMarks.find(itemEntry => itemEntry.sectionId === content._id.toString())
                                if (profileResult) {
                                    finalContent.bookMark = true
                                }
                            }
                            finalContent.totalPage = content.content.length
                            finalContent.title = content.keyword
                            finalContent.bookName = checkCategory?.categoryId?.name

                            return sendResponse(res, true, 200, 'Section  available.', finalContent);
                        } else {

                            return sendResponse(res, true, 200, 'Section not available.', { content: "No content available", bookName: "", page: 1, totalPage: 1 });
                        }
                    }
                } else {

                    return sendResponse(res, true, 200, 'Section not available.', { content: "No content available", bookName: "", page: 1, totalPage: 1 });
                }
            } else {

                return sendResponse(res, true, 200, 'Section not available.', { content: "No content available", bookName: "", page: 1, totalPage: 1 });
            }
        } else {

            return sendResponse(res, true, 200, 'Section not available.', { content: "No content available", bookName: "", page: 1, totalPage: 1 });
        }
    } catch (error) {
        errorHandler(error, res);
    }
}

const sharePdf = async (req, res) => {
    try {
        const { params: { chapterId, sectionId, page }, profile } = req;
        const checkCategory = await casebookService.getCasebook({ _id: chapterId });
        if (!checkCategory) {
            return sendResponse(res, true, 200, 'Section not available.', { content: "No content available", page: 1, totalPage: 1 });
        }
        if (!checkCategory.section.length) {
            return sendResponse(res, true, 200, 'Section not available.', { content: "No content available", page: 1, totalPage: 1 });
        }
        const content = checkCategory.section.find(item => item._id.toString() === sectionId.toString());
        if (!content) {
            return sendResponse(res, true, 200, 'Section not available.', { content: "No content available", page: 1, totalPage: 1 });
        }
        await generatePDF(content.content, `./public/${content.name}.pdf`, `Chapter: ${checkCategory.name} `, `Section:${content.name} `, `Title:${content.keyword}`);
        res.download(`./public/${content.name}.pdf`, (err) => {
            if (err) {
                res.send('Try again .')
            } else {
                fs.unlinkSync(`./public/${content.name}.pdf`, (err) => {
                    if (err) {
                        res.send('Try again .')
                    } else {
                        res.end();
                        console.log("file deleted");
                    }
                });
            }
        });
    } catch (error) {
        errorHandler(error, res);
    }
};

const importCaseBook = async (req, res) => {
    try {
        const { query: { type, oldId }, params: { id } } = req;
        const filePath = path.join(__dirname, req.file.path);
        const bulkData = []
        let cases
        const data = await readFile(req.file.path);
        if (data.length) {
            if (type === 'old') {
                for (const section of data) {
                    const sections = section.data.map((item) => {
                        return {
                            name: item.section, keyword: item.title, content: [{
                                content: item.content, page: 1
                            }]
                        }
                    })
                    bulkData.push({
                        categoryId: id,
                        name: section.sheetName,
                        section: sections

                    })
                }
            }
            if (type === 'new') {

                cases = await casebookService.getSectionsByBook(oldId)
                console.log(cases[0])
                for (const section of data) {
                    const sections = section.data.map((item) => {
                        if (item.oldversion) {
                            const result = cases.find(itemSec => itemSec.name === item.oldversion.toString())
                            if (result) {
                                return {
                                    name: item.section, keyword: item.title, content: [{
                                        content: item.content, page: 1
                                    }],
                                    oldversion: item.oldversion,
                                    sectionId: result._id
                                }
                            } else {
                                return {
                                    name: item.section, keyword: item.title, content: [{
                                        content: item.content, page: 1
                                    }]
                                }
                            }

                        } else {
                            return {
                                name: item.section, keyword: item.title, content: [{
                                    content: item.content, page: 1
                                }]
                            }
                        }
                    })
                    console.log(sections.length, "count")
                    if (sections.length) {
                        bulkData.push({
                            categoryId: id,
                            name: section.sheetName,
                            section: sections
                        })
                    }

                }
            }
            const x = await casebookService.bulkCreate(bulkData)
            return sendResponse(res, true, 200, 'Section not available.', bulkData);
        }
    } catch (error) {
        errorHandler(error, res);
    }
}
const importJson = async (req, res) => {
    try {
        const { params: { categoryId }, query: { oldCategoryId }, body: { chapters } } = req;
        if (!categoryId || !chapters || !chapters.length) {
            return sendResponse(res, false, 400, 'Category ID and chapters array are required.');
        }

        let oldSections = [];
        if (oldCategoryId) {
            oldSections = await casebookService.getSectionsByBook(oldCategoryId);
        }

        const bulkData = [];
        for (const chapter of chapters) {
            const sections = chapter.sections.map((sec) => {
                let mappedSectionId = undefined;
                if (sec.oldversion && oldSections.length) {
                    const matched = oldSections.find(itemSec => itemSec.name === String(sec.oldversion).trim());
                    if (matched) {
                        mappedSectionId = matched._id;
                    }
                }

                return {
                    name: String(sec.section).trim(),
                    keyword: sec.title || "Section Detail",
                    content: [{
                        content: sec.content || "No content available",
                        page: 1
                    }],
                    oldversion: sec.oldversion ? String(sec.oldversion).trim() : undefined,
                    sectionId: mappedSectionId
                };
            });

            bulkData.push({
                categoryId: categoryId,
                name: chapter.chapterName || "CHAPTER DETAIL",
                section: sections
            });
        }

        const result = await casebookService.bulkCreate(bulkData);
        return sendResponse(res, true, 200, 'Chapters and sections imported successfully.', result);
    } catch (error) {
        errorHandler(error, res);
    }
};

const getComparisonTable = async (req, res) => {
    try {
        const { params: { categoryId } } = req;
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return sendResponse(res, false, 400, 'Invalid Category ID.');
        }
        const sections = await casebookService.getSectionsByBook(categoryId);
        return sendResponse(res, true, 200, 'Sections for comparison retrieved successfully.', sections);
    } catch (error) {
        errorHandler(error, res);
    }
};

module.exports = {
    addSsn,
    addSection,
    getcases,
    addSubSection,
    addUnderSection,
    addContent,
    addSectionContent,
    caseFilter,
    getSections,
    getSubSections,
    getUndersections,
    getContent,
    getAct,
    getSectionContent,
    sharePdf,
    importCaseBook,
    importJson,
    getComparisonTable
};
