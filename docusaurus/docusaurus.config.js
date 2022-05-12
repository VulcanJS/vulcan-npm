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
            "https://github.com/VulcanJS/vulcan-npm/tree/main/packages/docusaurus/",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            "https://github.com/VulcanJS/vulcan-npm/tree/main/packages/docusaurus/",
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
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} VulcanJS. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
