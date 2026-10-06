import {pathToFileURL} from 'node:url'
import {db} from './connection.ts'
import {users, habits,entries, tags, habitTags} from './schema.ts'

const seed= async()=>{
    console.log('staring databse seed...')

    try{
        console.log('clearing existing data...')
        await db.delete(entries)
        await db.delete(habitTags)
        await db.delete(habits)
        await db.delete(tags)
        await db.delete(users)
        console.log('creating demo users...')
        const [demoUser]= await db
        .insert(users)
        .values({
            email: 'demo@app.com',
            password:'password',
            firstName:'demo',
            lastName:'person',
            username:'demo',
            
        })
        .returning();

console.log('creating tags...')
const [healthTag]= await db.insert(tags)
.values({
    name:'health',
    color:'#f0f0f0'
})
.returning();

const [exercisehabit]=await db
.insert(habits)
.values({
    userId:demoUser.id,
    name: 'exercise',
    description: 'daily workout',
    frequency:'daily',
    targetCount: 1,
})
.returning();

await db.insert(habitTags).values({
    habitId: exercisehabit.id,
    tagId: healthTag.id,
})

console.log('adding completion entries...')
const today=new Date()
today.setHours(12,0,0,0)

for(let i=0;i<7;i++){
    const date=new Date(today)
    date.setDate(date.getDate()-i)
    await db.insert(entries).values({
    habitId: exercisehabit.id,
    completion_date: date,
})
}
console.log('DB seeded successfully')
  console.log(`user credentials:`)
  console.log(`email:${demoUser.email}`)
  console.log(`username: ${demoUser.username}`)
  console.log(`password: ${demoUser.password}`)
    }
    catch(e){
     console.error('seed failed',e);
     process.exit(1);   
    }
}

if(process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href){
    seed()
    .then(()=> process.exit(0))
    .catch((e)=> process.exit(1))
}

export  default seed