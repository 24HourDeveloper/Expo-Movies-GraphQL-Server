import express, { Express, Request, Response } from "express"
import { createHandler } from 'graphql-http/lib/use/express'
import { buildSchema } from 'graphql';
import playground from 'graphql-playground-middleware-express'
import cors from 'cors'

const baseURL = process.env.BASE_URL
const apiKey = process.env.MOVIE_API_KEY
const schema = buildSchema(`
  type Movie {
    id: String
    poster_path: String
  }
  type Query {
    movies(page: Int, category: String): [Movie]
  }  
`)

const resolver = {
  async movies({ page, category }: { page: number, category: string }) {
    const res = await fetch(`${baseURL}/${category}?api_key=${apiKey}&language=en-US&page=${page}`)
    const data = await res.json()
    return data.results
  }
}

const app: Express = express()
const port = 4000
app.use(cors())

app.all('/graphql', createHandler({
  schema,
  rootValue: resolver
}))

app.get('/playground', playground({ endpoint: '/graphql'}))

app.listen(port, () => console.log(`Server is running on port ${port}`))