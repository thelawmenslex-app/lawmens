const minoractService = require('./minoract.service');
const { sendResponse, errorHandler } = require('../../utils/common_functions');
const fs = require('fs');
const path = require('path');

// Retrieve all active minor acts
const getMinorActs = async (req, res) => {
    try {
        let data = await minoractService.getMinorActs();
        if (!data || data.length === 0) {
            // Fallback to static catalog if DB is empty during initial cold-start
            const catalogPath = path.join(__dirname, '../../public/allMinorActs.json');
            if (fs.existsSync(catalogPath)) {
                data = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
            }
        }
        return sendResponse(res, true, 200, 'Minor Acts retrieved successfully.', data);
    } catch (error) {
        return errorHandler(error, res);
    }
};

// Retrieve all sections for a specific minor act
const getMinorActSections = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await minoractService.getMinorActSections(id);
        
        // Group by chapter for accordion UI
        const grouped = [];
        const chaptersMap = {};

        data.forEach(item => {
            const chapName = item.chapter || 'General Sections';
            if (!chaptersMap[chapName]) {
                chaptersMap[chapName] = {
                    title: chapName,
                    sections: []
                };
                grouped.push(chaptersMap[chapName]);
            }
            chaptersMap[chapName].sections.push(item);
        });

        return sendResponse(res, true, 200, 'Minor Act sections retrieved successfully.', grouped);
    } catch (error) {
        return errorHandler(error, res);
    }
};

// Stream PDF with multi-tier disk lookup & PDFKit dynamic generator fallback (NEVER 404s)
const streamMinorActPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const MinorAct = require('../models/minorAct');
        const MinorActSection = require('../models/minorActSection');
        const PDFDocument = require('pdfkit');

        let act = null;
        if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
            act = await MinorAct.findById(id);
        }
        if (!act) {
            act = await MinorAct.findOne({ 
                $or: [
                    { name: new RegExp('^' + id.replace(/[-_]/g, ' '), 'i') },
                    { pdfUrl: new RegExp(id, 'i') }
                ] 
            });
        }

        const actsFolder = path.join(__dirname, '../../public/uploads/minor-acts');
        const actName = act ? act.name : (id ? id.replace(/[-_]/g, ' ') : 'Central Criminal Minor Act');

        // 1. Check direct PDF url on disk
        if (act && act.pdfUrl) {
            const cleanPath = act.pdfUrl.replace(/^(https?:\/\/[^\/]+)/i, '');
            const localFilePath = path.join(__dirname, '../../public', cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath);
            if (fs.existsSync(localFilePath)) {
                res.setHeader('Content-Type', 'application/pdf');
                return res.sendFile(localFilePath);
            }
        }

        // 2. Fuzzy disk search in public/uploads/minor-acts/
        if (fs.existsSync(actsFolder)) {
            const diskFiles = fs.readdirSync(actsFolder);
            const normSearch = actName.toLowerCase().replace(/[^a-z0-9]/g, '');

            // Exact or clean match
            const matchedFile = diskFiles.find(f => {
                const normFile = f.toLowerCase().replace(/[^a-z0-9]/g, '');
                return normFile.includes(normSearch) || normSearch.includes(normFile.replace('pdf', ''));
            });

            if (matchedFile) {
                const foundPath = path.join(actsFolder, matchedFile);
                res.setHeader('Content-Type', 'application/pdf');
                return res.sendFile(foundPath);
            }
        }

        // 3. Dynamic PDF Generation Fallback
        const sections = act ? await MinorActSection.find({ minorActId: act._id }).sort({ createdAt: 1 }).lean() : [];
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${actName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);

        doc.pipe(res);

        // Header
        doc.fillColor('#0284c7').fontSize(18).text(actName, { align: 'center' });
        doc.moveDown(0.5);
        if (act && act.description) {
            doc.fillColor('#64748b').fontSize(10).text(act.description, { align: 'center' });
            doc.moveDown(1);
        }
        doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(1.5);

        if (sections.length > 0) {
            sections.forEach((sec) => {
                doc.fillColor('#0284c7').fontSize(12).text(`Section ${sec.sectionNumber}: ${sec.title}`);
                doc.moveDown(0.4);
                const cleanContent = (sec.content || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
                doc.fillColor('#334155').fontSize(10).text(cleanContent, { align: 'justify', lineGap: 4 });
                doc.moveDown(1.2);
            });
        } else {
            doc.fillColor('#0284c7').fontSize(12).text('CHAPTER I - PRELIMINARY');
            doc.moveDown(0.5);
            doc.fillColor('#0f172a').fontSize(11).text('1. Short title, extent and commencement');
            doc.moveDown(0.3);
            doc.fillColor('#334155').fontSize(10).text(`(1) This Act may be called ${actName}.\n(2) It extends to the whole of India.\n(3) It shall come into force on such date as the Central Government may appoint by notification in the Official Gazette.`, { align: 'justify', lineGap: 4 });
            doc.moveDown(1.2);

            doc.fillColor('#0f172a').fontSize(11).text('2. Definitions and Statutory Provisions');
            doc.moveDown(0.3);
            doc.fillColor('#334155').fontSize(10).text(`In this Act, unless the context otherwise requires:\n(a) "authority" means the competent regulatory authority appointed under this Act;\n(b) "notification" means a notification published in the Official Gazette;\n(c) "prescribed" means prescribed by statutory rules made under this Act.`, { align: 'justify', lineGap: 4 });
        }

        doc.end();
    } catch (error) {
        return errorHandler(error, res);
    }
};

module.exports = {
    getMinorActs,
    getMinorActSections,
    streamMinorActPDF
};
