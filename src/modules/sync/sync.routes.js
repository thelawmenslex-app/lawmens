const router = require('express').Router();
const { syncPull, syncPush } = require('./sync.controller');
const { auth } = require('../../../middleware/auth.middleware');

// Optional auth for syncPull (public content works without auth, user notes/history sync with auth)
router.get('/pull', (req, res, next) => {
  if (req.headers.authorization) {
    return auth(req, res, next);
  }
  next();
}, syncPull);

// Required auth for syncPush (user operations queue)
router.post('/push', auth, syncPush);

module.exports = router;
