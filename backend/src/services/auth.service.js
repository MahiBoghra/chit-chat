// Path: backend\src\services\auth.service.js
import "dotenv/config";
import bcrypt from "bcrypt";
import { db } from "../db/db.js";
import { users } from "../db/schema/user.js";
import { eq } from "drizzle-orm";
import ApiError from "../utils/ApiError.js";

const salt = Number(process.env.SALT_ROUNDS);

const hashFunction = async (rawPassword) => {
    const hash = await bcrypt.hash(rawPassword, salt);
    return hash;
}

export const signUp = async (userData) => {
    const { username, email, password } = userData;
    
    if (!username || !email || !password) {
        throw new ApiError(400, "Username, email and password are required.");
    }

    const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

    if (existingUser.length > 0) {
        throw new ApiError(409, "User already exists!");
    }

    const hashedPassword = await hashFunction(password);

    // Create a new user
    const userAdd = await db
        .insert(users)
        .values({ username, email, password: hashedPassword })
        .returning();

    if (userAdd.length === 0) {
        throw new ApiError(500, "Cannot add new user!");
    }
    
    const { password: _, ...userWithoutPassword } = userAdd[0];

    return userWithoutPassword;
};

export const login = async (loginData) => {
    const { email, password } = loginData;

    // Retrieve user from DB
    const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

    if (userResult.length === 0) {
        throw new ApiError(404, "User not found.");
    }

    const user = userResult[0];

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new ApiError(401, "Invalid email or password.");
    }

    // Exclude password from the returned object
    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
};


