import express from 'express'
import authRoutes from './routes/authRoutes.ts'
import userRoutes from './routes/userRoutes.ts'
import habitRoutes from './routes/habitRoutes.ts'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import { isTest } from '../env.ts'
const app = express()
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan('dev', {
    skip: () => isTest(),
  })
)


app.get('/health', (req, res) => {
  res.send('<button>click</button>')
})

//*mount routers
app.use('/api/auth', authRoutes) //Whenever a request starts with /api/auth, send it to authRouter.
/*
It doesn't care whether the request is:
GET
POST
PUT
DELETE
*/
app.use('/api/users', userRoutes)
app.use('/api/habits', habitRoutes)


export { app }

export default app
