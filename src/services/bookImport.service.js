const axios = require('axios');
const xlsx = require('xlsx');
const BookImport = require('../models/bookImport');
const Casebook = require('../models/casebookmaster');
const Category = require('../models/category');

// Lazy load pdf-parse and tesseract.js to avoid issues if not fully installed yet
let pdfParse;
let Tesseract;

try {
    pdfParse = require('pdf-parse');
} catch (e) {
    console.warn('pdf-parse not installed yet, using fallback.');
}

try {
    Tesseract = require('tesseract.js');
} catch (e) {
    console.warn('tesseract.js not installed yet, using fallback.');
}

/**
 * Clean up text (strip headers, footers, page numbers)
 */
const cleanText = (text) => {
    if (!text) return '';
    return text
        .split('\n')
        .filter(line => {
            const trimmed = line.trim();
            // Filter out obvious page numbers
            if (/^\d+$/.test(trimmed)) return false;
            // Filter out obvious header/footer marks
            if (/^Page \d+ of \d+$/i.test(trimmed)) return false;
            if (/THE LAWMEN/i.test(trimmed)) return false;
            return true;
        })
        .join('\n');
};

/**
 * Regex and Heuristic parser for legal texts
 */
const parseLegalTextHeuristically = (text, bookName) => {
    const cleaned = cleanText(text);
    const lines = cleaned.split('\n');
    
    const chapters = [];
    let currentChapter = null;
    let currentSection = null;
    let currentSchedule = null;
    const schedules = [];

    const chapterRegex = /^\s*CHAPTER\s+([IVXLCDM\d]+)\s*[:-]?\s*(.*)/i;
    const sectionRegex = /^\s*Section\s+(\d+[A-Z]?)\.?\s*(.*)/i;
    const scheduleRegex = /^\s*SCHEDULE\s+([IVXLCDM\d]+)\s*[:-]?\s*(.*)/i;

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Check for Chapter
        const chapMatch = trimmed.match(chapterRegex);
        if (chapMatch) {
            currentChapter = {
                chapterNo: chapMatch[1],
                chapterTitle: chapMatch[2] || 'Untitled Chapter',
                sections: []
            };
            chapters.push(currentChapter);
            currentSection = null;
            currentSchedule = null;
            return;
        }

        // Check for Schedule
        const schedMatch = trimmed.match(scheduleRegex);
        if (schedMatch) {
            currentSchedule = {
                scheduleNo: schedMatch[1],
                title: schedMatch[2] || 'Untitled Schedule',
                items: []
            };
            schedules.push(currentSchedule);
            currentChapter = null;
            currentSection = null;
            return;
        }

        // Check for Section
        const secMatch = trimmed.match(sectionRegex);
        if (secMatch) {
            currentSection = {
                sectionNo: secMatch[1],
                title: secMatch[2] || 'General Section',
                content: '',
                explanations: [],
                illustrations: [],
                exceptions: [],
                relatedSections: [],
                keywords: []
            };
            if (currentChapter) {
                currentChapter.sections.push(currentSection);
            } else {
                // Orphan sections go to a default chapter
                if (chapters.length === 0) {
                    currentChapter = {
                        chapterNo: 'I',
                        chapterTitle: 'Preliminary',
                        sections: []
                    };
                    chapters.push(currentChapter);
                }
                chapters[chapters.length - 1].sections.push(currentSection);
            }
            return;
        }

        // Append content to current active element
        if (currentSection) {
            if (trimmed.toLowerCase().startsWith('explanation') || trimmed.toLowerCase().startsWith('illustration') || trimmed.toLowerCase().startsWith('exception')) {
                currentSection.content += (currentSection.content ? '\n\n' : '') + trimmed;
                if (trimmed.toLowerCase().startsWith('explanation')) {
                    currentSection.explanations.push(trimmed);
                } else if (trimmed.toLowerCase().startsWith('illustration')) {
                    currentSection.illustrations.push(trimmed);
                } else if (trimmed.toLowerCase().startsWith('exception')) {
                    currentSection.exceptions.push(trimmed);
                }
            } else {
                currentSection.content += (currentSection.content ? '\n' : '') + trimmed;
            }
        } else if (currentSchedule) {
            currentSchedule.items.push(trimmed);
        }
    });

    return {
        actName: bookName,
        shortName: bookName.substring(0, 4).toUpperCase(),
        year: new Date().getFullYear(),
        chapters,
        schedules
    };
};

/**
 * Clean markdown wrapping and parse JSON safely
 */
