"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.scrapHour = exports.scrapValues = exports.scrapBase = void 0;
var axios = require("axios");
var node_html_parser_1 = require("node-html-parser");
function scrapBase(url) {
    return __awaiter(this, void 0, void 0, function () {
        var body, article, hour;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios["default"].get(url)
                        .then(function (response) {
                        // once got the data from the site
                        // we parse it using html-parser
                        // then we provie a map of booleans
                        // to let the parser to collect useless data
                        // and use much ram
                        body = node_html_parser_1.parse(response.data, {
                            lowerCaseTagName: false,
                            script: false,
                            style: false,
                            pre: false,
                            comment: false
                        });
                    })
                    // here we extract the href contenct of "a" tag
                    // that contains the last article url
                ];
                case 1:
                    _a.sent();
                    article = body
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
                        .match(/href=(["'])(.*?)\1/)[2];
                    // once we got the last article url
                    // we make a new axios request ot its url
                    // then we parse the content of the page in the
                    // same way we parsed the base url above
                    return [4 /*yield*/, axios["default"].get(url + article)
                            .then(function (response) {
                            body = node_html_parser_1.parse(response.data, {
                                lowerCaseTagName: false,
                                script: false,
                                style: false,
                                pre: false,
                                comment: false
                            });
                        })
                        // once the axios request is complete
                        // we got our content parsed and we can
                        // start scraping the page to find the
                        // url we want
                    ];
                case 2:
                    // once we got the last article url
                    // we make a new axios request ot its url
                    // then we parse the content of the page in the
                    // same way we parsed the base url above
                    _a.sent();
                    hour = body
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
                        .replace("index.html", "");
                    return [2 /*return*/, hour];
            }
        });
    });
}
exports.scrapBase = scrapBase;
function scrapValues(url) {
    return __awaiter(this, void 0, void 0, function () {
        var body, values, i, p, value, arr, type, j, node, k, a, text;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios["default"].get(url + "index.html")
                        .then(function (response) {
                        body = node_html_parser_1.parse(response.data.toLowerCase(), {
                            lowerCaseTagName: false,
                            script: false,
                            style: false,
                            pre: false,
                            comment: false
                        });
                    })["catch"](function (err) {
                        console.log(err);
                    })];
                case 1:
                    _a.sent();
                    body = body.querySelector("table").querySelectorAll("td");
                    values = {};
                    for (i = 0; i < body.length; i++) {
                        p = body[i];
                        if (p._tag_name !== 'td')
                            continue;
                        value = [];
                        arr = p.childNodes[1].childNodes;
                        type = p.childNodes[0].rawText.trim();
                        for (j = 0; j < arr.length; j++) {
                            node = p.childNodes[j];
                            if (typeof node === 'undefined')
                                continue;
                            for (k = 0; k < node.childNodes.length; k++) {
                                a = node.childNodes[k];
                                if (typeof a === 'undefined'
                                    || a._tag_name === 'br'
                                    || a.rawText.trim() === '\n'
                                    || a.rawText.trim() === ''
                                    || a.rawText.trim() === 'secondo calendario.')
                                    continue;
                                text = a.rawText.replace("\r", "").replace("\n", "").trim();
                                value.push(text);
                            }
                        }
                        values[type] = value;
                    }
                    return [2 /*return*/, values];
            }
        });
    });
}
exports.scrapValues = scrapValues;
function scrapHour(url, dir, value) {
    return __awaiter(this, void 0, void 0, function () {
        var body, rows, lessons, hours, j, row, elements, i, element, text, attrs, data, rowspan, teachers, l, day, obj, k, lesson, m;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios["default"].get("" + url + dir + "/" + value + ".html")
                        .then(function (response) {
                        // as before we make a request
                        // and parse it as html without
                        // script, style, pre tag(s) and comments
                        body = node_html_parser_1.parse(response.data.toLowerCase(), {
                            lowerCaseTagName: false,
                            script: false,
                            style: false,
                            pre: false,
                            comment: false
                        });
                    })["catch"](function (error) {
                        // if there is an error
                        // such as 404 (not found) we
                        // return it as an object
                        body = {
                            error: true,
                            code: error.response.status
                        };
                    })];
                case 1:
                    _a.sent();
                    if (typeof body === 'object' && body != null && body.error) {
                        return [2 /*return*/, body];
                    }
                    rows = body.querySelector("table").querySelectorAll("tr");
                    lessons = [];
                    hours = [];
                    // then we loop throu each row
                    // in the table
                    for (j = 0; j < rows.length; j++) {
                        // we skip the first row because it contains the day name
                        if (j == 0)
                            continue;
                        row = rows[j];
                        elements = row.childNodes;
                        for (i = 0; i < elements.length; i++) {
                            element = elements[i];
                            text = element.rawText.replace("\n", "").replace("&nbsp;", "").trim();
                            // if the result of parseFloat is above 0
                            // we can say it's the hour time
                            if (parseFloat(text) > 0) {
                                hours.push(text);
                                continue;
                            }
                            attrs = element.rawAttrs;
                            // check if the attributes are null or there is no rowspan
                            if (typeof attrs === 'undefined' || !attrs.includes("rowspan"))
                                continue;
                            data = text.split("\n");
                            rowspan = parseInt(attrs.match(/(?:rowspan=)\"([0-9"]*)/)[1].replace("\"", ""));
                            teachers = [];
                            // then we need our teacher
                            // we start a loop from 1
                            // to the length of data array 
                            // minius 1
                            if (data.length - 2 == 1)
                                teachers = data[1].trim();
                            else
                                for (l = 1; l < data.length && l != data.length - 1; l++) {
                                    teachers.push(data[l].trim());
                                }
                            day = -1;
                            obj = null;
                            // now we start a loop with the duration
                            // of number inside rowspawn attribe
                            // we got before
                            for (k = 0; k < rowspan; k++) {
                                lesson = lessons[j + k];
                                // let's get our lesson from
                                // lessons array and inizialize it
                                // if it is null
                                if (typeof lesson === 'undefined')
                                    lesson = [];
                                if (day == -1) {
                                    // a little loop to get
                                    // the current day
                                    if (typeof lesson[0] == null)
                                        day = 0;
                                    else
                                        for (m = 0; m < 6; m++) {
                                            // if the lesson in `m` posion
                                            // is null skip it
                                            if (lesson[m] != null)
                                                continue;
                                            else {
                                                // or else we set the `day`
                                                // variable to `m` and we
                                                // break the loop
                                                day = m;
                                                break;
                                            }
                                        }
                                }
                                // if obj is null means
                                // this is the first rowspan
                                // loop cycle then we create
                                // the object with lesson information
                                if (obj == null)
                                    obj = {
                                        teacher: teachers,
                                        subject: data[0].trim(),
                                        classroom: data[data.length - 1].trim()
                                    };
                                // attach the information to 
                                // our lesson in the current day
                                lesson[day] = obj;
                                // and save it to our lesson array
                                lessons[j + k] = lesson;
                            }
                        }
                    }
                    lessons.shift();
                    return [2 /*return*/, {
                            lessons: lessons,
                            hours: hours
                        }];
            }
        });
    });
}
exports.scrapHour = scrapHour;
