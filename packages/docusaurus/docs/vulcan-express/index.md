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

At the time of writing (early 2022), our Express starter is just a single file, [available here on GitHub](https://github.com/VulcanJS/vulcan-npm/tree/main/starters/express).
But it works perfect, uses TypeScript, Apollo Server, and is built using Tsup
for a fast refresh.