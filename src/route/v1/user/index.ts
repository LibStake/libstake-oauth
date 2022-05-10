import Router from 'express';
import { SignupBodyValidator } from '../../../validation/request/user';
import signup from '../../../service/user/signup';
import handleAsync from '../../../util/handleAsync';
import httpStatus from 'http-status';
import { AuthenticationType } from '../../../discrete_types';
import authenticate from '../../../middleware/authenticate';
import { TokenType } from '../../../entitiy/OAuthToken';

const router = Router();

/**
 * Get user profile
 */
router.get('/me', authenticate({ as: 'any', token_type: TokenType.ACCESS}), handleAsync(
    async (req, res, next) => {
        const auth = res.locals.authentication;
        if (!auth) return res.sendStatus(httpStatus.UNAUTHORIZED);
        const { type, identity } = auth;
        if (type === AuthenticationType.USER) {
            const user = identity;
            if (user === null) return res.sendStatus(httpStatus.UNAUTHORIZED);
            res.send(user.toObject({ registrations: true }));
        } else if (type === AuthenticationType.SERVICE_ADMIN) {
            const client = identity;

        } else throw new Error(`type === ${type}`);
    }
));


/**
 * Update user
 */
router.put('/me', authenticate({ as: 'user', token_type: TokenType.ACCESS }), handleAsync(
    async (req, res, next) => {

    }
));

/**
 * Sign up user
 */
router.post('/signup', handleAsync(
    async (req, res, next) => {
        const [ err, form ] = SignupBodyValidator(req.body);
        if (err) throw err;
        const createdUserInfo = await signup(form!);
        res.send(await createdUserInfo.toObject({ id: true }));
    }
));

/**
 * Sign out user
 */
router.delete('/signout', authenticate({ as: 'user', token_type: TokenType.ACCESS }), handleAsync(
   async (req, res, next) => {

   }
));

/**
 * Login
 */
router.post('/login', handleAsync(
    async (req, res, next) => {

    }
));

/**
 * Get Access Token Information
 */
router.get('/token_info', authenticate({ as: 'any', token_type: TokenType.ACCESS }), handleAsync(
    async (req, res, next) => {

    }
));

/**
 * Unlink user to client permanently
 */
router.post('/unlink', authenticate({ as: 'any', token_type: TokenType.ACCESS }), handleAsync(
    async (req, res, next) => {

    }
));

/**
 * Expire both tokens
 */
router.post('/logout', authenticate({ as: 'user', token_type: TokenType.ACCESS }), handleAsync(
    async (req, res, next) => {

    }
));

export default router;
