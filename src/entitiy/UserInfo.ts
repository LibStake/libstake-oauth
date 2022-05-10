import {
    Entity,
    Column,
    OneToOne,
    OneToMany,
    Index,
    DeepPartial,
    TypeORMError
} from 'typeorm';
import data_source from '../data_source';
import ExtendedEntity, { ExtendedEntityToObjectOption } from './base/ExtendedEntity';
import UserCredentialInfo from './UserCredentialInfo';
import ClientUserRegistration from './ClientUserRegistration';

export interface UserInfoToObjectOption extends ExtendedEntityToObjectOption{
    realname?: boolean,
}

@Entity()
export default class UserInfo extends ExtendedEntity {
    @Index({ unique: true })
    @Column({ type: 'text', nullable: false })
    public username!: string;

    @Column({ type: 'text', nullable: true })
    public realname!: string|null;

    @Index({ unique: true })
    @Column({ type: 'text', nullable: false })
    public email!: string;

    @Column({ type: 'text', nullable: false })
    public mobile!: string;

    @OneToOne(
        () => UserCredentialInfo,
        (credential) => credential.user,
    )
    public readonly credential!: Promise<UserCredentialInfo>;

    @OneToMany(
        () => ClientUserRegistration,
        (registration) => registration.user
    )
    public readonly registrations!: Promise<ClientUserRegistration[]>;

    /**
     * Get plain object of `UserInfo`.
     * If `id` key is undefined though check `include.key = true`, it means it is not real DB instance.
     * @param include Option to select columns that will not appear by default
     * @param reload If true and real instance of DB, will reload instance from DB.
     * @returns All or partial object of `UserInfo`
     */
    public async toObject(
        include: UserInfoToObjectOption,
        reload: boolean = false
    ): Promise<DeepPartial<UserInfo>> {
        const ret = await super.toObject(include, reload);
        Object.assign(ret,{
            username: this.username,
            email: this.email,
            mobile: this.mobile,
        });
        if (include.realname) Object.assign(ret, { realname: this.realname });
        return ret;
    }

    /**
     * Get single or null `UserInfo` via primary key
     */
    static async findById(id: number): Promise<UserInfo|null> {
        return await this.createQueryBuilder()
            .where('id = :id', { id }).getOne();
    }

    /**
     * Get single or null `UserInfo` via `username`
     */
    static async findByUsername(username: string): Promise<UserInfo|null> {
        return await this.createQueryBuilder()
            .where('username = :username', { username }).getOne();
    }

    /**
     * Get single or null `UserInfo` via `email`
     */
    static async findByEmail(email: string): Promise<UserInfo|null> {
        return await this.createQueryBuilder()
            .where('email = :email', { email }).getOne();
    }

    /**
     * Create userinfo with(or without) credential password.
     *
     * If no `plainPassword` given, only create user without password.
     * All invalid fields are ignored.
     * @param userInfoField Draft `UserInfo` - Must have all required columns.
     * @param plainPassword Plain password to encrypt and attach to user credential.
     * @returns Created `UserInfo` instance
     */
    static async createUserInfo(
        userInfoField: DeepPartial<UserInfo>,
        plainPassword: string|undefined = undefined,
    ): Promise<UserInfo> {
        const { username, realname, email, mobile, } = userInfoField;
        if (!username || !email || !mobile)
            throw new TypeORMError(`No field value to insert on required field.`);

        const qr = data_source.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();
        try {
            const userInfoDraft = qr.manager.create(UserInfo);
            userInfoDraft.username = username;
            userInfoDraft.realname = realname || null;
            userInfoDraft.email = email;
            userInfoDraft.mobile = mobile;
            const userInfo = await userInfoDraft.save();

            if (plainPassword !== undefined) {
                const credentialDraft = qr.manager.create(UserCredentialInfo);
                credentialDraft.user = userInfo;
                credentialDraft.passphrase = await UserCredentialInfo.encrypt(plainPassword);
                await credentialDraft.save();
            }

            await qr.commitTransaction();

            await userInfo.reload();
            return userInfo;
        } catch (err) {
            await qr.rollbackTransaction();
            throw err;
        } finally {
            await qr.release();
        }
    }
}