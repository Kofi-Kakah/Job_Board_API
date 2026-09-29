import express from "express"

import { signup, login, logout } from "../controllers/auth.controllers.js";
import { authenticate } from "../middleware/auth.middleware.js";

const authRoutes = express.Router()

authRoutes.post("/signup",signup)
authRoutes.post("/login",login)
authRoutes.post("/logout", authenticate, logout)

export default authRoutes;
