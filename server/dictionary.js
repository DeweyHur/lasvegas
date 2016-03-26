var dictionary = module.exports = {};

dictionary.keys = function (collection) {
    var ret = []
    for (var key in collection) {
        ret.push(key)
    }
    return ret
}

dictionary.map = function (collection, func) {
    var ret = []
    var index = 0
    for (var key in collection)
        ret.push(func(collection[key], index++, collection))
    return ret
}

dictionary.forEach = function (collection, func) {
    var index = 0
    for (var key in collection)
        func(collection[key], index++, collection)
}

dictionary.length = function (collection) {
    var index = 0
    for (var key in collection) ++index
    return index
} 