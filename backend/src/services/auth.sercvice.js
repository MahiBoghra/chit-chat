// Path: backend\src\services\auth.sercvice.js
import "dotenv/config";
import bcrypt from "bcrypt";


import { db } from "../db/db.js";
import {users} from "../db/schema/user.js";
import { eq } from "drizzle-orm";

const salt = Number(process.env.SALT_ROUNDS);

const hashFunction = async(rawPassword) => {
    const hash = await bcrypt.hash(rawPassword, salt);
    return hash;
}




export const signUp = async (userData) => {
    const { username, email, password } = userData;
    
    if(!username || !email || !password){
        throw new Error("email and password should be correct");
    }

    const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email));


    if(existingUser.length > 0){
        throw new Error("user already exists!");

    }

    const hashedPassword = await hashFunction(password);

    //create a new user

    const userAdd = await db.insert(users).values({username , email , password : hashedPassword}).returning();

    if(userAdd.length === 0){
        throw new Error("cannot add new user!");
    }
    
    const { password, ...userWithoutPassword } = userAdd[0];

return userWithoutPassword;

};
