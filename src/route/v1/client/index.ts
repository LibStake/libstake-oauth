import Router from 'express';
import { RegisterClientBodyValidator } from '../../../validation/request/client';
import register from '../../../service/client/register';
import handleAsync from '../../../util/handleAsync';
import authenticate from '../../../middleware/authenticate';
import { TokenType } from '../../../entitiy/OAuthToken';

const router = Router();

/**
 * Get application information(s)
 */
router.get('/application', authenticate({ as: 'user', token_type: TokenType.ACCESS }), handleAsync(
    async (req, res, next) => {

    }
));

/**
 * Register new client
 */
router.post('/application/register', authenticate({ as: 'user', token_type: TokenType.ACCESS }),handleAsync(
    async (req, res, next) => {
        const [ err, form ] = RegisterClientBodyValidator(req.body);
        if (err) throw err;
        const createdClientInfo = await register(form!);
        res.send(await createdClientInfo.toObject({ client_id: true }));
    }
));

/**
 * Update application property incl. callbacks
 */
router.put('/application/update', authenticate({ as: 'user', token_type: TokenType.ACCESS }), handleAsync(
    async (req, res, next) => {

    }
));

/**
 * Update application callbacks only
 */
router.put('/application/update/callback', authenticate({ as: 'user', token_type: TokenType.ACCESS }), handleAsync(
   async (req, res, next) => {

   }
));

/**
 * Delete application
 */
router.delete('/application/delete', authenticate({ as: 'user', token_type: TokenType.ACCESS }), handleAsync(
    async (req, res, next) => {

    }
))

export default router;
