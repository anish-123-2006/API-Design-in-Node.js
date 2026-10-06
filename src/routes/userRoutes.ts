import { Router } from "express";
import { authenticationToken } from "../middleware/auth.ts";

 const router=Router()
router.use(authenticationToken);// every route below this have to pass through this

 router.get('/',(req,res)=>{
    res.json({message:'users'})
 })
 router.get('/:id',(req,res)=>{
    res.json({message:'got user'})
 })
 router.put('/put',(req,res)=>{
    res.json({message:'user updated'})
 })
 router.delete('/:id',(req,res)=>{
    res.json({message:'deleted user'})
 })
 export default router