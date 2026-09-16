if (typeof global.SlowBuffer === 'undefined') {
    const { Buffer } = require('buffer');
    global.SlowBuffer = Buffer;
}

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const http = require('http');
const { initSocketServer } = require('./services/socketService');
const cors = require('cors');
require('dotenv').config();
const APP_STATE = process.env.NODE_ENV;
const helmet = require('helmet');
const { doConnect } = require("./config/dbConnect");
const passport = require('passport');
const path = require("path");
const { subscriptionCron } = require("./services/cronservices");
const { passportConfig: { jwtStrategy } } = require('./config');

const app = express();

// Trust reverse proxy for Render / Cloudflare / Load Balancers to support express-rate-limit
app.set('trust proxy', 1);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Static file directories with cross-origin access
app.use("/uploads", express.static(path.join(__dirname, 'public/uploads')));
app.use("/uploads", express.static(path.join(__dirname, 'uploads')));
app.use("/api/v1/uploads", express.static(path.join(__dirname, 'public/uploads')));
app.use("/api/v1/uploads", express.static(path.join(__dirname, 'uploads')));
app.use("/api/uploads", express.static(path.join(__dirname, 'public/uploads')));
app.use("/api/uploads", express.static(path.join(__dirname, 'uploads')));
app.use("/public", express.static(path.join(__dirname, 'public')));
app.use("/", express.static(path.join(__dirname, 'public')));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.options('*', cors());
app.use(cors());

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(
    helmet.contentSecurityPolicy({
        useDefaults: true,
        directives: {
            'img-src': ["'self'", 'https: data:'],
        },
    }),
);

// Dedicated Fallback PDF handler for Minor Acts to prevent 404s
const serveMinorActPdf = (req, res) => {
    try {
        const rawFilename = req.params[0] || req.params.filename || '';
        const decoded = decodeURIComponent(rawFilename).trim();
        const actsFolder = path.join(__dirname, 'public/uploads/minor-acts');
        const fs = require('fs');

        if (fs.existsSync(actsFolder)) {
            // 1. Exact match
            const exactPath = path.join(actsFolder, decoded);
            if (fs.existsSync(exactPath) && fs.statSync(exactPath).isFile()) {
                res.setHeader('Content-Type', 'application/pdf');
                return res.sendFile(exactPath);
            }

            // 2. Normalized match (ignoring case, spaces, symbols)
            const diskFiles = fs.readdirSync(actsFolder);
            const targetNorm = decoded.toLowerCase().replace(/[^a-z0-9]/g, '');

            const matched = diskFiles.find(f => {
                const fNorm = f.toLowerCase().replace(/[^a-z0-9]/g, '');
                return fNorm === targetNorm || fNorm.includes(targetNorm) || targetNorm.includes(fNorm.replace('pdf', ''));
            });

            if (matched) {
                const matchedPath = path.join(actsFolder, matched);
                res.setHeader('Content-Type', 'application/pdf');
                return res.sendFile(matchedPath);
            }
        }

        // 3. If file not found on disk, stream dynamically generated PDF with pdfkit
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ margin: 50 });
        const actTitle = decoded.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ') || 'Central Criminal Minor Act';

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${actTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
        doc.pipe(res);

        doc.fillColor('#0284c7').fontSize(18).text(actTitle, { align: 'center' });
        doc.moveDown(0.5);
        doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(1.5);

        doc.fillColor('#0284c7').fontSize(12).text('CHAPTER I - PRELIMINARY');
        doc.moveDown(0.5);
        doc.fillColor('#0f172a').fontSize(11).text('1. Short title, extent and commencement');
        doc.moveDown(0.3);
        doc.fillColor('#334155').fontSize(10).text(`(1) This Act may be called ${actTitle}.\n(2) It extends to the whole of India.\n(3) It shall come into force on such date as the Central Government may appoint by notification in the Official Gazette.`, { align: 'justify', lineGap: 4 });
        doc.moveDown(1.2);

        doc.fillColor('#0f172a').fontSize(11).text('2. Statutory Provisions & Guidelines');
        doc.moveDown(0.3);
        doc.fillColor('#334155').fontSize(10).text(`(1) The provisions of this Act shall have effect notwithstanding anything inconsistent therewith contained in any other enactment.\n(2) All rules and notifications made under this Act shall be laid before each House of Parliament.`, { align: 'justify', lineGap: 4 });

        doc.end();
    } catch (e) {
        console.error('Error in serveMinorActPdf:', e);
        res.status(500).send('Error loading PDF document.');
    }
};

app.get('/uploads/minor-acts/*', serveMinorActPdf);
app.get('/public/uploads/minor-acts/*', serveMinorActPdf);
app.get('/api/v1/uploads/minor-acts/*', serveMinorActPdf);

app.use('/api', require('./src'));

app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

app.get("/", (req, res) => {
    res.send({
        title: 'THE-LAWMENS API Server',
        status: 'Operational',
        time: new Date().toISOString()
    });
});

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
    return res.status(404).json({
        status: false,
        statusCode: 404,
        message: `Endpoint ${req.method} ${req.originalUrl} not found.`
    });
});

// Global Express Error Handling Middleware (4 arguments)
const { errorHandler: globalErrorHandler } = require('./utils/common_functions');
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    return globalErrorHandler(err, res);
});

// Process Level Safety Handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('[UNHANDLED REJECTION]:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('[UNCAUGHT EXCEPTION]:', err);
});

// Auto-seed Minor Acts on DB connect if needed
async function autoSeedMinorActs() {
    try {
        const MinorAct = require('./src/models/minorAct');
        const count = await MinorAct.countDocuments();
        if (count < 80) {
            const fs = require('fs');
            const catalogPath = path.join(__dirname, 'public/allMinorActs.json');
            if (fs.existsSync(catalogPath)) {
                const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
                for (const item of catalog) {
                    await MinorAct.findOneAndUpdate(
                        { name: item.name },
                        { $set: { ...item, isActive: true, isFreeTrial: true } },
                        { upsert: true }
                    );
                }
                console.log(`Auto-seeded ${catalog.length} Minor Acts on startup.`);
            }
        }
    } catch (err) {
        console.warn('Auto-seed minor acts error:', err.message);
    }
}

doConnect(process.env.DBURL).then(() => {
    autoSeedMinorActs();
}).catch(() => {});

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);
initSocketServer(server);
server.listen(PORT, () => {
    console.log(`THE-LAWMENS Backend Running on port ${PORT}`);
    subscriptionCron();
});

module.exports = app;