import Router from 'express';
import path from 'path';
import { PUBLIC_PATH } from '../../config/path'

const router = Router();

router.get('/favicon.ico', (req, res) => res.sendFile(path.join(PUBLIC_PATH, 'favicon.ico')));
router.get('/robot.txt', (req, res) => res.sendFile(path.join(PUBLIC_PATH, 'robot.txt')));

export default router;
