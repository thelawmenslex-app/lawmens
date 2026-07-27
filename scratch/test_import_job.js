const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const DB_URL = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

const BookImport = require("../src/models/bookImport");
const bookImportService = require("../src/services/bookImport.service");

async function run() {
    try {
        await mongoose.connect(DB_URL);
        console.log("Connected.");

        // 1. Create a dummy import job
        const job = await BookImport.create({
            bookName: "TEST LAW ACT 2026",
            categoryId: "6657528684091c0faa66efd6", // IPC ID
            originalFileName: "test_act.txt",
            status: "pending",
            progress: 10
        });

        console.log("Created import job:", job._id);

        // 2. Mock book text contents to parse
        const bookText = `
        THE TEST LAW ACT OF 2026
        
        CHAPTER I
        PRELIMINARY
        
        Section 1. Short title and commencement.
        This Act may be called the Test Law Act, 2026. It shall come into force immediately.
        Explanation. This is a preliminary explanation.
        Illustration. This is a basic illustration text.
        
        Section 2. Definitions.
        In this Act, unless the context otherwise requires:
        (a) "court" means the High Court;
        (b) "state" means the Government of Tamil Nadu.
        
        CHAPTER II
        OFFENCES AND PENALTIES
        
        Section 3. Punishment for violation.
        Whoever violates any provision of this Act shall be punished with imprisonment up to three years.
        Exception. This does not apply to accidental violations.
        
        SCHEDULE I
        LEGAL ENTRIES
        Item 1. Category A violations.
        Item 2. Category B violations.
        `;

        // 3. Trigger parser
        console.log("Parsing book text...");
        await bookImportService.runParsingJob(job._id, Buffer.from(bookText), "test_act.txt");

        // 4. Retrieve and verify job details
        const updatedJob = await BookImport.findById(job._id).lean();
        console.log("Job status after parsing:", updatedJob.status);
        console.log("Job progress after parsing:", updatedJob.progress);
        console.log("Validation errors:", updatedJob.validationReport.errors);
        console.log("Validation warnings:", updatedJob.validationReport.warnings);
        console.log("Extracted JSON details:", JSON.stringify(updatedJob.extractedJson, null, 2));

        // 5. Cleanup
        await BookImport.findByIdAndDelete(job._id);
        console.log("Cleaned up test job.");

    } catch (e) {
        console.error("FAILED! Error is:", e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
