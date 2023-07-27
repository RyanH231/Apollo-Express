import {expressMiddleware} from "@apollo/server/express4"
import { ApolloServer } from "@apollo/server"
import {ApolloServerPluginDrainHttpServer} from "@apollo/server/plugin/drainHttpServer"
import  bodyParser  from "body-parser"
import http from "http"
import cors from "cors"
import express from "express"

const app = express();
const httpServer = http.createServer(app);

let teams = [
    {
        id:1,
        name: "Colorado Avalanche",
        year: 2022
    },
    {
        id:2,
        name: "Tampa Bay Lightning",
        year: 2021
    },
    {
        id:3,
        name: "Tampa Bay Lightning",
        year: 2020
    }
]

const typeDefs = `#graphql
    type WinningTeams
    {
        id: Int,
        name: String,
        year: Int
    }

    type Query
    {
        getTeams: [WinningTeams]
        GetLastTeamID: Int
    }

    type Mutation
    {
        AddTeam(id:ID, name:String, year:String) : Int
    }
`


const resolvers = {
    Query: {
        getTeams: () => teams,
        GetLastTeamID: () => teams[teams.length-1].id
    },
    Mutation: {
        AddTeam: (_, args)=>
        {
            let newTeam = {
                id:args.id,
                name:args.name,
                year:args.year
            }

            teams.push(newTeam);
            return newTeam.id;
        }
    }

}

// Same ApolloServer initialization as before, plus the drain plugin
// for our httpServer.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
// Ensure we wait for our server to start
await server.start();

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

// Modified server startup
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/`);



