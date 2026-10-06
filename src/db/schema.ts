import {
 pgTable,// for defining table
 uuid,// for defining unique id
 varchar,
 text,
 timestamp,
 boolean,
 integer,   
} from 'drizzle-orm/pg-core'

import {relations}from 'drizzle-orm' // for defining the relationship between tables

import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

export const users=pgTable('users',{
    id:uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', {length:255}).notNull().unique(),
    username: varchar('username',{length:50}).notNull().unique(),
    password: varchar('password',{length:255}).notNull(),
    firstName: varchar('first_name',{length:50}),
    lastName: varchar('last_name',{length:50}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updateAt: timestamp('upadted_at').defaultNow().notNull(),
})

export const habits=pgTable('habits',{
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(()=>users.id,{onDelete:'cascade'}).notNull(),// forigen key
    name: varchar('name',{length:100}).notNull(),
    description: text('description'),
    frequency: varchar('frequecny',{length:20}).notNull(), //Frequency System: Flexible habit scheduling (daily/weekly/monthly)
    targetCount: integer('target_count').default(1),//Target Count: Support habits like "drink 8 glasses of water daily"
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updateAt: timestamp('upadted_at').defaultNow().notNull(),
    })


    // Habit entries - individual completions
export const entries = pgTable('entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  habitId: uuid('habit_id')
    .references(() => habits.id, { onDelete: 'cascade' })
    .notNull(),
  completion_date: timestamp('completion_date').defaultNow().notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Tags table - categorization system
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  color: varchar('color', { length: 7 }).default('#6B7280'), // hex color
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Junction table for many-to-many relationship
// the job of this table is just to join two keys together and create its own key.

export const habitTags= pgTable('habitTags',{
    id: uuid('id').primaryKey().defaultRandom(),
     habitId: uuid('habit_id')
    .references(() => habits.id, { onDelete: 'cascade' })
    .notNull(),
     tagId: uuid('tag_id')
    .references(() => tags.id, { onDelete: 'cascade' })
    .notNull(),

})

// defining drizzle relation
// habits are the "many" side and users are the "one" side

export const userRelations= relations(users,({many})=>({
  habits:many(habits),//creates a field that returns all habits for that user
}))

export const habitsRelations=relations(habits,({one,many})=>({
user: one(users,{ // it create a new column in habits table called user
  fields: [habits.userId],
  references: [users.id],
}),// creates a field that returns the single user, specifying the foreign key field on habits (userId) that references the id field on users.
entries: many(entries),
habitTags: many(habitTags),
}))

export const extriesRelations= relations(entries,({one})=>({
  habit: one (habits,{
    fields: [entries.habitId],
    references:[habits.id],
  })
}))

export const tagsRelations=relations(tags,({many})=>({
  habitTags:many(habitTags),
}))

export const habitTagsRelations=relations(habitTags,({one})=>({
  habit: one(habits,{
    fields: [habitTags.habitId],
    references:[habits.id]
  }),
  tag:one(tags,{
    fields:[habitTags.tagId],
    references:[tags.id],
  }),
}))


// creating zod schema
export type User= typeof users.$inferSelect
export type Habit= typeof habits.$inferSelect
export type Entry= typeof entries.$inferSelect
export type Tag= typeof tags.$inferSelect
export type HabitTag= typeof habitTags.$inferSelect

export type NewUser= typeof users.$inferInsert


export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)

