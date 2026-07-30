// Path: backend\src\controllers\auth.controller.js
import * as authService from "../services/auth.service.js";


const signUp = async(req,res , next)=>{
    
    try {
    const user = await authService.signUp(req.body);

    return res.status(201).json({
        success: true,
        message: "User created successfully",
        user
    });
} catch (err) {
    next(err);
}
};




export { signUp };
