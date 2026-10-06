// custom-env does not publish TypeScript declarations.
// @ts-expect-error — the package's `env` function is used at runtime.
import { env as loadEnv } from 'custom-env'
import { z } from 'zod';

/*
* what is zod?
its typescript, but at runtime.

for example, we fetch an data from an api, so typescript cant check the incoming data , like we exapect age to be a number, but api send it as string so typescript cant detact that 

but zod can check actual values at the exact moment they try to enter your system
for that we build a "runtime schema" just like "interface" in typescript

*use case here:
If your app requires a database URL to function, TypeScript can't check if that URL was actually configured on the deployment server. If you use Zod to validate your environment variables when the app boots up, Zod will immediately crash the app and say "Hey, you forgot to provide the DATABASE_URL!" rather than letting the app start and randomly fail when a user tries to log in.

*/

process.env.APP_STAGE = process.env.APP_STAGE || 'dev'

/*
what is APP_STAGE?
app_stage is custom env that keep track of where the applcation is currently running - on local machine ,on staging server , in production

NODE_ENV-> most developer use standard node_env env to check this

but If you have a "staging" server (a server used for testing before going live), you still want it to run with all those performance optimizations. Therefore, your staging server should also have NODE_ENV set to production.
Because of this, NODE_ENV becomes useless for telling your code, "Hey, we are in staging right now, please use the staging database instead of the real one."
*so in this project->
NODE_ENV handles performance (usually just set to production).
APP_STAGE handles app logic (can be set to dev, staging, production, etc.).
*/


//Phase 1: Pre-Validation (Internal Use)
//they are boolean In JavaScript and TypeScript, anytime you use a comparison operator (like ===, !==, >, or <), the language evaluates that expression and immediately returns either true or false. 
const isProduction = process.env.APP_STAGE === 'production';
const isDevelopment = process.env.APP_STAGE === 'dev';
const isTesting = process.env.APP_STAGE === 'test';
/*
The Purpose: He uses these booleans purely internally within env.ts to figure out which file to load from the hard drive.

If isDevelopment is true -> Load .env
If isTesting is true -> Load .env.test
If isProduction is true -> Do not load any file (rely on server variables).
*/

if (isDevelopment) {
    loadEnv() // loads .env
} else if (isTesting) {
    loadEnv('test')// loads .env.test
}

//setting schmea for env , so zod can check we expect this schema from env 
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    APP_STAGE: z.enum(['dev', 'test', 'production']).default('dev'),

    PORT: z.coerce.number().positive().default(3000),
    // env are always read as strings by default,eg "8080", .coerace tells zod to force that string into js number bfeore checks

    DATABASE_URL: z.string().url().startsWith('postgresql://'),
    JWT_SECRET: z.string().min(32, 'must be 32 chars long'/*custon error msg */),
    JWT_EXPIRES_IN: z.string().default('7d'),
    BCRYPT_ROUNDS: z.coerce.number().min(10).max(20).default(12),
})

//* one of the most powerful feture of zod
export type Env = z.infer<typeof envSchema>
//Instead of manually writing a TypeScript interface or type from scratch, z.infer automatically looks at your Zod schema (like the rules you set for PORT, NODE_ENV, etc.) and generates the exact corresponding TypeScript type for you.

/*
The "Single Source of Truth" Benefit
He emphasizes that this eliminates the need to maintain duplicate code. If you didn't use z.infer, you would have to write:

A Zod schema (for runtime checking).

A TypeScript interface (for development/build-time checking).

If you added a new environment variable later, you would have to update both places. By using z.infer, you get both dev-time autocomplete and runtime validation from just one single schema.
 */

let env: Env

try {
    env = envSchema.parse(process.env);
} catch (e) {
    if (e instanceof z.ZodError) {

        console.log('invalid env var');
        console.error(JSON.stringify(e.flatten().fieldErrors, null, 2));
        //fielderros, the custom errors we hve put in our scehma like "must be 32 chars long"

        e.issues.forEach((err) => {
            const path = err.path.join('.')
            console.log(`${path}:${err.message}`)
        })
        process.exit(1);//stops the server,1->closed with error,0->closed without error
    }
    throw e
}
//helper functions
// Phase 2: Post-Validation (External Use)
export const isProd = () => env.APP_STAGE === 'production'
export const isDev = () => env.APP_STAGE === 'dev'
export const isTest = () => env.APP_STAGE === 'test'
//hese are the functions he exports to be used by the rest of the application.

/*
why did we made this helper functions
Single Source of Truth: He specifically mentions in the transcript, "I don't wanna have to write this every single time this is gross because like what if this changes?" If you later decide to change the string from 'production' to 'prod', you only have to update it inside this one helper function. If you didn't have this function, you would have to do a massive "find and replace" across your entire codebase.

Avoiding Repetition (DRY): Checking the environment is something you do constantly in a backend app (e.g., "If we are in dev, log this error; if in prod, hide it"). These functions prevent you from typing env.APP_STAGE === 'something' over and over again.
*/

export { env }
export default env

/*
!QnA
how does the loadenv() set our envirnonmt vaible to be used in code?

ehrn you call load env() it reads the file and set the process.env
eg-> process.env.DATABASE_URL = "whatever_was_in_the_file";
*/