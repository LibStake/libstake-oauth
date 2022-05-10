import Router from 'express';

import webStandard from "./web_standard";
import userRouter from './user';
import clientRouter from './client';
import oauthRouter from './oauth';

const router = Router();

router.use('/v1/user', userRouter);
router.use('/v1/oauth', oauthRouter);
router.use('/v1/client', clientRouter);
router.use(webStandard);


export default router;
