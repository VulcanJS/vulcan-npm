# Authentication

## Custom app-level setup

We use stateful, token-based (with symmetrical encryption) password-based authentication.

At the time of writing (2021 11), authentication is used only to protect API routes.
You don't really need to protect web pages, redirections based on the `useUser` hook 
are sufficient.

We will introduce [Middlewares](https://nextjs.org/docs/advanced-features/middleware) later on for protecting web pages, but think of it as
a very advanced feature. It serves only to protect sensitive content such as paid pages, and
even then you don't really need this feature, it's just a perf optimization.

## Why no reusable packages?

Vulcan has been there for a long while, and we've seen it all. We are still disatisfied by the state of the art. Many reusable libraries have popped up over time, from [Meteor accounts](https://docs.meteor.com/api/accounts.html) system to [Account-js](https://www.accountsjs.com/) and now [Next auth](https://next-auth.js.org/).

None of them is canonical, none of them is really easy to use, because none of them is based on any actual kind of standard. [You can help us fix that by contributing to our research here.](https://github.com/lbke/research/blob/main/auth.md)

They are certainly working very well, but they are not transparent on the way they work under the hood: are tokens stored in HTTP cookies or localStorage? What algorithms are used? Are they symmetrical or not, can you check auth without a server, will they call a database???

With a custom implementation, you have full control over these factors. We prefer transparent code over reusable blackboxes. However, we still recommend [Next Auth](https://next-auth.js.org/) if you believe it's a fit for you.

## Passport authentication

See the home page footer to access signup, login, logout and profile page. Implementation is based on Next official example [with Passport and Next Connect](https://github.com/vercel/next.js/tree/canary/examples/with-passport-and-next-connect)

## Flows

### Signup

- When an user signs up with email and password, we hash the password and store only the hashed version (+ salt)


### Login

- When a user logs in, we hash the password and check it against the password stored in the database
- If we found the user, we return a Set-Cookie header with a token, hashed with a secret value

### Auth flow

- In subsequent requests, the cookie is automatically added to the request headers by your browser.
It is set as `httpOnly` so you can't manipulate the token in JS.
- The protected API route will check the token, decrypt it using the same secret used for encryption 
(hence the "symmetrical" encryption). If the token can be decrypted with this secret, it means it's authentic.
- We also check that the _id matches a user in the database (that user was not deleted already)

### Logout

- When a user logs out, the auth token is removed from the browser cookies using a Set-Header cookie

## API

We provide basic REST endpoints for authentication in `/pages/api/account`.

Note that we do not use GraphQL for this use case, eventhough it's technically possible.
We believe that GraphQL should be used for the use cases where it shines: getting data,
and CRUD operations. 

Authentication workflow, or file upload for instance, do not really
fall into this category, so we prefer using more basic, independant, REST endpoints for those use cases.

## UI

We provide basic UI in the `/pages/account`.

## Experimental SSR redirection (deprecated)

*This feature is experimental and not useful in most scenarios.* We advise to stick to client-side only patterns. [See relevant issue](https://github.com/VulcanJS/vulcan-next/issues/71).

See `src/pages/vn/debug/private.tsx.old` for a demo. You can use `withPrivateAccess` HOC to make a page private and handle redirections correctly in all situations (server-side, client-side, in the context of a static export etc.).
