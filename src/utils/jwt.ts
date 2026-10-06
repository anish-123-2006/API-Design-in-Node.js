import { createSecretKey } from "crypto";
import { jwtVerify, SignJWT } from "jose";
import env from "../../env.ts";

export interface JwtPayload{
    id: string
    email: string
    username: string
}

export const generateToken=(payload:JwtPayload)=>{
    const secret=env.JWT_SECRET
    const secretkey=createSecretKey(secret,'utf-8')

    return new SignJWT(payload)
    .setProtectedHeader({alg:'HS256'})
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN || '7d')
    .sign(secretkey)  // so this whole returns a string which is `signed json web token`
}

export const verifyToken= async (token: string): Promise<JwtPayload>=>{
    const secretKey=createSecretKey(env.JWT_SECRET,'utf-8')
    const {payload}=await jwtVerify(token, secretKey)

    return payload as unknown as JwtPayload
}
