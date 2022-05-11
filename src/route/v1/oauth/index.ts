import Router, { Request } from 'express';
import type { AccessCodeGrantQuery, GetTokenBody } from '../../../validation/request/oauth';
import { AccessCodeGrantValidator, GetTokenBodyValidator } from '../../../validation/request/oauth';
import ClientInfo from '../../../entitiy/ClientInfo';
import handleAsync from '../../../util/handleAsync';
import httpStatus from 'http-status';
import OAuthAccessCode from '../../../entitiy/OAuthAccessCode';
import OAuthToken, { TokenType } from '../../../entitiy/OAuthToken';

const router = Router();

/**
 * Authorize user for access code grant
 */
router.get('/authorize', handleAsync(
    async (req, res, next) => {
        const [ err, query ] = AccessCodeGrantValidator(req.query as AccessCodeGrantQuery);
        if (err) throw err;

        const clientInfo = await ClientInfo.findByClientId(query!.client_id);
        if (!clientInfo) return res.sendStatus(httpStatus.CONFLICT);

        const candidate = (await clientInfo.callbacks).filter(cb => cb.callback_url === query!.redirect_uri);
        if (candidate.length === 0) return res.sendStatus(httpStatus.NOT_FOUND);
        const target_uri = candidate[0].callback_url;

        return res.redirect(`${target_uri}?callback=${encodeURIComponent(target_uri)}&client_id=${encodeURIComponent(query!.client_id)}`);
    }
));

/**
 * Get token(s) via access code or refresh token
 * Use different authenticate method by itself
 */
router.post('/token', handleAsync(
    async (req: Request<{}, any, GetTokenBody, any>, res, next) => {
        const [err, body] = GetTokenBodyValidator(req.body);
        if (err) throw err;

        const clientInfo = await ClientInfo.findByClientId(body!.client_id);
        if (clientInfo?.client_secret && clientInfo.client_secret !== body!.client_secret)
            return res.sendStatus(httpStatus.UNAUTHORIZED);

        if (body!.type === 'grant_code' && 'code' in body!) {
            const registeredCode = await OAuthAccessCode.findByCode(body.code);
            if (!registeredCode || registeredCode.isExpired) return res.sendStatus(httpStatus.UNAUTHORIZED);
            const { accessToken, refreshToken } = await registeredCode.registration.createTokenPair();
            return res.send({
                access_token: await accessToken.toObject(),
                refresh_token: await refreshToken.toObject(),
            });
        } else if (body!.type === 'refresh_token' && 'refresh_token' in body!) {
            const refreshToken = await OAuthToken.findByToken(body.refresh_token, TokenType.REFRESH);
            if (!refreshToken || refreshToken.isExpired) return res.sendStatus(httpStatus.UNAUTHORIZED);
            const accessToken = await refreshToken.registration.createToken(TokenType.ACCESS);
            return res.send(await accessToken.toObject());
        } else return res.sendStatus(httpStatus.BAD_REQUEST);
    }
));

export default router;
