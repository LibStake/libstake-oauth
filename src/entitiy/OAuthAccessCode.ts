import { Column, DeepPartial, Entity, Index, ManyToOne } from 'typeorm';
import ExtendedEntity, { ExtendedEntityToObjectOption } from './base/ExtendedEntity';
import ClientUserRegistration, { ClientUserRegistrationToObjectOption } from './ClientUserRegistration';
import { randomSHA512 } from '../util/sha';

export interface OAuthAccessCodeToObjectOption extends ExtendedEntityToObjectOption {
    registration?: ClientUserRegistrationToObjectOption,
}

@Entity()
export default class OAuthAccessCode extends ExtendedEntity {
    @ManyToOne(
        () => ClientUserRegistration,
        (registration) => registration.codes,
        { eager: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' }
    )
    public registration!: ClientUserRegistration;

    @Index({ unique: true })
    @Column({ type: 'char', length: 64, nullable: false }) // SHA-512
    public code!: string;

    @Column({ type: 'datetime', nullable: false, default: () => `NOW()` })
    public issued_at!: Date;

    @Column({ type: 'int', nullable: false })
    public expires_in!: number;

    /**
     * Get plain object of `OAuthAccessCode`.
     * If `id` key is undefined though check `include.key = true`, it means it is not real DB instance.
     * @param include Option to select columns that will not appear by default
     * @param reload If true and real instance of DB, will reload instance from DB.
     * @returns All or partial object of `OAuthAccessCode`
     */
    public async toObject(
        include: OAuthAccessCodeToObjectOption = {},
        reload: boolean = false,
    ): Promise<DeepPartial<OAuthAccessCode>> {
        const ret = super.toObject(include, reload);
        Object.assign(ret, {
            code: this.code,
            issued_at: this.issued_at,
            expires_in: this.expires_in,
        });
        if (include.registration) Object.assign(ret, { registration: this.registration.toObject(include, false) });
        return ret;
    }

    /**
     * Returns whether this code is expired or not.
     */
    public get isExpired(): boolean {
        return (new Date().getTime() - (this.issued_at.getTime() + this.expires_in)) >= 0;
    }

    /**
     * Get single or null `OAuthAccessCode` via code key
     */
    static async findByCode(code: string): Promise<OAuthAccessCode|null> {
        return await this.createQueryBuilder()
            .where('code = :code', { code }).getOne();
    }

    /**
     * Create grant code of registered user.
     * @param registration `ClientUserRegistration` Instance
     * @returns Created `OAuthAccessCode` instance.
     */
    static async createCode(
        registration: ClientUserRegistration,
    ): Promise<OAuthAccessCode|null> {
        const draftToken = OAuthAccessCode.create();
        draftToken.registration = registration;
        draftToken.code = randomSHA512().toString();
        draftToken.issued_at = new Date();
        draftToken.expires_in = parseInt(
            (process.env.OAUTH_GRANT_CODE_EXPIRATION_IN_MILLI as string).replace('_', '')
        );
        return await draftToken.save();
    }
}