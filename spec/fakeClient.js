function delay (ms) {
    var {promise, resolve} = _.future()
    setTimeout(() => resolve({}), ms ? ms : 200)
    return promise;
}

module.exports = {
    connect: () => delay(),
    disconnect: () => delay(),
    on: () => {}
}