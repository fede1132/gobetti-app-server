const axios = require('axios')
const { parse } = require('node-html-parser')
const fs = require('fs');
var cleaner = require('clean-html')

exports.scrapBase = async function (url) {
    // making a request to the base url
    var body = "";
    await axios.get(url)
        .then(respose => {
            // once got the data from the site
            // we parse it using html-parser
            // then we provie a map of booleans
            // to let the parser to collect useless data
            // and use much ram
            body = parse(respose.data, {
                lowerCaseTagName: false,
                script: false,
                style: false,
                pre: false,
                comment: false
            })
        })
    // here we extract the href contenct of "a" tag
    // that contains the last article url
    var article = body
        .querySelector("#jsn-pleft")
        .querySelector("div")
        .querySelector("div.jsn-middle")
        .querySelector("div")
        .querySelector("div")
        .querySelector("ul")
        .querySelector("li.item2939.order1.first")
        .querySelector("a").rawAttrs
        // here we match for a "href" tag
        // and extract it content
        .match(/href=(["'])(.*?)\1/)[2]
    // once we got the last article url
    // we make a new axios request ot its url
    // then we parse the content of the page in the
    // same way we parsed the base url above
    await axios.get(url+article)
        .then((response) => {
            body = parse(response.data, {
                lowerCaseTagName: false,
                script: false,
                style: false,
                pre: false,
                comment: false
            })
        })
    // once the axios request is complete
    // we got our content parsed and we can
    // start scraping the page to find the
    // url we want
    var hour = body
        .querySelector("#jsn-mainbody")
        .querySelector("div")
        .querySelector("div")
        .querySelector("div.jsn-article-content")
        .querySelectorAll("p")[6]
        .querySelector("span")
        .querySelector("a").rawAttrs
        // here we match for a "href" tag
        // and extract it content
        .match(/href=(["'])(.*?)\1/)[2]
        // removing the page from the url we got
        .replace("index.html", "")
    return hour;
}

exports.scrapHour = async function (url, dir, value) {
    var body = "";
    await axios.get(`${url}${dir}/${value}.html`)
        .then((response) => {
            // as before we make a request
            // and parse it as html without
            // script, style, pre tag(s) and comments
            var ht = "";
            cleaner.clean(response.data.toLowerCase(), (html) => ht=html)
            body = parse(ht, {
                lowerCaseTagName: false,
                script: false,
                style: false,
                pre: false,
                comment: false
            })
        })
        .catch((error) => {
            // if there is an error
            // such as 404 (not found) we
            // return it as an object
            body = {
                error: true,
                code: error.response.status
            }
        })
    if (typeof body === 'object' && body!=null && body.error) {
        return body;
    }
    // as this point we got our
    // hour as html element
    // we only need to scrap it and
    // convert it to json
    var rows = body.querySelector("table").querySelectorAll("tr");
    var lessons = []
    var hours = []
    for (var j=0;j<rows.length;j++) {
        if (j==0) continue
        var row = rows[j]
        var elements = row.childNodes
        for (var i=0;i<elements.length;i++) {
            var element = elements[i]
            var text = element.rawText.replace("\n", "").replace("&nbsp;", "").trim();
            if (i==0) {
                hours.push(text)
                continue
            }
            var attrs = element.rawAttrs
            if (typeof attrs === 'undefined' || !attrs.includes("rowspan")) continue
            var data = text.split("\n")
            var rowspan = parseInt(attrs.match(/(?:rowspan=)\"([0-9"]*)/)[1].replace("\"", ""))
            var teachers = []
            if (data.length-2==1) teachers=data[1].trim()
            else for (var l=1;l<data.length&&l!=data.length-1;l++) {
                teachers.push(data[l].trim())
            }
            var day = -1;
            var obj = null;
            for (var k=0;k<rowspan;k++) {
                var lesson = lessons[j+k]
                if (typeof lesson === 'undefined') lesson = []
                if (day==-1) {
                    if (typeof lesson[0] == null) day = 0
                    else for (var m=0;m<6;m++) {
                        if (lesson[m] != null) continue
                        else {
                            day = m
                            break
                        }
                    }
                }
                if (obj==null) 
                    obj = {
                        teacher: teachers,
                        subject: data[0].trim(),
                        classroom: data[data.length-1].trim()
                    }
                lesson[day] = obj
                lessons[j+k] = lesson
            }
            // for (var k=0;k<rowspan;k++) {
            //     var teachers = []
            //     for (var l=1;l<data.length&&l!=data.length-1;l++) {
            //         teachers.push(data[l].trim())
            //     }
            //     if (teachers.length==1) teachers=teachers[0] 
            //     var lesson = lessons[j]
            //     if (typeof lesson === 'undefined') lesson = []
            //     var day = 0
            //     if (typeof lesson[0] !== 'undefined') {
            //         for (var m=0;m<6;m++) {
            //             if (typeof lesson[m] !== 'undefined') continue
            //             else {
            //                 day = m
            //                 break
            //             }
            //         }
            //     }
            //     hour = {
            //         day: day,
            //         subject: data[0].trim(),
            //         teachers: teachers,
            //         classroom: data[data.length-1].trim(),
            //     }
            //     lesson[day] = hour
            //     lessons[j] = lesson
            //     if (j+k != j) {
            //         lesson = lessons[j+k]
            //         if (typeof lesson === 'undefined') lesson = []
            //         lesson[day] = hour
            //         lessons[j+k] = lesson
            //     }
            // }
        }
    }
    console.log(lessons)
}
