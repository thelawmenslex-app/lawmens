const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
require('dotenv').config();

const Casebook = require('../src/models/casebookmaster');
const Category = require('../src/models/category');

const MONGO_URI = process.env.DBURL || "mongodb+srv://thelawmenslex_db_user:Lawmens%40lex@cluster0.ddwnq8e.mongodb.net/lawapp?retryWrites=true&w=majority&appName=Cluster0";

// Natural section sorting helper
function naturalSortSections(a, b) {
    const parseSec = (str) => {
        if (!str) return { num: 0, sub: '' };
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
}

// Category Mappings
const PAIRS = [
    {
        oldId: '6657528684091c0faa66efd6', // IPC
        newId: '6657529c84091c0faa66efdf', // BNS
        name: 'IPC <-> BNS'
    },
    {
        oldId: '6657528b84091c0faa66efd9', // CrPC
        newId: '665752a184091c0faa66efe2', // BNSS
        name: 'CrPC <-> BNSS'
    },
    {
        oldId: '6657529084091c0faa66efdc', // IEA
        newId: '665752a784091c0faa66efe5', // BSA
        name: 'IEA <-> BSA'
    }
];

async function test() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB.");

        for (const pair of PAIRS) {
            console.log(`\n=================== Testing Pair: ${pair.name} ===================`);
            
            // Load all chapters & sections for old law
            const oldChapters = await Casebook.find({ categoryId: pair.oldId }).populate('categoryId').lean();
            const newChapters = await Casebook.find({ categoryId: pair.newId }).populate('categoryId').lean();

            let oldSections = [];
            for (const ch of oldChapters) {
                for (const sec of (ch.section || [])) {
                    oldSections.push({
                        _id: sec._id,
                        name: sec.name,
                        keyword: sec.keyword,
                        oldversion: sec.oldversion || null,
                        sectionId: sec.sectionId || sec._id,
                        bookName: ch.categoryId ? ch.categoryId.name : '',
                        chapterId: ch._id
                    });
                }
            }

            let newSectionsMapByOldversion = new Map();
            let newSectionsMapByName = new Map();

            for (const ch of newChapters) {
                for (const sec of (ch.section || [])) {
                    if (sec.oldversion) {
                        const cleanOld = String(sec.oldversion).trim().toLowerCase();
                        newSectionsMapByOldversion.set(cleanOld, sec);
                    }
                    if (sec.name) {
                        const cleanName = String(sec.name).trim().toLowerCase();
                        newSectionsMapByName.set(cleanName, sec);
                    }
                }
            }

            // Map corresponding section for each old law section
            let matchedCount = 0;
            for (const sec of oldSections) {
                const secNameLower = String(sec.name).trim().toLowerCase();
                
                // Check if new law section lists this old section as its oldversion
                const matchedNewSec = newSectionsMapByOldversion.get(secNameLower);
                if (matchedNewSec) {
                    sec.oldversion = matchedNewSec.name;
                    matchedCount++;
                } else if (!sec.oldversion) {
                    // Check direct section number match
                    const directMatch = newSectionsMapByName.get(secNameLower);
                    if (directMatch && directMatch.oldversion === sec.name) {
                        sec.oldversion = directMatch.name;
                        matchedCount++;
                    }
                } else if (sec.oldversion) {
                    matchedCount++;
                }
            }

            // Sort sections in natural numerical order
            oldSections.sort(naturalSortSections);

            console.log(`Total sections in source law: ${oldSections.length}`);
            console.log(`Successfully mapped corresponding sections count: ${matchedCount}`);
            console.log("Sample mapped results (first 10):", JSON.stringify(oldSections.slice(0, 10).map(s => ({
                name: s.name,
                keyword: s.keyword ? s.keyword.substring(0, 35) : '',
                mappedNewSec: s.oldversion
            })), null, 2));
        }

        mongoose.connection.close();
    } catch (e) {
        console.error(e);
    }
}

test();
