const mongoose = require('mongoose');
const adminController = require('../src/modules/admin/admin.controller');

const DBURL = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

async function run() {
    try {
        await mongoose.connect(DBURL);
        console.log("Connected to MongoDB!");
        
        const req = {
            params: { categoryId: '6657528684091c0faa66efd6' },
            userId: '6657528684091c0faa66efd6' // dummy
        };
        
        const res = {
            status: function(code) {
                this.statusCode = code;
                return {
                    json: (data) => {
                        console.log("Response Code:", this.statusCode);
                        console.log("Response Status:", data.status);
                        console.log("Response Message:", data.message);
                        console.log("Number of chapters:", data.data?.extractedJson?.chapters?.length);
                        if (data.data?.extractedJson?.chapters?.length > 0) {
                            console.log("First Chapter Details:", {
                                chapterNo: data.data.extractedJson.chapters[0].chapterNo,
                                chapterTitle: data.data.extractedJson.chapters[0].chapterTitle,
                                sectionsCount: data.data.extractedJson.chapters[0].sections?.length
                            });
                            if (data.data.extractedJson.chapters[0].sections?.length > 0) {
                                console.log("First Section Preview:", data.data.extractedJson.chapters[0].sections[0]);
                            }
                        }
                    }
                };
            }
        };
        
        await adminController.exportCategoryContent(req, res);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
