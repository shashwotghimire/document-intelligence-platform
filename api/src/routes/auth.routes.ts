import { Router } from "express";
import {
  blockUser,
  getAllUsers,
  getUser,
  githubCallback,
  githubLogin,
  loginUser,
  registerUser,
  unblockUser,
  updateProfile,
  verifyEmail,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
  loginUserSchema,
  registerUserSchema,
  updateProfileSchema,
} from "../validation/auth.validation";
import { rolesGuard } from "../middlewares/roles.middleware";

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication, profile, and user administration
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: Shiva
 *               email:
 *                 type: string
 *                 format: email
 *                 example: shiva@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: secret123
 *     responses:
 *       201:
 *         description: User registered and verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       nullable: true
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email already exists
 */
router.post("/register", validate(registerUserSchema), registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: shiva@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/AuthUser'
 *                         token:
 *                           type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account blocked or email not verified
 */
router.post("/login", validate(loginUserSchema), loginUser);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AuthUser'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: User not found
 */
router.get("/me", authMiddleware, getUser);

/**
 * @swagger
 * /api/auth/profile:
 *   patch:
 *     summary: Update the authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: Shiva Updated
 *               currentPassword:
 *                 type: string
 *                 example: oldsecret
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: newsecret
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: User not found
 */
router.patch(
  "/profile",
  authMiddleware,
  validate(updateProfileSchema),
  updateProfile,
);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verify an email address
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully or already verified
 *       400:
 *         description: Invalid or already used verification token
 */
router.get("/verify", verifyEmail);

/**
 * @swagger
 * /api/auth/block/{userId}:
 *   patch:
 *     summary: Block a user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User blocked successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: User not found
 */
router.patch("/block/:userId", authMiddleware, rolesGuard("admin"), blockUser);

/**
 * @swagger
 * /api/auth/unblock/{userId}:
 *   patch:
 *     summary: Unblock a user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User unblocked successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: User not found
 */
router.patch(
  "/unblock/:userId",
  authMiddleware,
  rolesGuard("admin"),
  unblockUser,
);

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: List users
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by name
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         users:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/User'
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get("/users", authMiddleware, rolesGuard("admin"), getAllUsers);

// github

router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);

export default router;
