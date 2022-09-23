---
title: "Comparison with other tools"
---

## Why Next

The main reason for using Next.js is that it is currently the most advanced framework when it comes to static and server rendering.
The combination of middlewares and the data fetching methods provided by Next allows you to achieve an optimal amount of renders. [Check our article about the "Megaparam pattern" to learn more.](https://blog.vulcanjs.org/render-anything-statically-with-next-js-and-the-megaparam-4039e66ffde)

Also, Next.js includes API routes, which makes it a full-stack framework. API routes are limited to a serverless approach. The only issue is when you need long running tasks such as cron jobs. In this scenario, you can always couple Next with a tiny satellite Express server. We are currently (03/2022) working on a Vulcan Express starter as well.

## Vulcan vs other Next.js frameworks

### Blitz.js

#### Vulcan prefers a more classical architecture

[Blitz.js](https://blitzjs.com/) is the most famous framework built around Next. Vulcan Next aims at being slightly simpler and standard. We do not try to achieve a "zero-api" data layer and instead rely on GraphQL language. We do not use Prisma and prefer direct access to the database (Mongo is our default, SQL is possible). Finally, we use dynamic feature generation based on a schema, as opposed to static code generation. This pattern is more flexible when you are in the early stage of designing your application model.

Blitz is an innovative and bold technology. Vulcan Next is suited when a simpler architecture fits your need or you are still in the process of learning Next.js.

#### Both Vulcan and Blitz are reusable toolkits

Blitz used to be focused on Next.js but pivoted toward creating a reusable toolkit in 2022. We've been pursuing the same goal since 2019, with however a way smaller scope. We mainly aim at making the basic CRUD operations (Create, Read, Update, Delete) very easy to setup in any Express and/or React compatible app (which includes Next.js).

### Bison

#### A similar approach with slightly different choices

[Bison](https://github.com/echobind/bisonapp) is a Next.js and GraphQL starter. The stack is extremely close to Vulcan Next, but relies on Prisma for the database connection, Nexus for the GraphQL server, and Chakra UI. We instead use direct connection to Mongo (and can support SQL if needed), Apollo Server and Client, and Material UI for the default UI.
Bison also relies on static code generation while we prefer a dynamic approach. In this respect, our backend is closer to how a tool like [Hasura](https://hasura.io/) works.

#### Boilerplate vs framework

Bison is a boilerplate, it's basically a extremely well-written Next.js app.
Vulcan is a framework. It means that we provide a Next.js app too (I hope a well-written one :)), but also that a huge part of our code is actually usable outside of Next. Vulcan can work in any Express application for the backend or React application for the frontend.

We have a long history of being stuck with Meteor before moving to Next.js, that's why we try to make most of our codebase framework-independant.

### Next Right Now and other boilerplates

There are plenty of Next.js boilerplates that use various technologies. I won't quote all of them, but [Next Right Now](https://github.com/UnlyEd/next-right-now) is definitely worth a try. It's one of the earliest and most mature Next.js boilerplate around.

## Vulcan vs other non Next.js technologies

- [Create React App](https://create-react-app.dev/): to achieve the same level of features than with Next.js, CRA should be coupled with a server and bundler like [Vite](https://vitejs.dev/). This makes it a lower-level tool, while we like the turnkey approach of Next.js.
- [RedwoodJS](https://redwoodjs.com/): An excellent full-stack framework!
  The only issue I could find is that prerendering is still limited to public content.
  This limitation is also shared by other technologies at the time of writing (early 2022): SvelteKit, Gatsby.js...

Next/Vulcan Next are able to handle multi-tenancy, i18n, A/B testing... more elegantly when it comes to static rendering.

In terms of philosophy, Vulcan is a cross-point between various technologies maintained by many different people: Next, Express, React, Storybook, Jest, Apollo, GraphQL... We don't really aim to invent a lot of "new things", but instead we gather the best ideas around the world and mix them in a single project.

- [Meteor](https://www.meteor.com/developers/): Meteor is one of the first mature fullstack JavaScript framework ever.
  The first version of Vulcan was based on Meteor. Meteor and Vulcan brought many innovations: structuring the code as a monorepo of reusable packages, making it easy to share code between the client and the server, having a schema-based client/server communication layer...

However, Meteor development underwent a hiatus between 2016-2019 as the focus shifted on coding Apollo.
It was later bought by Tiny and now regains a new wave of attention, however we already moved out by that time. Meteor is still an excellent framework for medium-sized apps.

## Why no static code generation?

Using Vulcan, you might notice that we _dynamically_ generate the GraphQL "Type Definitions" (the GraphQL schema as a) and "resolvers" (the function that powers this schema).

Many modern frameworks prefer _static_ generation for both, meaning they will litterally produce pieces of code you can edit later on.

- Static code generation is awesome when you need to customize the code later on. However,
  it also mean that you need to manage a lot of additional files in your codebase.

- Dynamic generation won't generate any code. Customization is done either via the Vulcan Model object, or by [creating your custom resolvers as depicted in our GraphQL engine documentation](../vulcan-fire/customTopLevelResolvers.md).

Actually, both patterns are perfectly compatible!

For instance, you can use the generic, dynamic `useMulti` React hook from Vulcan to fetch data, but also generate some specific, static hooks using tools like [Wundergraph](https://wundergraph.com/).

Note that we can still export the GraphQL schema as a file, what we cannot statically generate are the resolver functions tied to this schema or specific hooks for each Vulcan model.
