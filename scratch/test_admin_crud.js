const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const DB_URL = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

const adminController = require("../src/modules/admin/admin.controller");
const Category = require("../src/models/category");
const Casebook = require("../src/models/casebookmaster");

async function run() {
    try {
        await mongoose.connect(DB_URL);
        console.log("Connected.");

        // 1. Test Category creation, update, and deletion
        console.log("--- Testing Category CRUD ---");
        let catRes = null;
        const reqCreateCat = {
            body: { name: "Test Category CRUD", type: "new", act: "Test Act 2026" },
            userId: "6657527684091c0faa66efd1", // dummy admin ID
            ip: "127.0.0.1"
        };
        const resCreateCat = {
            status: function(code) { return this; },
            json: function(data) {
                console.log("Create Category Response:", data);
                if (data.status) catRes = data.data;
                return this;
            }
        };
        await adminController.createCategory(reqCreateCat, resCreateCat);

        if (catRes) {
            const reqUpdateCat = {
                params: { id: catRes._id },
                body: { name: "Test Category CRUD Updated" },
                userId: "6657527684091c0faa66efd1",
                ip: "127.0.0.1"
            };
            const resUpdateCat = {
                status: function(code) { return this; },
                json: function(data) {
                    console.log("Update Category Response:", data);
                    return this;
                }
            };
            await adminController.updateCategory(reqUpdateCat, resUpdateCat);

            // 2. Test Chapter creation under category
            console.log("--- Testing Chapter CRUD ---");
            let chapRes = null;
            const reqCreateChap = {
                body: { name: "Test Chapter CRUD", categoryId: catRes._id },
                userId: "6657527684091c0faa66efd1",
                ip: "127.0.0.1"
            };
            const resCreateChap = {
                status: function(code) { return this; },
                json: function(data) {
                    console.log("Create Chapter Response:", data);
                    if (data.status) chapRes = data.data;
                    return this;
                }
            };
            await adminController.createChapter(reqCreateChap, resCreateChap);

            if (chapRes) {
                const reqUpdateChap = {
                    params: { id: chapRes._id },
                    body: { name: "Test Chapter CRUD Updated" },
                    userId: "6657527684091c0faa66efd1",
                    ip: "127.0.0.1"
                };
                const resUpdateChap = {
                    status: function(code) { return this; },
                    json: function(data) {
                        console.log("Update Chapter Response:", data);
                        return this;
                    }
                };
                await adminController.updateChapter(reqUpdateChap, resUpdateChap);

                // 3. Test Section CRUD under chapter
                console.log("--- Testing Section CRUD ---");
                let secId = null;
                const reqCreateSec = {
                    body: {
                        chapterId: chapRes._id,
                        name: "999",
                        keyword: "Test Section Keyword",
                        oldversion: "123",
                        contentText: "Test Section Content text."
                    },
                    userId: "6657527684091c0faa66efd1",
                    ip: "127.0.0.1"
                };
                const resCreateSec = {
                    status: function(code) { return this; },
                    json: function(data) {
                        console.log("Create Section Response status:", data.status, "message:", data.message);
                        if (data.status && data.data && data.data.section) {
                            const found = data.data.section.find(s => s.name === "999");
                            if (found) secId = found._id;
                        }
                        return this;
                    }
                };
                await adminController.createSection(reqCreateSec, resCreateSec);

                if (secId) {
                    const reqUpdateSec = {
                        params: { chapterId: chapRes._id, sectionId: secId },
                        body: { name: "999A", keyword: "Test Section Keyword Updated", contentText: "Updated section content text." },
                        userId: "6657527684091c0faa66efd1",
                        ip: "127.0.0.1"
                    };
                    const resUpdateSec = {
                        status: function(code) { return this; },
                        json: function(data) {
                            console.log("Update Section Response status:", data.status, "message:", data.message);
                            return this;
                        }
                    };
                    await adminController.updateSection(reqUpdateSec, resUpdateSec);

                    const reqDeleteSec = {
                        params: { chapterId: chapRes._id, sectionId: secId },
                        userId: "6657527684091c0faa66efd1",
                        ip: "127.0.0.1"
                    };
                    const resDeleteSec = {
                        status: function(code) { return this; },
                        json: function(data) {
                            console.log("Delete Section Response status:", data.status, "message:", data.message);
                            return this;
                        }
                    };
                    await adminController.deleteSection(reqDeleteSec, resDeleteSec);
                }

                // Cleanup Chapter
                const reqDeleteChap = {
                    params: { id: chapRes._id },
                    userId: "6657527684091c0faa66efd1",
                    ip: "127.0.0.1"
                };
                const resDeleteChap = {
                    status: function(code) { return this; },
                    json: function(data) {
                        console.log("Delete Chapter Response:", data);
                        return this;
                    }
                };
                await adminController.deleteChapter(reqDeleteChap, resDeleteChap);
            }

            // Cleanup Category
            const reqDeleteCat = {
                params: { id: catRes._id },
                userId: "6657527684091c0faa66efd1",
                ip: "127.0.0.1"
            };
            const resDeleteCat = {
                status: function(code) { return this; },
                json: function(data) {
                    console.log("Delete Category Response:", data);
                    return this;
                }
            };
            await adminController.deleteCategory(reqDeleteCat, resDeleteCat);
        }

    } catch (e) {
        console.error("FAILED! Error is:", e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
