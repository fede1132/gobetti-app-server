import * as axios from 'axios'
import { cache } from '../main'
import { URL_BASE } from './settings'

var cheerio = require('cheerio');
var fs = require('fs')


const http = axios.default.create({
    baseURL: "http://" + URL_BASE,
    timeout: 20000,
    headers: {"Host": URL_BASE}
})

export async function scrapBase() {
    // making a request to the base url
    var article: string = ""
    await http.get("")
        .then((response: any) => {
            // once got the data from the site
            // we parse it using cheerio
            // and we provide the selector to
            // the `a` tag that contains the href
            const html = response.data
            const $ = cheerio.load(html)
            article = $("#jsn-pleft > div:nth-child(1) > div.jsn-middle > div > div > ul > li > a")['0'].attribs.href
        }).catch(err => {
            console.log(err)
        })
    // once we got the last article url
    // we make a new axios request ot its url
    // then we parse the content of the page in the
    // same way we parsed the base url above
    await http.get(article)
        .then((response: any) => {
            const html = response.data
            const $ = cheerio.load(html)
            article = $("#jsn-mainbody > div > div > div.jsn-article-content > p:nth-child(8) > span > a")['0'].attribs.href.replace("index.html", "")
        })
    // once the axios request is complete
    // we got our content parsed and we can
    // start scraping the page to find the
    // url we want
    return article;
}

export async function scrapValues(url: string) {
    var tds: any
    await http.get(`${url}index.html`)
        .then((response: any) => {
            const html = response.data
            const $ = cheerio.load(html)
            tds = $("body > center:nth-child(2) > table > tbody > tr > td")
        })
    var values: any = {}
    for (var i=0;i<tds.length;i++) {
        var p = tds[i]
        if (p.name !== 'td') continue
        var value = []
        var arr = p.children[1].children
        var type = p.children[0].data.replace("\n", "").trim().toLowerCase();
        for (var j=1;j<arr.length;j++) {
            var node = p.children[j]
            if (typeof node === 'undefined' || node == null) continue
            for (var k=0;k<node.children.length;k++) {
                var a = node.children[k]
                if (a.children === 'undefined' || a.children == null) continue
                a = a.children[0]
                if (typeof a === 'undefined' 
                    || typeof a.data === 'undefined'
                    || a.name === 'br' 
                    || a.data.replace("\n", "").trim() === '\n'
                    || a.data.replace("\n", "").trim() === '' 
                    || a.data.replace("\n", "").trim() === 'secondo calendario.') continue
                var text = a.data.replace("\r", "").replace("\n", "").trim()
                value.push(text)
            }
        }
        values[type] = value
    }
    return values
}

export async function scrapHour(url: string, dir: string, value: string) {
    var trs: any
    var nodes: any = []
    var $
    await http.get(`${url}${dir}/${value}.html`)
        .then((response: any) => {
            // as before we make a request
            // and parse it as html without
            // script, style, pre tag(s) and comments
            const html = response.data
            $ = cheerio.load(html)
            trs = $("body > center:nth-child(2) > table > tbody > tr")
            var classrooms = JSON.parse(cache.get('HourValues').value).aule
            for (var i=0;i<trs.length;i++) {
                var row = []
                var len = $(`body > center:nth-child(2) > table > tbody > tr:nth-child(${i}) > td`).length
                for (var k = 0; k <= len; k++) {
                    var hour: any = []
                    var count = 0
                    var rowspan: number = 0
                    $(`body > center:nth-child(2) > table > tbody > tr:nth-child(${i}) > td:nth-child(${k}) > p`)
                        .each((index: number, e: any) => {
                            if (typeof e.children === undefined || typeof e.attribs == undefined || e.attribs.id === undefined || e.attribs.id === 'mathema') return
                            rowspan = parseInt(e.parent.attribs.rowspan)
                            var text;
                            if (e.children[0].name !== 'a') {
                                text = e.children[0].data
                            } else {
                                text = e.children[0].children[0].data
                            }
                            hour.push(text)
                            if (count != 0 && classrooms.indexOf(text) != -1 && hour.length > 0) {
                                hour.push(rowspan)
                                row.push(hour)
                                hour = []
                                count=0
                            } else count++
                        })
                    if (hour.length > 0) {
                        hour.push(rowspan)
                        row.push(hour)
                    }
                }
                if (row.length > 0)nodes.push(row)
            }
        })
        .catch((error) => {
            // if there is an error
            // such as 404 (not found) we
            // return it as an object
            trs = {
                error: true,
                code: error.response.status
            }
        })
    if (typeof trs === 'object' && trs!=null && trs.error) {
        return trs;
    }
    // first of all we need to get the
    // table that contains every
    // subject, clasroom and teacher
    // in our hour
    var lessons = []
    var hours = []
    // then we loop throu each row
    // in the table
    for (var j=0;j<nodes.length;j++) {
        // then we get the row by
        // picking it from our array
        var row = nodes[j]
        // then we get every child in 
        // in our row and we loop throu it
        for (var i=0;i<row.length;i++) {
            var element = row[i]
            var teachers: any = []
            // then we need our teacher
            // we start a loop from 1
            // to the length of data array 
            // minius 1
            if (element.length-3==1) teachers=element[1]
            else for (var l=1;l<element.length-1&&l!=element.length-1;l++) {
                teachers.push(element[l])
            }
            var day = -1;
            var obj = null;
            // now we start a loop with the duration
            // of number inside rowspawn attribe
            // we got before
            var rowspan = element[element.length - 1]
            for (var k=0;k<rowspan;k++) {
                var lesson: any = lessons[j+k]
                // let's get our lesson from
                // lessons array and inizialize it
                // if it is null
                if (typeof lesson === 'undefined') lesson = []
                if (day==-1) {
                    // a little loop to get
                    // the current day
                    if (typeof lesson[0] == null) day = 0
                    else for (var m=0;m<6;m++) {
                        // if the lesson in `m` posion
                        // is null skip it
                        if (lesson[m] != null) continue
                        else {
                            // or else we set the `day`
                            // variable to `m` and we
                            // break the loop
                            day = m
                            break
                        }
                    }
                }
                // if obj is null means
                // this is the first rowspan
                // loop cycle then we create
                // the object with lesson information
                if (obj==null) 
                    obj = {
                        teacher: teachers,
                        subject: element[0],
                        classroom: element[element.length-2]
                    }
                // attach the information to 
                // our lesson in the current day
                lesson[day] = obj
                // and save it to our lesson array
                lessons[j+k] = lesson
            }
        }
    }
    lessons.shift()
    return {
        lessons: lessons,
        //hours: hours
    }
}
