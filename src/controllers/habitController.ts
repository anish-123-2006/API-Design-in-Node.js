import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { db } from '../db/connection.ts'
import { habits, entries, habitTags, tags } from '../db/schema.ts'
import { eq, and, desc, inArray } from 'drizzle-orm'

export const createHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, frequency, targetCount, tagIds } = req.body
    const userId = req.user!.id

    // Start a transaction for data consistency
    const result = await db.transaction(async (tx) => {
      // Create the habit
      const [newHabit] = await tx
        .insert(habits)
        .values({
          userId,
          name,
          description,
          frequency,
          targetCount,
        })
        .returning()

      // If tags are provided, create the associations
      if (tagIds && tagIds.length > 0) {
        const habitTagValues = tagIds.map((tagId: string) => ({
          habitId: newHabit.id,
          tagId,
        }))
        await tx.insert(habitTags).values(habitTagValues)
      }

      return newHabit
    })

    res.status(201).json({
      message: 'Habit created successfully',
      habit: result,
    })
  } catch (error) {
    console.error('Create habit error:', error)
    res.status(500).json({ error: 'Failed to create habit' })
  }
}

export const getUserHabits = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userHabitsWithTags = await db.query.habits.findMany({
      where: eq(habits.userId, req.user.id),
      with: {
        habitTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: [desc(habits.createdAt)],
    })

    const habitsWithTags = userHabitsWithTags.map((habit) => ({
      ...habit,
      tags: habit.habitTags.map((ht) => ht.tag),
      habitTags: undefined,
    }))

    res.json({
      habits: habitsWithTags,
    })
  } catch (error) {
    console.error('Create habit error:', error)
    res.status(500).json({ error: 'Failed to fetch habit' })
  }
}

export const updateHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id
    const { tagsIds, ...updates } = req.body

    const result = await db.transaction(async (tx) => {
      const [updateHabit] = await tx
        .update(habits)
        .set({ ...updates, updateAt: new Date() })
        .where(and(eq(habits.id, id), eq(habits.userId, req.user?.id)))
        .returning()

      if (!updateHabit) {
        return res.status(401).end()
      }

      if (tagsIds !== undefined) {
        await tx.delete(habitTags).where(eq(habitTags.habitId, id))


        if (tagsIds.length > 0) {
          const habitTagValues = tagsIds.map((tagId) => ({
            habitId: id,
            tagId,
          }))
          await tx.insert(habitTags).values(habitTagValues)
        }
      }

      return updateHabit
    })

    res.json({
      message:'habit was updated',
      habit: result,
    })
  }catch (error) {
    console.error('update habit error:', error)
    res.status(500).json({ error: 'Failed to update habit' })
  }
}