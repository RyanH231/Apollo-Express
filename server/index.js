import "dotenv/config"
import   teamModel from "./mongoose/teamModel.js"

import {expressMiddleware} from "@apollo/server/express4"
import mongoose, { Schema } from "mongoose"
import { ApolloServer } from "@apollo/server"
import {ApolloServerPluginDrainHttpServer} from "@apollo/server/plugin/drainHttpServer"
import  bodyParser  from "body-parser"
import http from "http"
import cors from "cors"
import express from "express"

const app = express();
const httpServer = http.createServer(app);
const mongoURI = process.env.MONGODB_URI

const typeDefs = `#graphql
    type WinningTeams
    {
        name: String,
        year: Int
    }

    type Query
    {
        getTeams: [WinningTeams]
    }

    type Mutation
    {
        AddTeam(id:Int, name:String, year:String) : Int
    }
`


const resolvers = {
    Query: {
        getTeams: async () => {
            return await teamModel.collection.find({}).toArray();
        },
    },
    Mutation: {
        AddTeam: async (_, args)=>
        {
            let newTeam = {
                name:args.name,
                year:args.year
            }
            await teamModel.create(newTeam);
            return newTeam.id;
        }
    }
}

// Same ApolloServer initialization as before, plus the drain plugin
// for our httpServer.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins:[ApolloServerPluginDrainHttpServer({ httpServer })],
});
// Ensure we wait for our server to start
await server.start();

const main = async () =>
{
     await mongoose.connect(mongoURI,  
{ useNewUrlParser : true, useUnifiedTopology: true})
    console.log(await teamModel.collection.find({}).toArray());
}

main();
console.log(`🚀 Mongoose connected`);

// // Modified server startup
await new Promise((resolve) => httpServer.listen({ port: process.env.PORT || 4000 }, resolve)).then(console.log("Connected"));
// startStandaloneServer(server, {
//     listen: { port: 4000 },
//   }).then(({ url }) => {
//     console.log(`Server ready at ${url}`);
//   });


// Set up our Express middleware to handle CORS, body parsing,
// and our expressMiddleware function.
app.use(
    '/',
    cors(),
    bodyParser.json(),
    // expressMiddleware accepts the same arguments:
    // an Apollo Server instance and optional configuration options
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    }),
  );
  