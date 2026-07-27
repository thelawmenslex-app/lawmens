//comman functions ...
// create document
const createDocument = async (schema, data) => {
    const result = await schema.create(data);
    return result;
};
//update document
const updateDocument = async (schema, id, data) => {
    const result = await schema.findOneAndUpdate(id, data);
    return result;
};
// get document
const getDocument = async (schema, options,projection) => {
    const project=projection?projection:{}
    const result = await schema.findOne(options).select(project).lean();
    return result;
};

const getDocuments = async (schema, options) => {
    const result = await schema.find(options).lean();
    return result;
};
module.exports = {
    createDocument,
    getDocument,
    updateDocument,
    getDocuments
}