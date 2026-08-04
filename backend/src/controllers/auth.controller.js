// Path: backend\src\controllers\auth.controller.js
import * as authService from "../services/auth.service.js";
import { loginSchema, signupSchema } from "../dto/auth.dto.js";
import ApiError from "../utils/ApiError.js";

const signUp = async (req, res, next) => {
    try {
        // Validate request body
        const { value, error } = signupSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessageList = error.details.map((detail) => detail.message);
            throw new ApiError(400, "Validation failed", errorMessageList);
        }

        const user = await authService.signUp(value);

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user
        });
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        // Validate request body
        const { value, error } = loginSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessageList = error.details.map((detail) => detail.message);
            throw new ApiError(400, "Validation failed", errorMessageList);
        }

        const user = await authService.login(value);

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user
        });
    } catch (err) {
        next(err);
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const excludeUserId = Number(req.query.exclude_id);
        if (!excludeUserId) {
            throw new ApiError(400, "exclude_id query parameter is required.");
        }
        const usersList = await authService.getAllUsers(excludeUserId);
        return res.status(200).json({
            success: true,
            users: usersList
        });
    } catch (err) {
        next(err);
    }
};

export { signUp, login, getAllUsers };



