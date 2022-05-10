import { DataSource, DataSourceOptions } from 'typeorm';
import UserInfo from './entitiy/UserInfo';
import ClientInfo from './entitiy/ClientInfo';
import UserCredentialInfo from './entitiy/UserCredentialInfo';
import ClientOAuthCallback from "./entitiy/ClientOAuthCallback";
import ClientUserRegistration from "./entitiy/ClientUserRegistration";
import OAuthToken from "./entitiy/OAuthToken";
import OAuthAccessCode from "./entitiy/OAuthAccessCode";

const ds_option: DataSourceOptions = {
    type: 'mariadb',
    host: process.env.AUTH_DATABASE_URL || undefined,
    // @ts-ignore
    port: parseInt(process.env.AUTH_DATABASE_PORT) || undefined,
    database: process.env.AUTH_DATABASE_DBNAME || undefined,
    username: process.env.AUTH_DATABASE_USER || undefined,
    password: process.env.AUTH_DATABASE_PASSWORD || undefined,
    synchronize: process.env.NODE_ENV === 'init',
    logging: process.env.NODE_ENV !== 'production',
    // logger: 'file', // Log will emit to `ormlogs.log`
    entities: [
        UserInfo,
        UserCredentialInfo,
        ClientInfo,
        ClientOAuthCallback,
        ClientUserRegistration,
        OAuthToken,
        OAuthAccessCode,
    ],
    subscribers: [],
    migrations: [],
    dropSchema: true, // ! Only for dev
};
console.log(ds_option)
export default new DataSource(ds_option);
