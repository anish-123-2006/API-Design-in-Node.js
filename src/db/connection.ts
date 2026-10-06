import { drizzle } from "drizzle-orm/node-postgres";
// @ts-expect-error: pg is used at runtime, but its declarations are unavailable in this project.
import {Pool} from 'pg';
import * as schema from './schema.ts'
import {env,isProd} from '../../env.ts'
import { remember } from "@epic-web/remember";


const createPool=()=>{
    return new Pool({
        connectionString: process.env.DATABASE_URL,
    })
}

let client

if (isProd()){
    client = createPool()
}else{
    client= remember('dbPool', () => createPool())

}


export const db=drizzle({client,schema})

export default db