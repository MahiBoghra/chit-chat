// Path: backend/src/controllers/auth.controller.js
import { Router } from 'express';
import * as authService from '../services/auth.service.js';
import * as jwtService from '../utils/jwt.js';
import { signupSchema, loginSchema } from '../dto/auth.dto.js';
import { db } from '../db/db.js';
import { refreshTokens } from '../db/schema/refreshToken.js';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import ApiError from '../utils/ApiError.js';

// Sign Up handler
export const signUp = async (req, res, next) => {
    try {
        const result = await authService.signUp(req.body);

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: result
        });
    } catch (err) {
        next(err);
    }
};

// Login handler
export const login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);

        return res.json({
            success: true,
            message: "User logged in successfully",
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        });
    } catch (err) {
        next(err);
    }
};

// Refresh token handler
export const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new ApiError(400, 'Refresh token is required.');
        }

        try {
            const decoded = jwtService.verifyRefreshToken(refreshToken);

            // Check if refresh token exists and is valid in DB
            const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
            const existingToken = await db
                .select()
                .from(refreshTokens)
                .where(eq(refreshTokens.tokenHash, tokenHash));

            if (existingToken.length === 0) {
                throw new ApiError(401, 'Invalid or expired refresh token.');
            }

            // Check if token is revoked
            if (existingToken[0].revokedAt) {
                throw new ApiError(401, 'Refresh token has been revoked.');
            }

            // Check if token is expired
            if (new Date(existingToken[0].expiresAt) < new Date()) {
                throw new ApiError(401, 'Refresh token has expired.');
            }

            // Issue new access token
            const newAccessToken = jwtService.signAccessToken(decoded.sub, decoded.email);

            // Issue new refresh token (rotation - invalidate old one)
            const newRawRefreshToken = crypto.randomBytes(32).toString('hex');
            const newTokenHash = crypto.createHash('sha256').update(newRawRefreshToken).digest('hex');
            const newFamilyId = crypto.createHash('sha256').update(crypto.randomBytes(16)).digest('hex');

            await db
                .update(refreshTokens)
                .set({
                    tokenHash: newTokenHash,
                    familyId: newFamilyId,
                    revokedAt: new Date(),
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                })
                .where(eq(refreshTokens.tokenHash, existingToken[0].tokenHash));

            return res.json({
                success: true,
                message: 'Token refreshed successfully',
                accessToken: newAccessToken,
                refreshToken: newRawRefreshToken,
            });
        } catch (err) {
            if (err.message === 'JsonWebTokenError' || err.message === 'TokenExpiredError') {
                throw new ApiError(401, 'Invalid or expired refresh token.');
            }
            throw err;
        }
    } catch (err) {
        next(err);
    }
};

// Logout handler
export const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.json({ success: true, message: 'Logged out successfully.' });
        }

        // Invalidate the refresh token
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        await db
            .update(refreshTokens)
            .set({ revokedAt: new Date() })
            .where(eq(refreshTokens.tokenHash, tokenHash));

        return res.json({ success: true, message: 'Logged out successfully.' });
    } catch (err) {
        next(err);
    }
};

// Logout all handler
export const logoutAll = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

            await db
                .update(refreshTokens)
                .set({ revokedAt: new Date() })
                .where(eq(refreshTokens.tokenHash, tokenHash));
        }

        return res.json({ success: true, message: 'All sessions invalidated.' });
    } catch (err) {
        next(err);
    }
};