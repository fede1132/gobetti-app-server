'use strict'
const express = require('express')
require('dotenv').config();

// cache
var cache = require('./utils/cache.js')
exports.cache = cache;

// express
var app = express()
var router = require('./express/router.js')

// point our express application to our router
app.use('/', router);

// listen for a port
var port = process.env.PORT || 3000;
// log when the web api is ready
app.listen(port, ()=>console.log(`[WEB] Listening on ${port}`))

// website scraping

var scrap = require('./utils/scrap.js')
// start the scraping
check()
async function check() {
    var hourURL = cache.get("HourURL")
    if (cache.unix() - 0 > process.env.CHECK_DELAY) {
        var url = await scrap.scrapBase(process.env.URL_BASE);
        var values = await scrap.scrapValues(`${process.env.URL_BASE}${url}`)
        cache.set("HourURL", url)
        cache.set("HourValues", values)
    }
    setTimeout(check, process.env.CHECK_DELAY*1000)
}
