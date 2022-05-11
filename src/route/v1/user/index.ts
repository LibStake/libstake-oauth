import Router from 'express';
import {
    GetUserInfoQuery,
    GetUserInfoQueryValidator,
    LoginBodyValidator,
    SignupBodyValidator,
    UnlinkBodyValidator,
    UpdateUserInfoBodyValidator
} from '../../../validation/request/user';
import signup from '../../../service/user/signup';
import handleAsync from '../../../util/handleAsync';
import httpStatus from 'http-status';
import { AuthenticationType } from '../../../discrete_types';
import authenticate from '../../../middleware/authenticate';
import OAuthToken, { TokenType } from '../../../entitiy/OAuthToken';
import ClientUserRegistration from '../../../entitiy/ClientUserRegistration';
import UserInfo from '../../../entitiy/UserInfo';

const router = Router();

/**
 * Get user profile
 */
router.get('/me', authenticate({ as: 'any', token_type: TokenType.ACCESS}), handleAsync(
    async (req, res, next) => {
        const [ err, query ] = GetUserInfoQueryValidator(req.query as GetUserInfoQuery);
        if (err) throw err;

        const auth = res.locals.authentication;
        if (!auth) return res.sendStatus(httpStatus.UNAUTHORIZED);

        const { type, identity } = auth;
        if (type === AuthenticationType.USER) {
            const user = identity;
            if (user === null) return res.sendStatus(httpStatus.UNAUTHORIZED);
            return res.send(user.toObject({ id: false, registrations: true }));
        } else if (type === AuthenticationType.SERVICE_ADMIN
                    && query!.via && query!.via === 'classifier'
                    && query!.target_id) {
            const registration = await ClientUserRegistration.findByUserClassifier(query!.target_id);
            if (registration?.client.id !== identity.id) return res.sendStatus(httpStatus.UNAUTHORIZED);
            // TODO: Project only agreed information
            return res.send(registration.user.toObject({ id: false, registration: true }));
        } else return res.sendStatus(httpStatus.BAD_REQUEST);
    }
));


/**
 * Update user
 */
router.put('/me', authenticate({ as: 'user', token_type: TokenType.ACCESS }), handleAsync(
    async (req, res, next) => {
        const [ err, body ] = UpdateUserInfoBodyValidator(req.body);
        if (err) throw err;
        if (Object.keys(body!).length === 0)
            // No field to update
            return res.sendStatus(httpStatus.BAD_REQUEST);

        const auth = res.locals.authentication!;
        const draftUserInfo = await UserInfo.findById(auth.identity.id);
        if (!draftUserInfo) return res.sendStatus(httpStatus.CONFLICT);

        if (body!.realname) draftUserInfo!.realname = body!.realname;
        if (body!.mobile) draftUserInfo!.mobile = body!.mobile;
        return res.send(await draftUserInfo!.save());
    }
));

/**
 * Sign up user
 */
router.post('/signup', handleAsync(
    async (req, res, next) => {
        const [ err, body ] = SignupBodyValidator(req.body);
        if (err) throw err;
        const createdUserInfo = await signup(body!);
        return res.send(await createdUserInfo.toObject({ id: true }));
    }
));

/**
 * Sign out user
 */
router.delete('/signout', authenticate({ as: 'user', token_type: TokenType.ACCESS }), handleAsync(
   async (req, res, next) => {
        const auth = res.locals.authentication!;
        const targetUserInfo = await UserInfo.findById(auth.identity.id);
        if (!targetUserInfo) return res.sendStatus(httpStatus.CONFLICT);

        await targetUserInfo.remove();
        return res.sendStatus(httpStatus.OK);
   }
));

/**
 * Login - Access Code Grant
 */
router.post('/login', handleAsync(
    async (req, res, next) => {
        const [ err, form ] = LoginBodyValidator(req.body);
        if (err) throw err;

        const user = await UserInfo.findByEmail(form!.email);
        const credential = await user!.credential;
        if (credential.compare(form!.password)) {
            // TODO - Find & validate client and callback
            // TODO - Grant new code
            return res.redirect('...');
        } else return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
));

/**
 * Get Access Token Information
 */
router.get('/token_info', authenticate({ as: 'user', token_type: TokenType.ACCESS }), handleAsync(
    async (req, res, next) => {
        const auth = res.locals.authentication;
        if (!auth) return res.sendStatus(httpStatus.UNAUTHORIZED);

        const { type } = auth;
        if (type === AuthenticationType.USER && auth.token) {
            const tokenInfo = await OAuthToken.findById(auth.token.id);
            if (!tokenInfo) return res.sendStatus(httpStatus.UNAUTHORIZED);
            return res.send({
                user_classifier: tokenInfo.registration.user_classifier,
                client_id: tokenInfo.registration.client.client_id,
                expires_in: (tokenInfo.issued_at.getTime() + tokenInfo.expires_in) - new Date().getTime(),
            });
        } else return res.sendStatus(httpStatus.BAD_REQUEST);
    }
));

/**
 * Unlink user to client permanently
 */
router.post('/unlink', authenticate( { as: 'any', token_type: TokenType.ACCESS }), handleAsync(
    async (req, res, next) => {
        const [ err, body ] = UnlinkBodyValidator(req.body);
        if (err) throw err;

        const auth = res.locals.authentication;
        if (!auth) return res.sendStatus(httpStatus.UNAUTHORIZED);

        const { type } = auth;
        if (type === AuthenticationType.USER && auth.token) {
            await auth.token.registration.remove();
            return res.sendStatus(httpStatus.OK);
        } else if (type === AuthenticationType.SERVICE_ADMIN
                    && body!.via && body!.via === 'classifier'
                    && body!.target_id) {
            const registration = (await ClientUserRegistration.findByUserClassifier(body!.target_id));
            if (!registration) return res.sendStatus(httpStatus.CONFLICT);
            await registration.remove()
            return res.sendStatus(httpStatus.OK);
        } else return res.sendStatus(httpStatus.BAD_REQUEST);
    }
));

/**
 * Expire both tokens
 */
router.post('/logout', authenticate({ as: 'user', token_type: TokenType.ACCESS }), handleAsync(
    async (req, res, next) => {
        const auth = res.locals.authentication;
        if (!auth || !auth.token) return res.sendStatus(httpStatus.UNAUTHORIZED);
        await auth.token.registration.setExpiredRelatedTokens();
        return res.sendStatus(httpStatus.OK);
    }
));

export default router;
