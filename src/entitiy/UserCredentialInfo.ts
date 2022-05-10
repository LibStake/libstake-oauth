import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, BaseEntity, DeepPartial } from 'typeorm';
import ExtendedEntity, { ExtendedEntityToObjectOption } from './base/ExtendedEntity';
import UserInfo, { UserInfoToObjectOption } from './UserInfo';
import { hashPbkdf2, verifyPbkdf2 } from '../util/pbkdf2';

export interface UserCredentialInfoToObjectOption extends ExtendedEntityToObjectOption {
    user?: UserInfoToObjectOption,
}

@Entity()
export default class UserCredentialInfo extends ExtendedEntity {
    @Column({ type: 'text', nullable: false })
    public passphrase!: string;

    @OneToOne(
        () => UserInfo,
        (user) => user.credential,
        { eager: true, nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' }
    )
    @JoinColumn()
    public user!: UserInfo;

    /**
     * Get plain object of `UserCredentialInfo`.
     * If `id` key is undefined though check `include.key = true`, it means it is not real DB instance.
     * @param include Option to select columns that will not appear by default
     * @param reload If true and real instance of DB, will reload instance from DB.
     * @returns All or partial object of `UserCredentialInfo`
     */
    public async toObject(
        include: UserCredentialInfoToObjectOption = {},
        reload: boolean = false,
    ): Promise<DeepPartial<UserCredentialInfo>> {
        const ret = super.toObject(include, reload);
        Object.assign(ret, {
            passphrase: this.passphrase,
        });
        if (include.user) Object.assign(ret, { user: this.user.toObject(include, false) });
        return ret;
    }

    /**
     * Compare incoming plain password and this credential
     * @param plain Incoming plain password to compare with
     * @returns If matches, return `true`
     */
    public compare(plain: string): boolean {
        return verifyPbkdf2(plain, Buffer.from(this.passphrase));
    }

    /**
     * Generate pbkdf2 hash for the plain password
     * @param plain Incoming plain password to encrypt
     * @returns Hash string
     */
    static async encrypt(plain: string): Promise<string> {
        return await hashPbkdf2(plain);
    }
}
