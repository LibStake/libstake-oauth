import Router, { Request } from 'express';
import type { AccessCodeGrantQuery, GetTokenBody } from '../../../validation/request/oauth';
import { AccessCodeGrantValidator, GetTokenBodyValidator } from '../../../validation/request/oauth';

const router = Router();

/**
 * Authorize user for access code grant
 */
router.get('/authorize', (req: Request<{}, any, any, AccessCodeGrantQuery>, res ,next) => {
    const [ err, query ] = AccessCodeGrantValidator(req.query);
    if (err) throw err;
});

/**
 * Get token(s) via access code or refresh token
 * Use different authenticate method by itself
 */
router.post('/token', (req: Request<{}, any, GetTokenBody, any>, res, next) => {
    const [ err, body ] = GetTokenBodyValidator(req.body);
    if (err) throw err;
});

export default router;
