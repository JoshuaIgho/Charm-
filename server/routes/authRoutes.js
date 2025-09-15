import express from "express";
import { loginAdmin, googleAdminLogin } from "../controllers/adminController.js";

const router = express.Router();

// POST /api/auth/admin/login
router.post("/admin/login", loginAdmin);

// POST /api/auth/admin/google
router.post("/admin/google", googleAdminLogin);

export default router;
