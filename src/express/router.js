var router = new require('express').Router()
var cache = require('./../main.js').cache
var scrap = require('./../utils/scrap.js')

// get last hour url
router.get('/hour', (req, res) => {
    res.send(cache.has("HourURL")?JSON.stringify(cache.get("HourURL")):"{error: true, message: \"not available\"}")
})

router.get('/hour/:type/:value',  async (req, res) => {
    var type = String(req.params.type.toLowerCase())
    if (type !== 'docenti' && type !== 'classi' && type !== 'aule')
        res.send(JSON.stringify({error: true, message: 'please specify a valid type'}))
    if (type === 'docenti' || type === 'aule')
        res.send(JSON.stringify({error: true, message: 'work in progress'}))
    if (type==='classi') req.params.value = req.params.value.toUpperCase()
    type = type.charAt(0).toUpperCase() + type.slice(1)
    // cache system
    var db = cache.get(`${type}:${req.params.value}`)
    var useCache = false;
    if (db != null) useCache = cache.unix() - db.time < parseInt(process.env.CHECK_DELAY)
    if (useCache) {
        res.send(`{"time": ${db.time}, "value": ${db.value}}`)
        return
    }
    var obj = await scrap.scrapHour(`${process.env.URL_BASE}${cache.get("HourURL").value}`, type, req.params.value)
    var unix = cache.unix()
    res.send(`{"time": ${unix}, "value": ${JSON.stringify(obj)}}`)
    cache.set(`${type}:${req.params.value}`, obj)
})

module.exports = router;