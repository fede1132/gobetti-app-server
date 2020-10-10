// imports
import {URL_BASE, CHECK_DELAY} from './utils/settings'
import { Cache } from './utils/cache'
import * as scrap from './utils/scrap'

// cache
export var cache = new Cache()

// website scraping

// scrap loop
setInterval(async () => {
    console.log("[Gobetti] Running url check...")
    var url = await scrap.scrapBase(URL_BASE);
    var values = await scrap.scrapValues(`${URL_BASE}${url}`)
    cache.set("HourURL", url)
    cache.set("HourValues", values)
}, CHECK_DELAY*1000)