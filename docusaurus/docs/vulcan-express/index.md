---
title: "Vulcan Express"
---

# About Vulcan Express

[Vulcan Next](https://vulcan-next.vercel.app/) is our main stater for Vulcan.
However, you may want to reuse the magic of Vulcan outside of Next.js.

For instance,
Next.js API routes, due to their serverless nature, cannot handle long-running tasks
such as cron-jobs.

Instead, you might want to create an Express based micro-server.

You could also want to use Vulcan with other frontend technologies, like Create React App, in which
case you need an additional Express server for the backend.

**Great news: we got you covered.**

[Vulcan Express](https://github.com/VulcanJS/vulcan-express) is the perfect solution for you!

Vulcan Express is in alpha stage, yet it works fine, uses TypeScript, Apollo Server, [Vulcan Fire](../vulcan-fire) for the CRUD operation, and is built using [Tsup](https://github.com/egoist/tsup) for a fast refresh during development.
