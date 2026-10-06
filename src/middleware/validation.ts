import type { Request,Response,NextFunction } from "express";
import { type ZodSchema,ZodError } from "zod/v3";

export const validateBody=(schema:ZodSchema)=>{//The function takes a schema.It returns a middleware function:(hence its hifheer order function)
    return(req: Request,res: Response,next:NextFunction)=>{
        try{
            const validatedData= schema.parse(req.body)
            req.body=validatedData//putting the validated data back to into req.body
// This might seem unnecessary at first.Why not just call next()?Because Zod can transform the input.For example, your schema could have defaults or coercions.so zod trnsform and validated the data            
            next()
        }catch(e){
            if(e instanceof ZodError){
                return res.status(400).json({
                    error: 'validation failed',
                    details:e.issues.map((err)=>({
                        field:err.path.join(','),
                        message:err.message,
                    })),
                })
               
            }
             next(e);// if its not a zod error
        }
    }
}


export const validateParams=(schema:ZodSchema)=>{
    return(req: Request,res: Response,next:NextFunction)=>{
        try{
           schema.parse(req.params)
           next()
        }catch(e){
            if(e instanceof ZodError){
                return res.status(400).json({
                    error: 'invalid Params',
                    deatils:e.issues.map((err)=>({
                        field:err.path.join(','),
                        message:err.message,
                    })),
                })
               
            }
             next(e);
        }
    }
}
export const validateQuery=(schema:ZodSchema)=>{
    return(req: Request,res: Response,next:NextFunction)=>{
        try{
           schema.parse(req.query)
           next()
        }catch(e){
            if(e instanceof ZodError){
                return res.status(400).json({
                    error: 'invalid query',
                    deatils:e.issues.map((err)=>({
                        field:err.path.join(','),
                        message:err.message,
                    })),
                })
               
            }
             next(e);
        }
    }
}