const router = require('express').Router();
const { auth } = require('../../../middleware/auth.middleware');
const syncController = require('./sync.controller');

const { checkPremiumAccess } = require('../../../middleware/trial.middleware');

// Restrict sync endpoints to authenticated users and premium accounts
router.use(auth);
router.use(checkPremiumAccess);

// Pull sync
router.get('/pull', syncController.pullSync);

// Push sync
router.post('/push', syncController.pushSync);

module.exports = router;
