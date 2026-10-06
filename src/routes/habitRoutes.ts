import { Router } from "express";
import { validateBody, validateParams } from "../middleware/validation.ts";
import z from "zod/v3";
import { authenticationToken } from "../middleware/auth.ts";
import {
    createHabit,
    getUserHabits,
    updateHabit,
} from "../controllers/habitController.ts";



const createHabitSchema=z.object({
    name:z.string(),
    description:z.string().optional(),
    frequency:z.string(),
    targetCount:z.number(),
    tagIds: z.array(z.string()).optional(),
})

const completeParamsSchema=z.object({
    id:z.string().max(3),
})

const router=Router();

router.use(authenticationToken);// every route below this have to pass through this

// router.get('/',(req,res)=>{
//     res.json({message: 'habits'});
// })

router.get('/',getUserHabits)

router.patch('/:id',updateHabit)

router.get('/:id',(req,res)=>{
    res.json({message:'got one habbit'});
})

router.post('/', validateBody(createHabitSchema), createHabit)

router.delete('/:id',(req,res)=>{
    res.json({message:'deleted habbit'});
})

router.post('/:id/complete',validateParams(completeParamsSchema),validateBody(createHabitSchema),(req,res)=>{
    res.json({message:'completed habit'}).status(201)
})
export default router