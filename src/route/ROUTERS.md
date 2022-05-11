# All server routers

## Interface Routers(`/`)
### Router (`/v1`)
#### User (`/v1/user`)
- `AUTH` `USER` `CLIENT` Get user information
> `GET` `/v1/user/me`


- `AUTH` `USER` Update user information
> `PUT` `/v1/user/me`


- `NO_AUTH` Create user by filling form
> `POST` `/v1/user/signup`


- `AUTH` `USER` Sign out user
> `DELETE` `/v1/user/signout`


- (**OAuth**) `NO_AUTH` Login into service
> `POST` `/v1/user/login`


- (**OAuth**) `AUTH` `USER` Get access and(or) refresh token information
> `GET` `/v1/user/token_info`


- `AUTH` `USER` `CLIENT` Unlink user from application service
> `POST` `/v1/user/unlink`


- `AUTH` `USER` Logout user from application service
> `POST` `/v1/user/logout`


*****
#### OAuth (`/v1/oauth`)
- (**OAuth**) `NO_AUTH` Grant code access
> `GET` `/v1/oauth/authorize


- (**OAuth**) `AUTH` `USER` Get new token via code or refresh token
> `POST` `/v1/oauth/token



*****
#### Client(`/v1/client`)
- `AUTH` `USER` Get application information
> `GET` `/v1/client/application`

- `AUTH` `USER` Register new application
> `POST` `/v1/client/application/register`

- `AUTH` `USER` Update application
> `PUT` `/v1/client/application/update`

- `AUTH` `USER` Update callback uris
> `PUT` `/v1/client/application/update/callback`

- `AUTH` `USER` Delete existing application
> `DELETE` `/v1/client/application/delete`



*****

## Document Routers (`/`)
### OAuth built-in services Document (& Interface) (`/service`)
#### Sign up to OAuth service
- `NO_AUTH` Sign-up form
> `/service/signup/form`
- `NO_AUTH` Verify email address
> `/service/signup/verify`
- `NO_AUTH` Verifying email via email link click
> `/service/signup/verify/done?verification_code={verification_code}`
- `NO_AUTH` Email verified
> `/service/welcome`

*****
#### Register & Manage client
- `AUTH` `USER` Client dashboard
> `/service/client/dashboard`
- `AUTH` `USER` Client registration detail
> `/service/client/register/detail`
- `AUTH` `USER` Client registration & edit form
> `/service/client/register/draft?editmode={editmode}`
- `AUTH` `USER` Client registration cancel
> `/service/client/disconnect`

*****
#### Manage my registrations
- `AUTH` `USER` My registered service & manage dashboard
> `/me/applications`

*****
### OAuth Provider Document (& Interface) (`/oauth`)
#### SignIn with OAuth
- `NO_AUTH` Login to client : 
> `/oauth/login?callback={callback_url}`

*****
#### OAuth linking
- `AUTH` `USER` Terms of providing information : 
> `/oauth/application/accept-terms?callback={callback_url}`
- `AUTH` `USER` Modify terms: 
> `/oauth/application/accept-terms-modify?callback={callback_url}`
