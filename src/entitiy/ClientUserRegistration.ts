import {
    Column,
    Entity,
    Index,
    ManyToOne,
    OneToMany,
    ObjectLiteral,
    DeepPartial,
} from 'typeorm';
import ExtendedEntity, { ExtendedEntityToObjectOption } from './base/ExtendedEntity';
import ClientInfo, { ClientInfoToObjectOption } from './ClientInfo';
import UserInfo, { UserInfoToObjectOption } from './UserInfo';
import OAuthToken from './OAuthToken';
import OAuthAccessCode from './OAuthAccessCode';

export interface ClientUserRegistrationToObjectOption extends ExtendedEntityToObjectOption{
    client?: ClientInfoToObjectOption,
    user?: UserInfoToObjectOption,
}

@Entity()
export default class ClientUserRegistration extends ExtendedEntity {
    @ManyToOne(
        () => ClientInfo,
        (client) => client.registrations,
        { eager: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' }
    )
    public client!: ClientInfo;

    @ManyToOne(
        () => UserInfo,
        (user) => user.registrations,
        { eager: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' }
    )
    public user!: UserInfo;

    @Index({ unique: true })
    @Column({ type: 'text', nullable: false })
    public user_classifier!: string;

    @Column({ type: 'bool', nullable: false, default: false })
    public prohibit_access_information!: boolean;

    @Column({ type: 'bool', nullable: false, default: false })
    public allow_access_personal_information!: boolean;

    @OneToMany(() => OAuthToken, (token) => token.registration)
    public tokens!: Promise<OAuthToken[]>;

    @OneToMany(() => OAuthAccessCode, (code) => code.registration)
    public codes!: Promise<OAuthAccessCode[]>;

    /**
     * Get plain object of `ClientUserRegistration`.
     * If `id` key is undefined though check `include.key = true`, it means it is not real DB instance.
     * @param include Option to select columns that will not appear by default
     * @param reload If true and real instance of DB, will reload instance from DB.
     * @returns All or partial object of `ClientUserRegistration`
     */
    public async toObject(
        include: ClientUserRegistrationToObjectOption = {},
        reload: boolean = false
    ): Promise<DeepPartial<ClientUserRegistration>> {
        const ret = super.toObject(include, reload)
        Object.assign(ret, {
            user_classifier: this.user_classifier,
            prohibit_access_information: this.prohibit_access_information,
            allow_access_personal_information: this.allow_access_personal_information,
        });
        if (include.client) Object.assign(ret, { client: this.client.toObject(include, false) });
        if (include.user) Object.assign(ret, { user: this.user.toObject(include, false) });
        return ret;
    }

    /**
     * Get single or null `ClientUserRegistration` via primary key
     */
    static async findById(id: number): Promise<ClientUserRegistration|null> {
        return await this.createQueryBuilder()
            .where('id = :id', { id }).getOne();
    }

    /**
     * Get single or null `ClientUserRegistration` via `user_classifier`
     */
    static async findByUserClassifier(user_classifier: string): Promise<ClientUserRegistration|null> {
        return await this.createQueryBuilder()
            .where('user_classifier = :user_classifier', { user_classifier }).getOne();
    }

    /**
     * Get registration info via it's relationship with other record(s).
     *
     * If all of params are not given, it crops all records or registrations.
     * Any un-given params means no such criteria is applied into related table.
     * @returns Related `ClientUserRegistration`
     */
    static async findByRelation(
        client: ClientInfo|number|undefined,
        user: UserInfo|number|undefined,
        token: OAuthToken|number|undefined,
        code: OAuthAccessCode|number|undefined,
    ): Promise<Array<ClientUserRegistration>> {
        const clientId = client instanceof ClientInfo ? client.id : client || undefined;
        const userId = user instanceof UserInfo ? user.id : user || undefined;
        const tokenId = token instanceof OAuthToken ? token.id : token || undefined;
        const codeId = code instanceof OAuthAccessCode ? code.id : code || undefined;

        const clientCond: [ string|undefined, ObjectLiteral|undefined ] = !!clientId
            ?[
                'client.id = :id',
                { id: clientId},
            ]:[undefined, undefined];
        const userCond: [ string|undefined, ObjectLiteral|undefined ] = !!userId
            ?[
                'user.id = :id',
                { id: userId },
            ]:[undefined, undefined];
        const tokenCond: [ string|undefined, ObjectLiteral|undefined ] = !!tokenId
            ?[
                'token.id = :id',
                { id: tokenId },
            ]:[undefined, undefined];
        const codeCond: [ string|undefined, ObjectLiteral|undefined ] = !!codeId
            ?[
                'code.id = :id',
                { id: codeId },
            ]:[undefined, undefined];
        return await this.createQueryBuilder('register')
            .innerJoinAndSelect('register.user', 'user', ...userCond)
            .innerJoinAndSelect('register.client', 'client', ...clientCond)
            .innerJoinAndSelect('register.tokens', 'token', ...tokenCond)
            .innerJoinAndSelect('register.codes', 'code', ...codeCond).getMany();
    }
}
