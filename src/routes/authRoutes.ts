import { Router } from "express";
import { logging, register } from "../controllers/authController.ts";
import { validateBody } from "../middleware/validation.ts";
import { insertUserSchema } from "../db/schema.ts";
import z from "zod";


const loginSchema=z.object({
    email:z.email('invalied email'),
    password: z.string().min(1,'password is required'),
})

const router=Router();

// router.post('/register',(req,res)=>{
//     res.status(201).json({message:'user signed up'});
// })
router.post('/register', validateBody(insertUserSchema), register)


// router.post('/login',(req,res)=>{
//     res.status(201).json({message:'user logged in'})
// })

router.post('/login',validateBody(loginSchema),logging)
export default router