const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const graphQlHttp = require('express-graphql');
const mongoose = require('mongoose');

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is-auth');

const app = express();

app.use(cors());

app.use(bodyParser.json({limit: '1mb'}));

app.use(isAuth);

app.use('/graphql', graphQlHttp((req, res) => ({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true,
    customFormatErrorFn: (err) => {
        res.statusCode = 200;
        return err
    }
})));

const connectionString = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_DB}/${process.env.MONGO_COLLECTION}?retryWrites=true&w=majority`;

mongoose.connect(connectionString)
.then(() => {
    app.listen(3000);
}).catch(err => {
    console.log('error: ', err);
});