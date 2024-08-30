import { Router } from 'express';
import { register, login, getUserDetails } from '../controllers/userController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/user', authenticateJWT, getUserDetails);

export { router as userRouter };