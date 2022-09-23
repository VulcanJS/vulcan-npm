

# Vulcan Express

Vulcan Express helps you build GraphQL-based applications with Express.

## Need a full-stack setup?

You may also like our [Next.js starter](https://vulcan-next.vercel.app/)

## What's in the box?

Vulcan Express provides:

- A GraphQL API endpoint set up with Apollo Server, so you can start coding back-end features immediately.
- Schema-based helpers and hooks to quickly generate and consume your own GraphQL API.

[Join the Slack and meet Vulcan contributors](http://slack.vulcanjs.org/)

[Check the full documentation](https://vulcan-docs.vercel.app)

## A word about Vulcan.js aka Vulcan Meteor

You can't teach an old dog new tricks! Vulcan Express is a port of "Vulcan.js", the Meteor framework from [Sacha Greif](https://sachagreif.com/). It inherits years of experience, with a modernized architecture that replaces Meteor by Express (+ optionnaly React or Next.js).

---

## Install and run in 5 minutes

```sh
git clone -b main https://github.com/VulcanJS/vulcan-express
cd vulcan-express
yarn
yarn run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Setup your own git repository

When creating your own application, you'll want to host the code on your own Git repository (on GitHub, BitBucket, etc.).

### Point git to your own repository

Rename "origin" to "upstream", so you can use your own git repository as the main "origin", and Vulcan Express official repo as "upstream".

```sh
git remote rename origin upstream
# Then do what you need to create your own origin remote
# git remote add origin <your-own-git-repository-url>
```

---

## Contribute or raise an issue

This starter is **read-only**! Please avoid opening pull requests against it.

All developments [happen in our monorepo "Vulcan NPM" here.](https://github.com/VulcanJS/vulcan-npm)

---

## Next steps

### Roll your own Mongo database

As a default, Vulcan Express will connect to a sample in-memory database.
To create your own application, you'll want to use your own databse.

#### 0. I am a Windows user (if using Mac or Linux skip to 1.)

If you use Windows, you might want to either:

- Install [Ubuntu as a dual boot](https://help.ubuntu.com/community/WindowsDualBoot) (virtual machine are technically fine but way slower and could lead to a poor development experience)
- Setup the [Linux subsystem](https://docs.microsoft.com/fr-fr/windows/wsl/install) in order to be able to run [Docker on Windows](https://docs.docker.com/desktop/windows/wsl/)

- Install MongoDB using the [Windows installer](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)

#### Run a Mongo server using Docker

It will run Mongo in your current terminal, or create and run a Mongo image if it's the first time your run the command.

**Note:** you should always start your database *before* you run the application.

```sh
yarn run start:mongo
```

[**See Docker installation instruction for Ubuntu here**](https://docs.docker.com/engine/install/ubuntu/) if you don't have Docker yet.

We advise to use [MongoDB Compass](https://www.mongodb.com/try/download/compass) to visualize your database content.

### Update your app to the latest version of Vulcan Express

**Beware:** Vulcan Express is a boilerplate, the possibility to update automatically is not guaranteed. You may
have to apply the updates by hand, comparing Vulcan Express latest version to your own code. **Always double-check that the merge didn't break your app!**.

```sh
# Get the latest version of Vulcan Express locally
git fetch upstream
# Merge to your own code (favouring your own code as a default in case of conflict)
git merge upstream/main -X ours
```

---

## They support Vulcan Core, Vulcan Express, Vulcan Next and Vulcan Meteor

### Contributors

This project exists thanks to all the people who contribute.

<a href="https://github.com/VulcanJS/vulcan-npm/graphs/contributors"><img src="https://opencollective.com/vulcan/contributors.svg?width=890&button=false" /></a>

### Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/vulcan#contribute)]

<a href="https://opencollective.com/vulcan#contributors" target="_blank"><img src="https://opencollective.com/vulcan/backers.svg?width=890"/></a>

### Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/vulcan#contribute)]

<a href="https://opencollective.com/vulcan#contributors" target="_blank"><img src="https://opencollective.com/vulcan/sponsors.svg?width=890"/></a>

### Technical supports

They give time and share knowledge to support the project.

<a href="https://aplines.com" target="_blank" rel="noopener noreferrer">
<img src="https://aplines.com/wp-content/uploads/2022/03/cropped-aplines-logo.png" alt="aplines" height="75"/>
</a>
<a href="https://www.lbke.fr" target="_blank" rel="noopener noreferrer">
<img src="https://www.lbke.fr/img/logo-md.png" height="75" alt="lbke" />
</a>
<a href="https://letter.so/" target="_blank" rel="noopener noreferrer">
<img src="https://github.com/VulcanJS/vulcan-next/blob/devel/public/img/letter-96x96.png?raw=true" height="75" alt="lette.so" />
</a>

---

[![Powered by Vercel](https://www.datocms-assets.com/31049/1618983297-powered-by-vercel.svg)](https://vercel.com?utm_source=vulcan&utm_campaign=oss)
