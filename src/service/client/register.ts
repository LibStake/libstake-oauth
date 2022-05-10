import { DeepPartial } from 'typeorm';
import ClientInfo from '../../entitiy/ClientInfo';
import { RegisterClientBody } from '../../validation/request/client';

export default async (form: RegisterClientBody): Promise<ClientInfo> => {
    const {
        name,
        description,
        email,
        management_email,
        homepage_url,
        redirect_uris,
    } = form;

    let array_of_redir_uris: Array<string>|undefined;
    if (redirect_uris)
        array_of_redir_uris = redirect_uris.split(`;`);
    const clientField: DeepPartial<ClientInfo> = {
        application_name: name,
        application_description: description,
        application_email: email,
        client_mgmt_email: management_email,
        application_homepage_url: homepage_url,
    };
    return await ClientInfo.createClientInfo(clientField, array_of_redir_uris);
    // TODO: Handle redirect uris
}
