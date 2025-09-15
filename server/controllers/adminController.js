import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { findAdminByEmail } from "../models/adminModel.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT
function generateToken(admin) {
  return jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

// Admin email/password login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await findAdminByEmail(email);
    if (!admin) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = generateToken(admin);
    res.json({ success: true, token, admin });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin Google login
export const googleAdminLogin = async (req, res) => {
  const { idToken } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    const admin = await findAdminByEmail(email);
    if (!admin) return res.status(401).json({ success: false, message: "Not an admin" });

    const token = generateToken(admin);
    res.json({ success: true, token, admin });
  } catch (err) {
    console.error("Google admin login error:", err);
    res.status(400).json({ success: false, message: "Google verification failed" });
  }
};


