import Router from 'express';
import { RegisterClientBodyValidator } from "../../../validation/request/client";
import register from '../../../service/client/register';
import handleAsync from '../../../util/handleAsync';

const router = Router();

/**
 * Register new client
 */
router.post('/register', handleAsync(
    async (req, res, next) => {
        const [ err, form ] = RegisterClientBodyValidator(req.body);
        if (err) throw err;
        const createdClientInfo = await register(form!);
        res.send(await createdClientInfo.toObject({ client_id: true }));
    }
));

export default router;
