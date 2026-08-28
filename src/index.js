const router = require('express').Router();
// eslint-disable-next-line import/no-dynamic-require
router.use('/v' + process.env.VERSION, require('./routes/v' + process.env.VERSION+'/routes'));

router.use('/v1/sync', require('./modules/sync/sync.routes'));

module.exports = router;
