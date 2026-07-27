const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const { MongoClient } = require('mongodb');

const sourceUri = 'mongodb+srv://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@cluster0.u5bqmpo.mongodb.net/lawapp?retryWrites=true&w=majority&appName=Cluster0&compressors=zlib';
const targetUri = 'mongodb+srv://thelawmenslex_db_user:Lawmens%40lex@cluster0.ddwnq8e.mongodb.net/lawapp?retryWrites=true&w=majority&appName=Cluster0';

async function migrate() {
    const sourceClient = new MongoClient(sourceUri);
    const targetClient = new MongoClient(targetUri);

    try {
        await sourceClient.connect();
        await targetClient.connect();
        console.log("Connected to both source and target databases.");

        const sourceDb = sourceClient.db(); // Uses db name from URI connection pool
        const targetDb = targetClient.db();

        const collections = await sourceDb.listCollections().toArray();
        console.log(`Found ${collections.length} collections in source database.`);

        for (const colInfo of collections) {
            const colName = colInfo.name;
            if (colName.startsWith('system.')) continue;

            console.log(`\nMigrating collection: ${colName}...`);
            const documents = await sourceDb.collection(colName).find().toArray();
            console.log(`Found ${documents.length} documents in source ${colName}.`);

            if (documents.length > 0) {
                // Drop existing target collection to prevent unique constraint conflicts
                try {
                    await targetDb.collection(colName).drop();
                    console.log(`Dropped existing target collection: ${colName}`);
                } catch (e) {
                    // Ignore if target collection didn't exist
                }

                // Chunked bulk inserts to handle massive datasets gracefully
                const chunkSize = 500;
                for (let i = 0; i < documents.length; i += chunkSize) {
                    const chunk = documents.slice(i, i + chunkSize);
                    await targetDb.collection(colName).insertMany(chunk);
                }
                console.log(`Successfully imported ${documents.length} documents into target: ${colName}`);
            } else {
                console.log(`Collection ${colName} is empty. Skipping.`);
            }
        }

        console.log("\nMigration completed successfully!");
    } catch (e) {
        console.error("\nMigration failed:", e);
    } finally {
        await sourceClient.close();
        await targetClient.close();
        console.log("Connections closed.");
    }
}

migrate();
