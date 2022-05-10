import { Request, RequestHandler } from 'express';
import httpStatus from 'http-status';
import { AuthenticationType, RequestHeaderAuthorizationSchema, ResponseLocalAuthentication } from '../discrete_types';
import OAuthToken, { TokenType } from '../entitiy/OAuthToken';
import ClientInfo from '../entitiy/ClientInfo';
import { compareBaseURL } from '../util/url';

type AuthenticateOption = {
    as: 'user'|'admin'|'any', // This defines what kind of key(or token) is needed
    token_type?: TokenType.ACCESS, // This value is undefined if `as = admin`
};

/**
 * Check if origin is valid client.
 * Inspect Origin header with base url of client's callback url
 */
const isValidOrigin = async (client: ClientInfo, request: Request) => {
    const origin = request.header('Origin') || request.header('origin') || '';
    return (await client.callbacks).map(cb => (
        compareBaseURL(cb.callback_url, origin))
    ).some(valid => valid);
}
const REGEX_AUTH_HEADER: RegExp = /[a-zA-Z\d]+ [a-zA-Z\d]+/gi
/**
 * Returns middleware that authenticate credential and required authority.
 */
const authenticate = (method: AuthenticateOption): RequestHandler => async (req, res, next) => {
    const authStr: string|undefined = req.header('Authorization') || req.header('authorization') || '';
    if (!authStr || !authStr.match(REGEX_AUTH_HEADER))
        return res.sendStatus(httpStatus.BAD_REQUEST);
    const [ authType, token ] = authStr.split(' ');
    if (!token)
        return res.sendStatus(httpStatus.BAD_REQUEST);

    let authentication: ResponseLocalAuthentication|undefined;
    if (authType.toLowerCase() === RequestHeaderAuthorizationSchema.BEARER
                && (method.as === 'user' || method.as === 'any')) {
        // User authentication
        const tokenInfo = await OAuthToken.findByToken(token, method.token_type);
        if (!tokenInfo) // Token check
            return res.sendStatus(httpStatus.UNAUTHORIZED);
        if (!(await isValidOrigin(tokenInfo.registration.client, req)))
            // Origin check
            return res.sendStatus(httpStatus.UNAUTHORIZED);
        if (tokenInfo.isExpired) // Expiration check
            return res.sendStatus(httpStatus.UNAUTHORIZED);
        authentication = {
            type: AuthenticationType.USER,
            token: tokenInfo,
            identity: tokenInfo.registration.user,
        }

    } else if (authType.toLowerCase() === RequestHeaderAuthorizationSchema.ADMIN_KEY
                && (method.as === 'user' || method.as === 'any')) {
        // Client admin authentication
        const clientInfo = await ClientInfo.findByAdminKey(token);
        if (!clientInfo) // Client key check
            return res.sendStatus(httpStatus.UNAUTHORIZED);
        if (!(await isValidOrigin(clientInfo, req)))
            // Origin check
            return res.sendStatus(httpStatus.UNAUTHORIZED);
        authentication = {
            type: AuthenticationType.SERVICE_ADMIN,
            identity: clientInfo,
        }

    } else return res.sendStatus(httpStatus.UNAUTHORIZED);

    Object.assign(res.locals, { authentication });
    return next();
}
export default authenticate;