import { RequestHandler } from 'express';
import { AuthenticationType, ResponseLocalAuthentication } from '../discrete_types';
import httpStatus from 'http-status';

/**
 * If there are no authentications in request, act specific actions as response.
 * @param redirectTo If str, will send redirect method with `redirect_uri` param. Else, returns `NotFound` response
 * @param param URI parameter to load with. Key-value pair object.
 */
const requiresUserLogin =(redirectTo: string|undefined, param: { [key: string]: string }|undefined = undefined): RequestHandler => (req, res, next) => {
    const authentication: ResponseLocalAuthentication = res.locals?.authentication as ResponseLocalAuthentication;
    if (!authentication || authentication.type !== AuthenticationType.USER) {
        if (redirectTo) {
            const uri = `${redirectTo}${param&&Object.keys(param).length > 0?`?${Object.keys(param).map(k => (`${k}=${encodeURIComponent(param[k])}`)).join('&')}`:``}`;
            return res.redirect(uri);
        } else {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
    } else return next();
}
export default requiresUserLogin;
