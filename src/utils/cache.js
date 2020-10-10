"use strict";
exports.__esModule = true;
exports.Cache = void 0;
// first of all we require sqlite 3 module
// and call the verbose function to get
// long stacktrace
// (verbose will be removed during production)
var Database = require("better-sqlite3");
var Cache = /** @class */ (function () {
    function Cache() {
        // db connection
        this.db = new Database('./cache.db', { verbose: console.log });
        // create tables
        var _table_query = 'create table if not exists cache ( id varchar(16) not null constraint table_name_pk primary key, time varchar(16) not null, value TEXT not null );';
        this.db.exec(_table_query);
    }
    // let's create a method to add 
    // values to our object
    Cache.prototype.set = function (key, value) {
        var stmt = this.db.prepare(this.has(key) ?
            "update cache set value = $value, time = $time where id = $key" :
            "insert into cache (value, time, id) values ($value, $time, $key)")
            .run({
            key: String(key),
            value: JSON.stringify(value),
            time: String(this.unix())
        });
        return stmt.changes > 0;
    };
    // a method to get a value from 
    // the cache object
    Cache.prototype.get = function (key) {
        if (!this.has(key))
            return null;
        var stmt = this.db.prepare("select * from cache where id = ?").get(key);
        return stmt;
    };
    // a method to remove a key
    // from our cache object
    Cache.prototype.remove = function (key) {
        if (!this.has(key))
            return false;
        var stmt = this.db.prepare("delete from cache where id = ?").run(key);
        return stmt.changes > 0;
    };
    // and.. yes! a method
    // to check if a key is stored
    Cache.prototype.has = function (key) {
        var stmt = this.db.prepare("select * from cache where id = $key").all({ key: key });
        return stmt.length > 0;
    };
    Cache.prototype.unix = function () {
        return Math.round(Date.now() / 1000);
    };
    return Cache;
}());
exports.Cache = Cache;
