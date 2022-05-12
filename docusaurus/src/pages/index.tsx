import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./index.module.css";
// @ts-ignore
import ContributorsPartial from "../components/Contributors_partial.mdx";
// @ts-ignore
import TechSponsorsPartial from "../components/TechSponsors_partial.mdx";
// import HomepageFeatures from "../components/HomepageFeatures";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <img src="/img/vn-logo-512.png" alt="Vulcan Next logo" />
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/guides"
          >
            Get started with Vulcan
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} Docs`}
      description="Documentation of VulcanJS - The full-stack JavaScript toolkit"
    >
      <HomepageHeader />
      <main className={styles.logoWrapper}>
        <ContributorsPartial />
        <TechSponsorsPartial />
      </main>
      {/*<main>
        <HomepageFeatures />
      </main>*/}
    </Layout>
  );
}
