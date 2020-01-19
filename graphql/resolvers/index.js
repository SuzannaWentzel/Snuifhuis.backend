const authResolver = require('./auth');
const bewonerResolver = require('./bewoner');
const titleResolver = require('./title');

const rootResolver = {
    ...authResolver,
    ...bewonerResolver,
    ...titleResolver
}

module.exports = rootResolver;