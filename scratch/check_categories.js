const mongoose = require('mongoose');
const Category = require('../src/models/category');

const dbUrl = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

mongoose.connect(dbUrl).then(async () => {
    console.log("Connected to MongoDB");
    const cats = await Category.find({});
    console.log("Categories found:", cats.map(c => ({ id: c._id, name: c.name, type: c.type })));
    mongoose.disconnect();
}).catch(err => {
    console.error(err);
});
