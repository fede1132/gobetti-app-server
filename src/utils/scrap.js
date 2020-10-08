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

exports.scrapValues = async function (url) {
    var body = ""
    await axios.get(`${url}index.html`)
        .then((response) => {
            var ht = ""
            cleaner.clean(response.data.toLowerCase(), (html)=>ht=html)
            body = parse(ht, {
                lowerCaseTagName: false,
                script: false,
                style: false,
                pre: false,
                comment: false
            })
        }).catch((err) => {
            console.log(err)
        })
    body = body.querySelector("table").querySelectorAll("td")
    var values = {}
    for (var i=0;i<body.length;i++) {
        var p = body[i]
        if (p._tag_name !== 'td') continue
        var value = []
        var arr = p.childNodes[1].childNodes
        var type = p.childNodes[0].rawText.trim();
        for (var j=0;j<arr.length;j++) {
            var node = p.childNodes[j]
            if (typeof node === 'undefined') continue
            for (var k=0;k<node.childNodes.length;k++) {
                var a = node.childNodes[k]
                if (typeof a === 'undefined' 
                || a._tag_name === 'br' 
                || a.rawText.trim() === '\n'
                || a.rawText.trim() === '' 
                || a.rawText.trim() === 'secondo calendario.') continue
                var text = a.rawText.replace("\r", "").replace("\n", "").trim()
                value.push(text)
            }
        }
        values[type] = value
    }
    return values
}

exports.scrapHour = async function (url, dir, value) {
    var body = ""
    await axios.get(`${url}${dir}/${value}.html`)
        .then((response) => {
            // as before we make a request
            // and parse it as html without
            // script, style, pre tag(s) and comments
            var ht = ""
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

    // first of all we need to get the
    // table that contains every
    // subject, clasroom and teacher
    // in our hour
    var rows = body.querySelector("table").querySelectorAll("tr");
    var lessons = []
    var hours = []
    // then we loop throu each row
    // in the table
    for (var j=0;j<rows.length;j++) {
        // we skip the first row because it contains the day name
        if (j==0) continue
        // then we get the row by
        // picking it from our array
        var row = rows[j]
        // then we get every child in 
        // in our row and we loop throu it
        var elements = row.childNodes
        for (var i=0;i<elements.length;i++) {
            var element = elements[i]
            // we get the text of the child
            // and remove the newline char and
            // the space char then we trim it
            var text = element.rawText.replace("\n", "").replace("&nbsp;", "").trim();
            // if the result of parseFloat is above 0
            // we can say it's the hour time
            if (parseFloat(text) > 0) {
                hours.push(text)
                continue
            }
            // we get the html attributes of
            // the child to get the rowspan
            var attrs = element.rawAttrs
            // check if the attributes are null or there is no rowspan
            if (typeof attrs === 'undefined' || !attrs.includes("rowspan")) continue
            var data = text.split("\n")
            // with this regex we get only the number
            // inside the rowspawn attribe
            var rowspan = parseInt(attrs.match(/(?:rowspan=)\"([0-9"]*)/)[1].replace("\"", ""))
            var teachers = []
            // then we need our teacher
            // we start a loop from 1
            // to the length of data array 
            // minius 1
            if (data.length-2==1) teachers=data[1].trim()
            else for (var l=1;l<data.length&&l!=data.length-1;l++) {
                teachers.push(data[l].trim())
            }
            var day = -1;
            var obj = null;
            // now we start a loop with the duration
            // of number inside rowspawn attribe
            // we got before
            for (var k=0;k<rowspan;k++) {
                var lesson = lessons[j+k]
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
                        subject: data[0].trim(),
                        classroom: data[data.length-1].trim()
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
        hours: hours
    }
}
