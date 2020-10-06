// let's create an object
// where we can store our
// values
var cache = {};

// let's create a method to add 
// values to our object
exports.set = (key, value) => {
    cache[key] = value
}

// a method to get a value from 
// the cache object
exports.get = (key) => {
    return cache[key]
}

// a method to remove a key
// from our cache object
exports.remove = (key) => {
    delete cache[key]
}

// and.. yes! a method
// to check if a key is stored
exports.has = (key) => {
    return typeof cache[key] !== 'undefined'
}
