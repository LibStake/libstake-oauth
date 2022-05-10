import UserInfo from '../../entitiy/UserInfo';
import { SignupBody } from '../../validation/request/user';

export default async (form: SignupBody): Promise<UserInfo> => {
    const {
        email, username, realname, password, mobile,
    } = form;
    return await UserInfo.createUserInfo({ email, username, realname, mobile }, password);
}
