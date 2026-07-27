if (typeof global.SlowBuffer === 'undefined') {
    const { Buffer } = require('buffer');
    global.SlowBuffer = Buffer;
}

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const APP_STATE = process.env.NODE_ENV;
const helmet = require('helmet');
const { doConnect } = require("./config/dbConnect");
const passport = require('passport');
const path = require("path")
const {subscriptionCron}=require("./services/cronservices");
const {
    passportConfig: { jwtStrategy },
} = require('./config');

const app = express();
/**
 * Set `views` directory for module
 */

app.set('views', path.join(__dirname, 'views'));

/**
 * Set `view engine` to `pug`.
 */

app.set('view engine', 'pug');

/**
 * middleware for favicon
 */

app.use("/",express.static(path.join(__dirname, 'public')));

app.use(express.json({ limit: 52428800 }));
app.use(express.urlencoded({ limit: 52428800, extended: true }));
app.options('*', cors());
app.use(cors());

// protect against vulnerability
app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
        useDefaults: true,
        directives: {
            'img-src': ["'self'", 'https: data:'],
        },
    }),
);


/**
 * routes application
 */

app.use('/api', require('./src'));

/**
 * Load auth routes and
 * login strategies with
 * passport
 */
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);
app.get("/",(req, res) => {
    res.send({
        title: 'Test route',
    });
})
app.get("/checkTemplate",(req, res) => {
    res.render('otp',{
        title: 'Test route',
    });
})
/**
 * GET index page.
 */

app.get('*', (req, res) => {
    res.send({
        title: 'Backend API',
    });
});


app.listen(process.env.PORT, "0.0.0.0", () => {
    console.log(`${process.env.APP_NAME} listening on ${process.env.PORT}`);
    doConnect(process.env.DBURL).catch((err) => {
        console.error("Mongoose connection failed to initialize on startup:", err);
    });
    subscriptionCron()
})