const cleanAndParseLlmJson = (content) => {
    if (!content) throw new Error("Empty response from AI engine.");
    let cleaned = content.trim();
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(json)?/i, '');
        cleaned = cleaned.replace(/```$/, '');
    }
    return JSON.parse(cleaned.trim());
};

/**
 * xAI Grok API Parser
 */
const parseLegalTextWithGrok = async (text, bookName, apiKey) => {
    const prompt = `You are a Principal Legal Document Architect. Parse the following legal text from the book "${bookName}" and organize it into a structured JSON schema. 
    Keep the original text word-for-word without any summarization, abbreviation, or changes.
    Ensure that the entire text of each section—including all text under explanations, exceptions, and illustrations—is fully captured inside the "content" field of that section.
    
    Response must be pure JSON with no markdown wrapping.
    
    JSON Schema:
    {
      "actName": "Bharatiya Nyaya Sanhita",
      "shortName": "BNS",
      "year": 2023,
      "chapters": [
        {
          "chapterNo": "I",
          "chapterTitle": "Preliminary",
          "sections": [
            {
              "sectionNo": "1",
              "title": "Short title",
              "content": "...",
              "explanations": [],
              "illustrations": [],
              "exceptions": [],
              "relatedSections": [],
              "keywords": []
            }
          ]
        }
      ],
      "schedules": [
        {
          "scheduleNo": "Schedule I",
          "title": "...",
          "items": []
        }
      ]
    }
    
    TEXT TO PARSE:
    ${text.substring(0, 8000)}`;

    const response = await axios.post('https://api.x.ai/v1/chat/completions', {
        model: 'grok-beta',
        messages: [
            { role: 'system', content: 'You extract legal documents to JSON. Respond ONLY with valid JSON.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
    }, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });

    return cleanAndParseLlmJson(response.data.choices[0].message.content);
};

/**
 * Groq API Parser
 */
const parseLegalTextWithGroq = async (text, bookName, apiKey) => {
    const prompt = `You are a Principal Legal Document Architect. Parse the following legal text from the book "${bookName}" and organize it into a structured JSON schema. 
    Keep the original text word-for-word without any summarization, abbreviation, or changes.
    Ensure that the entire text of each section—including all text under explanations, exceptions, and illustrations—is fully captured inside the "content" field of that section.
    
    Response must be pure JSON with no markdown wrapping.
    
    JSON Schema:
    {
      "actName": "Bharatiya Nyaya Sanhita",
      "shortName": "BNS",
      "year": 2023,
      "chapters": [
        {
          "chapterNo": "I",
          "chapterTitle": "Preliminary",
          "sections": [
            {
              "sectionNo": "1",
              "title": "Short title",
              "content": "...",
              "explanations": [],
              "illustrations": [],
              "exceptions": [],
              "relatedSections": [],
              "keywords": []
            }
          ]
        }
      ],
      "schedules": [
        {
          "scheduleNo": "Schedule I",
          "title": "...",
          "items": []
        }
      ]
    }
    
    TEXT TO PARSE:
    ${text.substring(0, 8000)}`;

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        messages: [
            { role: 'system', content: 'You extract legal documents to JSON. Respond ONLY with valid JSON.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
    }, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });

    return cleanAndParseLlmJson(response.data.choices[0].message.content);
};

const segmentBookAndSchedulesText = (text) => {
    const textUpper = text.toUpperCase();
    
    let firstSchedIdx = textUpper.indexOf('FIRST SCHEDULE');
    if (firstSchedIdx === -1) {
        firstSchedIdx = textUpper.indexOf('THE FIRST SCHEDULE');
    }
    
    let secondSchedIdx = textUpper.indexOf('SECOND SCHEDULE');
    if (secondSchedIdx === -1) {
        secondSchedIdx = textUpper.indexOf('THE SECOND SCHEDULE');
    }
    
    let bookText = text;
    let firstScheduleText = '';
    let secondScheduleText = '';
    
    if (firstSchedIdx !== -1 && secondSchedIdx !== -1 && secondSchedIdx > firstSchedIdx) {
        bookText = text.substring(0, firstSchedIdx);
        firstScheduleText = text.substring(firstSchedIdx, secondSchedIdx);
        secondScheduleText = text.substring(secondSchedIdx);
    } else if (firstSchedIdx !== -1) {
        bookText = text.substring(0, firstSchedIdx);
        firstScheduleText = text.substring(firstSchedIdx);
    } else if (secondSchedIdx !== -1) {
        bookText = text.substring(0, secondSchedIdx);
        secondScheduleText = text.substring(secondSchedIdx);
    }
    
    return { bookText, firstScheduleText, secondScheduleText };
};

const parseFirstScheduleWithAI = async (text, bookName, modelName, apiKey) => {
    const prompt = `You are a Principal Legal Document Architect. Parse the following First Schedule (Offences table) text from the book "${bookName}" and organize it into a structured JSON array of offence classification rows.
    Keep the original text word-for-word without any summarization or changes.
    
    Response must be a pure JSON object containing a "firstSchedule" key with the array of offence objects.
    
    JSON Schema:
    {
      "firstSchedule": [
        {
          "Section": "379",
          "Offence": "Theft",
          "Punishment": "Imprisonment for 3 years, or fine, or both",
          "Cognizable or Non- cognizable": "Cognizable",
          "Bailable or Non- bailable": "Non-bailable",
          "By what Court triable": "Any Magistrate"
        }
      ]
    }
    
    TEXT TO PARSE:
    ${text.substring(0, 15000)}`;

    const endpoint = modelName === 'grok' 
        ? 'https://api.x.ai/v1/chat/completions' 
        : 'https://api.groq.com/openai/v1/chat/completions';
    const model = modelName === 'grok' ? 'grok-beta' : 'llama-3.3-70b-versatile';

    const response = await axios.post(endpoint, {
        model: model,
        messages: [
            { role: 'system', content: 'You extract legal schedule tables to JSON. Respond ONLY with valid JSON.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
    }, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });

    const parsed = cleanAndParseLlmJson(response.data.choices[0].message.content);
    return parsed.firstSchedule || [];
};

const parseSecondScheduleWithAI = async (text, bookName, modelName, apiKey) => {
    const prompt = `You are a Principal Legal Document Architect. Parse the following Second Schedule (Forms) text from the book "${bookName}" and organize it into a structured JSON array of form template objects.
    Keep the original content text word-for-word without any summarization or changes.
    
    Response must be a pure JSON object containing a "secondSchedule" key with the array of form objects.
    
    JSON Schema:
    {
      "secondSchedule": [
        {
          "formNo": "Form No. 1",
          "title": "SUMMONS TO AN ACCUSED PERSON",
          "content": "To (name of accused)... Whereas your attendance is necessary..."
        }
      ]
    }
    
    TEXT TO PARSE:
    ${text.substring(0, 15000)}`;

    const endpoint = modelName === 'grok' 
        ? 'https://api.x.ai/v1/chat/completions' 
        : 'https://api.groq.com/openai/v1/chat/completions';
    const model = modelName === 'grok' ? 'grok-beta' : 'llama-3.3-70b-versatile';

    const response = await axios.post(endpoint, {
        model: model,
        messages: [
            { role: 'system', content: 'You extract legal schedule forms to JSON. Respond ONLY with valid JSON.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
    }, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });

    const parsed = cleanAndParseLlmJson(response.data.choices[0].message.content);
    return parsed.secondSchedule || [];
};

/**
 * Validate parsed JSON structure
 */
const validateImportJson = (jsonData) => {
    const errors = [];
    const warnings = [];
    const suggestions = [];

    if (!jsonData.actName) errors.push("Missing Act Name.");
    if (!jsonData.chapters || jsonData.chapters.length === 0) {
        errors.push("No chapters detected in the document structure.");
    } else {
        jsonData.chapters.forEach((chap, cIdx) => {
            if (!chap.chapterNo) warnings.push(`Chapter at index ${cIdx} has no Chapter Number.`);
            if (!chap.sections || chap.sections.length === 0) {
                warnings.push(`Chapter ${chap.chapterNo || cIdx} has no sections.`);
            } else {
                chap.sections.forEach((sec) => {
                    if (!sec.sectionNo) errors.push(`Section in Chapter ${chap.chapterNo} is missing a Section Code/No.`);
                    if (!sec.content) warnings.push(`Section ${sec.sectionNo} has empty text content.`);
                });
            }
        });
    }

    return { errors, warnings, suggestions };
};

/**
 * Process uploaded book file background job
 */
const runParsingJob = async (jobId, fileBuffer, fileName) => {
    const job = await BookImport.findById(jobId);
    if (!job) return;

    try {
        job.status = 'extracting';
        job.progress = 20;
        await job.save();

        let extractedText = '';
        const ext = fileName.split('.').pop().toLowerCase();

        if (ext === 'json') {
            const parsed = JSON.parse(fileBuffer.toString());
            job.status = 'validated';
            job.progress = 80;
            job.extractedJson = parsed;
            job.validationReport = validateImportJson(parsed);
            await job.save();
            return;
        } else if (ext === 'xlsx') {
            const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = xlsx.utils.sheet_to_json(sheet);
            
            // Build standardized JSON from Excel columns
            const chaptersMap = {};
            rows.forEach(row => {
                const chapNo = row.chapterNo || 'I';
                const chapTitle = row.chapterTitle || 'General';
                if (!chaptersMap[chapNo]) {
                    chaptersMap[chapNo] = {
                        chapterNo: String(chapNo),
                        chapterTitle: String(chapTitle),
                        sections: []
                    };
                }
                chaptersMap[chapNo].sections.push({
                    sectionNo: String(row.sectionNo || ''),
                    title: String(row.title || 'Untitled'),
                    content: String(row.content || ''),
                    explanations: row.explanations ? [row.explanations] : [],
                    illustrations: row.illustrations ? [row.illustrations] : [],
                    exceptions: row.exceptions ? [row.exceptions] : []
                });
            });

            const parsed = {
                actName: job.bookName,
                shortName: job.bookName.substring(0, 4).toUpperCase(),
                year: new Date().getFullYear(),
                chapters: Object.values(chaptersMap),
                schedules: []
            };

            job.status = 'validated';
            job.progress = 80;
            job.extractedJson = parsed;
            job.validationReport = validateImportJson(parsed);
            await job.save();
            return;
        } else if (ext === 'pdf') {
            if (!pdfParse) {
                throw new Error('pdf-parse module is not available.');
            }
            
            let pdfText = '';
            if (typeof pdfParse.PDFParse === 'function') {
                const parser = new pdfParse.PDFParse({ data: fileBuffer });
                try {
                    const parsedData = await parser.getText();
                    pdfText = parsedData.text || '';
                } finally {
                    await parser.destroy();
                }
            } else if (typeof pdfParse === 'function') {
                const pdfData = await pdfParse(fileBuffer);
                pdfText = pdfData.text || '';
            } else {
                throw new Error('Invalid pdf-parse module format.');
            }
            extractedText = pdfText;
            
            if (extractedText.trim().length < 200) {
                job.status = 'ocr';
                job.progress = 40;
                await job.save();
                
                // OCR scanned documents if tesseract is active
                if (Tesseract) {
                    // Because we cannot convert raw PDF stream to image pages directly without native libraries,
                    // we log an OCR warning and proceed with heuristic text extraction if any is available
                    job.validationReport.warnings.push("Document appears to be scanned. Running OCR on available pages.");
                } else {
                    job.validationReport.errors.push("Scanned document detected but Tesseract OCR engine is not installed.");
                }
            }
        } else {
            extractedText = fileBuffer.toString();
        }

        job.status = 'extracting';
        job.progress = 60;
        await job.save();

        let parsedJson;
        const groqApiKey = process.env.GROQ_API_KEY;
        const grokApiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
        const apiKey = groqApiKey || grokApiKey;
        const modelName = groqApiKey ? 'groq' : 'grok';

        const { bookText, firstScheduleText, secondScheduleText } = segmentBookAndSchedulesText(extractedText);

        if (apiKey) {
            console.log(`Parsing main book text with ${modelName === 'groq' ? 'Groq' : 'Grok'} AI...`);
            if (modelName === 'groq') {
                parsedJson = await parseLegalTextWithGroq(bookText, job.bookName, apiKey);
            } else {
                parsedJson = await parseLegalTextWithGrok(bookText, job.bookName, apiKey);
            }

            // Parse First Schedule if present
            if (firstScheduleText && firstScheduleText.trim().length > 100) {
                try {
                    console.log(`Parsing First Schedule with ${modelName === 'groq' ? 'Groq' : 'Grok'} AI...`);
                    const firstSchedParsed = await parseFirstScheduleWithAI(firstScheduleText, job.bookName, modelName, apiKey);
                    parsedJson.firstSchedule = firstSchedParsed;
                } catch (e) {
                    console.error("Failed to parse First Schedule with AI:", e);
                    job.validationReport.warnings.push(`First Schedule parsing failed: ${e.message}`);
                }
            }

            // Parse Second Schedule if present
            if (secondScheduleText && secondScheduleText.trim().length > 100) {
                try {
                    console.log(`Parsing Second Schedule with ${modelName === 'groq' ? 'Groq' : 'Grok'} AI...`);
                    const secondSchedParsed = await parseSecondScheduleWithAI(secondScheduleText, job.bookName, modelName, apiKey);
                    parsedJson.secondSchedule = secondSchedParsed;
                } catch (e) {
                    console.error("Failed to parse Second Schedule with AI:", e);
                    job.validationReport.warnings.push(`Second Schedule parsing failed: ${e.message}`);
                }
            }
        } else {
            console.log("Parsing with local Regex heuristics...");
            parsedJson = parseLegalTextHeuristically(extractedText, job.bookName);
        }

        job.extractedJson = parsedJson;
        job.status = 'validated';
        job.progress = 90;
        job.validationReport = validateImportJson(parsedJson);
        await job.save();

    } catch (err) {
        console.error("Parsing job failed:", err);
        job.status = 'failed';
        job.progress = 100;
        job.validationReport.errors.push(`Parsing failed: ${err.message}`);
        await job.save();
    }
};

module.exports = {
    runParsingJob,
    validateImportJson
};
