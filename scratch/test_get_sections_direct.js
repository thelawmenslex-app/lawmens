const mongoose = require('mongoose');
const casebookController = require('../src/casebook/casebook.controller');

const DBURL = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

async function run() {
    try {
        await mongoose.connect(DBURL);
        console.log("Connected to MongoDB!");
        
        // Find one casebook document to use its ID
        const Casebook = mongoose.model('Casebook', new mongoose.Schema({}, { strict: false }), 'casebooks');
        const doc = await Casebook.findOne().lean();
        if (!doc) {
            console.log("No casebook found to test with");
            process.exit(1);
        }
        
        console.log("Using casebook chapter ID:", doc._id);
        
        const req = {
            params: { snsId: doc._id.toString() },
            profile: {}
        };
        
        const res = {
            status: function(code) {
                this.statusCode = code;
                return {
                    json: (data) => {
                        console.log("Response Code:", this.statusCode);
                        console.log("Response Status:", data.status);
                        console.log("Response Message:", data.message);
                        console.log("Number of sections:", data.data?.length);
                        if (data.data?.length > 0) {
                            console.log("First Section Details:", data.data[0]);
                        }
                    }
                };
            }
        };
        
        await casebookController.getSections(req, res);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
