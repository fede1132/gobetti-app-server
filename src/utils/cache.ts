// first of all we require sqlite 3 module
// and call the verbose function to get
// long stacktrace
// (verbose will be removed during production)
import Database = require('better-sqlite3')
import { verbose } from '../main'

export class Cache {
    // db connection
    db = new Database('./cache.db', verbose?{verbose: (str)=>console.log(`[SQL Verbose] Query: '${str}'`)}:{} )

    constructor() {
        // create tables
        const _table_query = 
            'create table if not exists cache ( id varchar(16) not null constraint table_name_pk primary key, time varchar(16) not null, value TEXT not null );'
        this.db.exec(_table_query)
    }


    // let's create a method to add 
    // values to our object
    set(key: string, value: any) {
        var stmt = this.db.prepare(this.has(key)?
        "update cache set value = $value, time = $time where id = $key":
        "insert into cache (value, time, id) values ($value, $time, $key)")
        .run({
            key: String(key),
            value: typeof value === 'object' ? JSON.stringify(value) : value,
            time: String(this.unix())
        })
        return stmt.changes > 0
    }

    // a method to get a value from 
    // the cache object
    get(key: string) {
        if (!this.has(key)) return null
        var stmt = this.db.prepare(`select * from cache where id = ?`).get(key)
        return stmt
    }           

    // a method to remove a key
    // from our cache object
    remove(key: string) {
        if (!this.has(key)) return false
        var stmt = this.db.prepare(`delete from cache where id = ?`).run(key)
        return stmt.changes > 0
    }

    // and.. yes! a method
    // to check if a key is stored
    has(key: string) {
        var stmt = this.db.prepare("select * from cache where id = $key").all({key: key})
        return stmt.length > 0
    }

    unix() {
        return Math.round(Date.now()/1000)
    }
}