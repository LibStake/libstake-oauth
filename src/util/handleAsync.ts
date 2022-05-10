import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { Query, ParamsDictionary } from 'express-serve-static-core';
import { ResponseLocal } from '../discrete_types';

/** To provide same type name for express RequestHandler*/
type ResBody = any;
type ReqBody = any;
/**
 * Middleware wrapper for `express middleware` which attached to `router`.
 * - Handle async function for middleware.
 * - Catch errors and convert into convertable error for error handle middleware.
 * @param fn
 */
export default (fn: RequestHandler<ParamsDictionary, ResBody, ReqBody, Query, ResponseLocal>) => async (req: Request, res: Response<any, ResponseLocal>, next: NextFunction) => {
    try {
        return await fn(req, res, next);
    } catch (err) {
        return next(err);
    }
}
