const { createDocument, getDocument, updateDocument, getDocuments } = require("../../services/common_services");
const User = require("../models/user")
const Setting = require("../models/settings");
const Cms = require("../models/cms")
const createUser = async (data) => {
    return await createDocument(User, data)
}

const getUser = async (options) => {
    return await getDocument(User, options)
}

const updateUser = async (options, data) => {
    return await updateDocument(User, options, data)
}
const getUsers = async () => {
    return await getDocuments(User)
}

const getSettings = async () => {
    return await getDocument(Setting)
}
const getcms = async () => {
    return await getDocuments(Cms)
}
const getPlan=async(userId)=>{
    const plan=await User.findOne({_id:userId}).populate('subscriptionId');
    return plan
}
module.exports = {
    createUser,
    getUser,
    updateUser,
    getUsers,
    getSettings,
    getcms,
    getPlan,
    
}