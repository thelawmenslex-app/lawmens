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

doConnect(process.env.DBURL);

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);
initSocketServer(server);
server.listen(PORT, () => {
    console.log(`THE-LAWMENS Backend Running on port ${PORT}`);
    subscriptionCron();
});

module.exports = app;