import express, { Express } from "express"
import { createHandler } from 'graphql-http/lib/use/express'
import { buildSchema } from 'graphql';
import playground from 'graphql-playground-middleware-express'
import cors from 'cors'

const baseURL = process.env.BASE_URL
const apiKey = process.env.MOVIE_API_KEY
const schema = buildSchema(`
  type Movie {
    id: String
    title: String
    poster_path: String
    overview: String
    release_date: String
  }
  type Trailer {
    key: String
  }
  type Query {
    movies(page: Int, category: String): [Movie]
    movie(id: String): Movie
    trailers(id: String): [Trailer]
    search(query: String): [Movie]
  }
`)

const resolver = {
  async movies({ page, category }: { page: number, category: string }) {
    const res = await fetch(`${baseURL}/${category}?api_key=${apiKey}&language=en-US&page=${page}`)
    const data = await res.json()
    return data.results
  },
  async movie({ id }: { id: string }) {
    const res = await fetch(`${baseURL}/${id}?api_key=${apiKey}&language=en-US&page=1`)
    const data = await res.json()
    return data
  },
  async trailers({ id }: { id: string }) {
    const res = await fetch(`${baseURL}/${id}/videos?api_key=${apiKey}&language=en-US`)
    const data = await res.json()
    return data.results
  },
  async search({ query }: { query: string }) {
    console.log('QUERY: ', query)
    const searchURL = "https://api.themoviedb.org/3/search/movie"
    const res = await fetch(`${searchURL}?api_key=${apiKey}&language=en-US&query=${query}&page=1&include_adult=false`)
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

export default app