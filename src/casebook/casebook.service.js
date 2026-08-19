const Casebook = require('../models/casebookmaster');
const CaseChild = require('../models/casechilds')
const { createDocument, getDocument, updateDocument } = require("../../services/common_services");
const { groupByCategoryType } = require('../../utils/common_functions');
const mongoose = require("mongoose")

const addCasebook = async (data) => {
    const category = await createDocument(Casebook, data);
    return category;
};
const getCasebook = async (options) => {
    const category = await getDocument(Casebook, options);
    return category;
};

const getCasebookPopulate = async (options) => {
    const category = await Casebook.findOne(options).populate('categoryId', { name: 1, parentId: 1, type: 1 }).lean()
    return category;
};
const getCasebooks = async () => {
    const category = await Casebook.find().sort({ type: -1 }).lean();
    return category;
};
const updateCasebooks = async (options, data) => {
    return await updateDocument(Casebook, options, data)
}
const addSubsection = async (data) => {
    const category = await createDocument(CaseChild, data);
    return category;
}

const getSubsection = async (options, projection) => {
    const category = await getDocument(CaseChild, options, projection);
    return category;
};
const addUndersection = async (options, data) => {
    const category = await updateDocument(CaseChild, options, data);
    return category;
}

const getChilds = async (options, projection) => {
    const category = await CaseChild.find(options).select(projection ? projection : {}).lean();
    return category;
};
const getFilters = async (options, search) => {
    const response = { chapter: [], redirection: "chapter" }
    let convertedData = []
    let category = []
    const checkSearch = /^(\d+)\s[a-zA-Z]$/.test(search)
    const searchOptions = [
        { name: { $regex: search, $options: 'i' } },
        { "section.name": { $regex: search, $options: 'i' } },
        { "section.keyword": { $regex: search, $options: 'i' } },
        { "section.oldversion": { $regex: search, $options: 'i' } }
    ]
    if (!search) {

        category = await Casebook.find({ categoryId: { $in: options.categoryId } }).select({ name: 1 }).sort({_id:1}).lean();
    } else {
        category = await Casebook.aggregate([
            // { $match: { categoryId:"6657528684091c0faa66efd6" } },
            { $unwind: "$section" },
            {
                $match: {
                    $or: [
                        { "section.name": { $regex: search, $options: 'i' } },
                        { "section.keyword": { $regex: search, $options: 'i' } },
                        { "section.oldversion": { $regex: search, $options: 'i' } }]
                }
            },
            {
                $project: {
                    sectionId: "$section._id",
                    name: "$section.name",
                    title: "$section.keyword",
                    // type: "$section.oldversion",
                    type: {
                        $cond: {
                            if: { $eq: [{ $ifNull: ["$section.oldversion", null] }, null] },
                            then: "old",
                            else: "new"
                        }
                    },
                    categoryId: 1
                }
            }
        ])
        if (options && options.categoryId && options.categoryId.length)
            category = category.filter((item) => {
                return options.categoryId.includes(item.categoryId.toString())
            })
    }
    return category;
}
const getBookMarks = async (section) => {
    const sectionIds = section.map(item => item.sectionId)
    let category = await Casebook.find({ _id: { $in: section.map(item => item.chapterId) } }).select({ 'section._id': 1, 'section.name': 1, 'section.keyword': 1, 'section.chapterId': "$_id" }).lean()
    category = category.map(item => item.section).flat()
    category = category.filter(item => {
        if (sectionIds.includes(item._id.toString())) {
            item.title = item.keyword
            return item;
        }
    })
    return category
}
const bulkCreate = async (data) => {
    const result = await Casebook.insertMany(data);
    return result;
}

const naturalSortSections = (a, b) => {
    const parseSec = (str) => {
        if (!str) return { num: 99999, sub: '' };
        const match = String(str).trim().match(/^(\d+)(.*)$/);
        if (match) {
            return { num: parseInt(match[1], 10), sub: match[2].toLowerCase() };
        }
        return { num: 99999, sub: String(str).toLowerCase() };
    };

    const parsedA = parseSec(a.name);
    const parsedB = parseSec(b.name);

    if (parsedA.num !== parsedB.num) {
        return parsedA.num - parsedB.num;
    }
    return parsedA.sub.localeCompare(parsedB.sub);
};

const PAIRS = [
    { oldId: '6657528684091c0faa66efd6', newId: '6657529c84091c0faa66efdf' }, // IPC <-> BNS
    { oldId: '6657528b84091c0faa66efd9', newId: '665752a184091c0faa66efe2' }, // CrPC <-> BNSS
    { oldId: '6657529084091c0faa66efdc', newId: '665752a784091c0faa66efe5' }  // IEA <-> BSA
];

const getSectionsByBook = async (data) => {
    const response = [];
    const sourceCatId = String(data);

    const pair = PAIRS.find(p => p.oldId === sourceCatId || p.newId === sourceCatId);
    let targetCatId = null;
    if (pair) {
        targetCatId = pair.oldId === sourceCatId ? pair.newId : pair.oldId;
    }

    const sourceChapters = await Casebook.find({ categoryId: sourceCatId }).populate('categoryId').lean();
    for (const res of sourceChapters) {
        for (const sec of (res.section || [])) {
            if (!sec.name || !String(sec.name).trim()) continue;
            response.push({
                _id: sec._id,
                name: sec.name,
                keyword: sec.keyword || '',
                oldversion: sec.oldversion || null,
                sectionId: sec.sectionId || sec._id,
                bookName: res.categoryId ? res.categoryId.name : '',
                chapterId: res._id
            });
        }
    }

    if (targetCatId) {
        const targetChapters = await Casebook.find({ categoryId: targetCatId }).lean();
        const targetMapByOldversion = new Map();
        const targetMapByName = new Map();

        for (const ch of targetChapters) {
            for (const sec of (ch.section || [])) {
                if (sec.oldversion) {
                    targetMapByOldversion.set(String(sec.oldversion).trim().toLowerCase(), sec);
                }
                if (sec.name) {
                    targetMapByName.set(String(sec.name).trim().toLowerCase(), sec);
                }
            }
        }

        for (const sec of response) {
            const secNameLower = String(sec.name).trim().toLowerCase();
            
            const matchByOld = targetMapByOldversion.get(secNameLower);
            if (matchByOld) {
                sec.oldversion = matchByOld.name;
            } else if (!sec.oldversion) {
                const matchByName = targetMapByName.get(secNameLower);
                if (matchByName && (matchByName.oldversion === sec.name || matchByName.name === sec.name)) {
                    sec.oldversion = matchByName.name;
                }
            }
        }
    }

    response.sort(naturalSortSections);
    return response;
};
module.exports = {
    getChilds,
    addCasebook,
    getCasebook,
    getCasebooks,
    updateCasebooks,
    addSubsection,
    addUndersection,
    getSubsection,
    getFilters,
    getBookMarks,
    bulkCreate,
    getSectionsByBook,
    getCasebookPopulate
};
