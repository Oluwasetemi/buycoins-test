/* eslint-disable */
const { ApolloServer, PubSub } = require('apollo-server-express');
const express = require('express');
const expressPlayground = require('graphql-playground-middleware-express').default;
const { readFileSync } = require('fs');
const { createServer } = require('http');


const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8');
const resolvers = require('./resolvers');


async function start() {
    // Create a new instance of the server
    const app = express();

    // Send it an object with typeDefs(the schema) and resolvers
    const pubsub = new PubSub();
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        introspection: true
    });

    server.applyMiddleware({ app });

    app.get('/', (req, res) => {
        res.redirect('\graphiql')
    });

    app.get('/graphiql', expressPlayground({ endpoint: '/graphql' }));


    const httpServer = createServer(app);
    server.installSubscriptionHandlers(httpServer);

    // Call listen on the server to launch the web server
    httpServer.listen({ port: process.env.PORT || 4000 }, () =>
        {console.log(server.graphqlPath)
        console.log(`GraphQL Server running at http://localhost:4000${server.graphqlPath} and socket is running at ws://localhost:4000/graphql`)}
    );


}

exports.start = start();
