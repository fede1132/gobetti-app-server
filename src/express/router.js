var router = new require('express').Router()
var cache = require('./../main.js').cache

// get last hour url
router.get('/hour', (req, res) => {
    res.send(cache.has("HourURL")?cache.get("HourURL"):"{error: true, message: \"not available\"}")
})

router.get('/hour/:type/:value', (req, res) => {
    res.send(cache.has("HourURL")?cache.get("HourURL"):"{error: true, message: \"not available\"}")
})

module.exports = router;