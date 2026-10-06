import type { Request, Response } from "express";
import bcrypt from 'bcrypt';
import { db } from '../db/connection.ts';
import { users, type NewUser } from '../db/schema.ts'
import { error } from "console";
import { generateToken } from "../utils/jwt.ts";
import { comparePasswords, hashPassword } from "../utils/passwords.ts";
import { eq } from "drizzle-orm";


export const register = async (req: Request<any, NewUser>, res: Response) => {
    try {
        const { email, username, password, firstName, lastName } = req.body
        const hashedPassword = await hashPassword(password)
        //inserting into db
        const [user] = await db.insert(users).values({
            ...req.body,
            password: hashedPassword,
        })
            .returning({
                id: users.id,
                email: users.email,
                username: users.username,
                firstName: users.firstName,
                lastName: users.lastName,
                createdAt: users.createdAt,
            })

        //generating token
        const token = await generateToken({
            id: user.id,
            email: user.email,
            username: user.username,
        })

        return res.status(201).json({
            message: 'user created',
            user,
            token,
        })

    } catch (e) {
        console.log('registration error', e)
        res.status(500).json({ error: 'failed to create user' })
    }
}

export const logging = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        })
        if (!user) {
            return res.status(401).json({ error: 'invalid credentials' })
        }
        const isValidatedPassword = await comparePasswords(password, user.password)
        if (!isValidatedPassword) {
            return res.status(401).json({ error: 'ivalid credentials' })
        }
        const token = await generateToken({
            id: user.id,
            email: user.email,
            username: user.username,
        })

        return res.json({
            message: 'login success',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                createdAt: user.createdAt,
            },
            token,
        }).status(201)

    } catch (e) {
        console.error('looging error',e)
        res.status(500).json({error:'failed to login'})

    }
}


