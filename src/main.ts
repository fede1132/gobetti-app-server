// imports
import { URL_BASE, CHECK_DELAY } from './utils/settings'
import {Router} from './http/router'
import { Cache } from './utils/cache'
import * as scrap from './utils/scrap'

// http server
new Router()

// cache
export var cache = new Cache()

// website scraping

// scrap loop
const check = async () => {
    console.log("[Gobetti] Running url check...")
    var url = await scrap.scrapBase()
    cache.set("HourURL", url)
    cache.set("HourValues", await scrap.scrapValues(`${url}`))
}

check()
setInterval(check, CHECK_DELAY * 1000)