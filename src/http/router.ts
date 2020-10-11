import { App } from '@tinyhttp/app'
import { URL_BASE, CHECK_DELAY } from '../utils/settings'
import {cache} from '../main'
import * as scrap from '../utils/scrap'
import * as env from 'env-var'

export class Router {
    app: App = new App()

    constructor() {
        // get last hour url
        this.app.get('/hour', async (req, res) => {
            res.send(cache.has("HourURL")?cache.get("HourURL").value:"{error: true, message: \"not available\"}")
        })

        this.app.get('/hour/values', async (req, res) => {
            res.send(cache.has("HourValues")?cache.get("HourValues").value:"{error: true, message: \"not available\"}")
        })
        this.app.get('/hour/:type/:value',  async (req, res) => {    
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
            if (db != null) useCache = cache.unix() - db.time < CHECK_DELAY
                if (useCache) {
                res.send(`{"time": ${db.time}, "value": ${db.value}}`)
                return
            }
            var obj = await scrap.scrapHour(`${cache.get("HourURL").value}`, type, req.params.value)
            var unix = cache.unix()
            res.send(`{"time": ${unix}, "value": ${JSON.stringify(obj)}}`)
            cache.set(`${type}:${req.params.value}`, obj)
        })
        const port: number = env.get('PORT').default(8000).asPortNumber()
        this.app.listen(port, ()=>console.log(`[HTTP] Listening on ${port}`)) 
    }
}
