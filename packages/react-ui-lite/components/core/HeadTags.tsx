/**
 * @deprecated HeadTags are not exposed anymore,
 * copy paste this logic and adapt to your app if you need HeadTags
 */
import React, { PureComponent } from "react";
// import { Helmet } from 'react-helmet';
// import { registerComponent, Utils, getSetting, registerSetting, Head } from 'meteor/vulcan:lib';
// import compose from "recompose/compose";

// registerSetting('logoUrl', null, 'Absolute URL for the logo image');
// registerSetting('title', 'My App', 'App title');
// registerSetting('tagline', null, 'App tagline');
// registerSetting('description');
// registerSetting('siteImage', null, 'An image used to represent the site on social media');
// registerSetting('faviconUrl', '/img/favicon.ico', 'Favicon absolute URL');

export interface HeadTagsProps {
  url: string;
  title: string;
  description?: string;
  image: string;
  siteUrl: string;
  faviconUrl?: string;
}
/**
 *
 * Create basic social meta tags for a page
 * (Facebook, Twitter)
 *
 * NOTE: you are responsible for wrapping those tags in
 * next/head, Helmet or whatever solution you use for
 * head tags decentralization
 *
 *
 */
export class HeadTags extends PureComponent<HeadTagsProps> {
  render() {
    console.warn(
      "HeadTags won't work in Next.js, because Head doesn't support nesting. Define meta directly in your app instead."
    );
    const { url, title, description, siteUrl, faviconUrl } = this.props;
    let image = this.props.image;
    /*
    const url = url; //|| Utils.getSiteUrl();
    const title = title; //|| getSetting("title", "My App");
    const description = description; /*  ||
      getSetting("tagline") ||
      getSetting("description"); */
    // default image meta: logo url, else site image defined in settings
    //let image = logoUrl; /*!!getSetting("siteImage")
    //? getSetting("siteImage")
    //: getSetting("logoUrl");*/

    // overwrite default image if one is passed as props
    //if (!!this.props.image) {
    //  image = this.props.image;
    //}

    // add site url base if the image is stored locally
    if (!!image && image.indexOf("//") === -1) {
      // remove starting slash from image path if needed
      if (image.charAt(0) === "/") {
        image = image.slice(1);
      }
      image = /*getSiteUrl()*/ siteUrl + image;
    }

    return (
      <>
        <title>{title}</title>

        <meta charSet="utf-8" />
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={image} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />

        {/* twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:image:src" content={image} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />

        <link rel="canonical" href={url} />
        <link
          //name="favicon"
          rel="shortcut icon"
          href={faviconUrl || "/favicon.ico"}
        />

        {/**
 *  Not needed as we expect the end application use either Helmet at app level
 * or next/head
 * 
          {Head.meta.map((tag, index) => (
            <meta key={index} {...tag} />
          ))}
          {Head.link.map((tag, index) => (
            <link key={index} {...tag} />
          ))}
          {Head.script.map((tag, index) => (
            <script key={index} {...tag}>
              {tag.contents}
            </script>
          ))}

        {Head.components.map((componentOrArray, index) => {
          let HeadComponent;
          if (Array.isArray(componentOrArray)) {
            const [component, ...hocs] = componentOrArray;
            HeadComponent = compose(...hocs)(component);
          } else {
            HeadComponent = componentOrArray;
          }
          return <HeadComponent key={index} />;
        })}
 */}
      </>
    );
  }
}

/*
HeadTags.propTypes = {
  url: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
};
*/
