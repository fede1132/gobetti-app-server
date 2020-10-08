// first of all we require sqlite 3 module
// and call the verbose function to get
// long stacktrace
// (verbose will be removed during production)
const Database = require('better-sqlite3');

// db connection
var db = new Database('./cache.db',  {verbose: console.log})

// create tables
const _table_query = 
    'create table if not exists cache ( id varchar(16) not null constraint table_name_pk primary key, time varchar(16) not null, value TEXT not null );'
db.exec(_table_query)


// let's create a method to add 
// values to our object
exports.set = (key, value) => {
    var stmt = db.prepare(this.has(key)?
    "update cache set value = $value, time = $time where id = $key":
    "insert into cache (value, time, id) values ($value, $time, $key)")
    .run({
        key: String(key),
        value: JSON.stringify(value),
        time: String(this.unix())
    })
    return stmt.changes > 0
}

// a method to get a value from 
// the cache object
exports.get = (key) => {
    if (!this.has(key)) return null
    var stmt = db.prepare(`select * from cache where id = ?`).get(key)
    return stmt
}

// a method to remove a key
// from our cache object
exports.remove = (key) => {
    if (!this.has(key)) return false
    var stmt = db.prepare(`delete from cache where id = ?`).run(key)
    return stmt.changes > 0
}

// and.. yes! a method
// to check if a key is stored
exports.has = (key) => {
    var stmt = db.prepare("select * from cache where id = $key").all({key: key})
    return stmt.length > 0
}

exports.unix = () => {
    return Math.round(Date.now()/1000)
}
