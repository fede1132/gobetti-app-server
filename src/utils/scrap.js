const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const axios = require('axios')
const { parse } = require('node-html-parser')

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
            body = parse(response.data, {
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
        }
    )
    if (typeof body === 'object' && body.error == true) {
        return body;
    }
    body = body.querySelector("tr").parentNode
    // as this point we got our
    // hour as html element
    // we only need to scrap it and
    // convert it to json
    var rows = body.querySelectorAll("tr")
    console.log(body.childNodes)
}