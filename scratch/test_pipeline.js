const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bookImportService = require('../src/services/bookImport.service');

const DBURL = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

async function test() {
    try {
        await mongoose.connect(DBURL);
        console.log("Connected to DB!");
        
        const BookImport = require('../src/models/bookImport');
        
        // Create mock job
        const job = await BookImport.create({
            bookName: "MOCK TEST ACT",
            categoryId: "6657528684091c0faa66efd6",
            originalFileName: "mock_doc.pdf",
            status: "pending",
            progress: 10,
            uploadedBy: "6657528684091c0faa66efd6" // mock
        });
        
        console.log("Mock Job created. ID:", job._id);
        
        const fileBuffer = fs.readFileSync(path.join(__dirname, "mock_doc.pdf"));
        await bookImportService.runParsingJob(job._id, fileBuffer, "mock_doc.pdf");
        
        // Fetch result
        const result = await BookImport.findById(job._id);
        console.log("Job status:", result.status);
        console.log("Job validation errors:", result.validationReport.errors);
        console.log("Job validation warnings:", result.validationReport.warnings);
        console.log("Job JSON chapters count:", result.extractedJson?.chapters?.length);
        console.log("Job JSON preview sections:", result.extractedJson?.chapters?.[0]?.sections);
        
        // Clean up mock job
        await BookImport.findByIdAndDelete(job._id);
        console.log("Mock Job cleaned up.");
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

test();
