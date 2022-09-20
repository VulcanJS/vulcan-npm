// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Vulcan",
  tagline: "The full-stack JavaScript toolkit",
  url: "https://vulcan-docs.vercel.app",
  baseUrl: "/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "theme/images/favicon.ico",
  organizationName: "VulcanJS", // Usually your GitHub org/user name.
  projectName: "vulcan-npm", // Usually your repo name.

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl:
            "https://github.com/VulcanJS/vulcan-npm/tree/main/docusaurus/",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            "https://github.com/VulcanJS/vulcan-npm/tree/main/docusaurus/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "Vulcan Docs",
        logo: {
          alt: "Vulcan Logo",
          src: "theme/images/vulcan-logo-border.png",
        },
        items: [
          {
            type: "doc",
            docId: "guides/index",
            position: "left",
            label: "Guides",
          },
          {
            href: "https://vulcan-next.vercel.app/learn",
            position: "left",
            label: "Learn",
          },
          {
            href: "https://vulcan-npm.vercel.app",
            position: "left",
            label: "API",
          },
          {
            /*to: "/blog",*/ href: "https://blog.vulcanjs.org/",
            label: "Blog",
            position: "right",
          },
          {
            href: "https://github.com/VulcanJS/vulcan-next",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        logo: {
          alt: "Vulcan Logo",
          src: "theme/images/vulcan-logo-border.png",
        },
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Guides",
                to: "/docs/guides",
              },
              {
                label: "Vulcan Next",
                to: "/docs/vulcan-next",
              },
              {
                label: "Vulcan Meteor (legacy)",
                to: "/docs/vulcan-meteor-legacy",
              },
              {
                label: "API",
                href: "https://vulcan-npm.vercel.app",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Join our slack",
                href: "http://slack.vulcanjs.org/",
              },
              {
                label: "Join our Discord",
                href: "https://discord.gg/4dqeKSNv",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/VulcanJS",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Blog",
                href: "https://blog.vulcanjs.org/",
              },
              {
                label: "GitHub",
                href: "https://github.com/VulcanJS/vulcan-next",
              },
              {
                html: `<a href="https://vercel.com?utm_source=vulcan&utm_campaign=oss" target="_blank" rel="noopener">
              <img alt="Powered by Vercel" src="https://www.datocms-assets.com/31049/1618983297-powered-by-vercel.svg"/>
              </a>`,
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} VulcanJS. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      // @see https://docusaurus.io/fr/docs/search
      algolia: {
        // L'ID de l'application fourni par Algolia
        appId: 'M8OIENR0HJ',

        // Clé d'API publique : il est possible de la committer en toute sécurité
        apiKey: '7870e4c4bae50c2173d89f7771e260d5',

        indexName: 'vulcan',

        // Facultatif : voir la section doc ci-dessous
        contextualSearch: true,

        // Facultatif : Spécifiez les domaines où la navigation doit se faire par window.location au lieu de history.push. Utile lorsque notre configuration Algolia explore plusieurs sites de documentation et que nous voulons naviguer vers eux avec window.location.href.
        //externalUrlRegex: 'external\\.com|domain\\.com',

        // Facultatif : paramètres de recherche de Algolia
        //searchParameters: {},

        // Facultatif : chemin pour la page de recherche qui est activée par défaut (`false` pour le désactiver)
        searchPagePath: 'search',

        //... autres paramètres d'Algolia
      },

    }),
};

module.exports = config;
