const authResolver = require('./auth');
const bewonerResolver = require('./bewoner');
const titleResolver = require('./title');
const photoResolver = require('./photo');

const rootResolver = {
    ...authResolver,
    ...bewonerResolver,
    ...titleResolver,
    ...photoResolver
}

module.exports = rootResolver;