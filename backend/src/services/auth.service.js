// Path: backend/src/services/auth.service.js
import "dotenv/config";
import bcrypt from "bcrypt";
import { db } from "../db/db.js";
import { users } from "../db/schema/user.js";
import { eq } from "drizzle-orm";
import { refreshTokens } from "../db/schema/refreshToken.js";
import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import ApiError from "../utils/ApiError.js";

const salt = Number(process.env.SALT_ROUNDS);

const hashFunction = async (rawPassword) => {
    const hash = await bcrypt.hash(rawPassword, salt);
    return hash;
};

const hashRefreshToken = (token) => {
    return createHash('sha256').update(token).digest('hex');
};

export const signUp = async (userData) => {
    const { username, email, password } = userData;
    
    if (!username || !email || !password) {
        throw new ApiError(400, "Username, email and password are required.");
    }

    // Email already normalized by Joi lowercase()/trim() in the controller
    const existingUser = await db
        .select({ id: users.id, username: users.username, email: users.email })
        .from(users)
        .where(eq(users.email, email));

    if (existingUser.length > 0) {
        throw new ApiError(409, "User already exists!");
    }

    const hashedPassword = await hashFunction(password);

    // Create a new user
    const userAdd = await db
        .insert(users)
        .values({ username, email: email.trim(), password: hashedPassword })
        .returning({ id: users.id, username: users.username, email: users.email });

    if (userAdd.length === 0) {
        throw new ApiError(500, "Cannot add new user!");
    }

    // Generate refresh token for new user
    const familyId = createHash('sha256').update(require('crypto').randomBytes(16)).digest('hex');
    const rawRefreshToken = require('crypto').randomBytes(32).toString('hex');
    const tokenHash = hashRefreshToken(rawRefreshToken);

    await db.insert(refreshTokens).values({
        userId: userAdd[0].id,
        tokenHash,
        familyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: '',
        ip: '',
    });

    return userAdd[0];
};

export const login = async (loginData) => {
    const { email, password } = loginData;

    // Email already normalized by Joi in the controller
    const userResult = await db
        .select({ id: users.id, username: users.username, email: users.email, password: users.password })
        .from(users)
        .where(eq(users.email, email));

    if (userResult.length === 0) {
        throw new ApiError(401, "Invalid email or password.");
    }

    const user = userResult[0];

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new ApiError(401, "Invalid email or password.");
    }

    // Generate access token (15 min expiry)
    const accessToken = jwt.sign(
        { sub: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    // Generate refresh token
    const familyId = createHash('sha256').update(require('crypto').randomBytes(16)).digest('hex');
    const rawRefreshToken = require('crypto').randomBytes(32).toString('hex');
    const tokenHash = hashRefreshToken(rawRefreshToken);

    // Revoke old refresh tokens for this user (same family)
    await db
        .delete(refreshTokens)
        .where(
            eq(refreshTokens.userId, user.id)
        );

    // Store new refresh token
    await db.insert(refreshTokens).values({
        userId: user.id,
        tokenHash,
        familyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: '',
        ip: '',
    });

    return {
        user: { id: user.id, username: user.username, email: user.email },
        accessToken,
        refreshToken: rawRefreshToken,
        familyId,
    };
};