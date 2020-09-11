import urlObject from "url";
// import getSlug from "speakingurl";
//////////////////////////
// URL Helper Functions //
//////////////////////////

/**
 * @summary Returns the user defined site URL or Meteor.absoluteUrl. Add trailing '/' if missing
 */
/*
export const getSiteUrl = function () {
  let url = getSetting("siteUrl", Meteor.absoluteUrl());
  if (url.slice(-1) !== "/") {
    url += "/";
  }
  return url;
};
*/

/**
 * @summary Returns the user defined site URL or Meteor.absoluteUrl. Remove trailing '/' if it exists
 */
/*
export const getRootUrl = function () {
  let url = getSetting("siteUrl", Meteor.absoluteUrl());
  if (url.slice(-1) === "/") {
    url = url.slice(0, -1);
  }
  return url;
};
*/

/**
 * @summary The global namespace for Vulcan utils.
 * @param {String} url - the URL to redirect
 */
/*
export const getOutgoingUrl = function (url) {
  return getSiteUrl() + "out?url=" + encodeURIComponent(url);
};
*/

/*
export const slugify = function (s) {
  let slug = getSlug(s, {
    truncate: 60,
  });

  // can't have posts with an "edit" slug
  if (slug === "edit") {
    slug = "edit-1";
  }

  return slug;
};
*/
/**
 * @summary Given a collection and a slug, returns the same or modified slug that's unique within the collection;
 * It's modified by appending a dash and an integer; eg: my-slug  =>  my-slug-1
 * @param {Object} collection
 * @param {string} slug
 * @param {string} [documentId] If you are generating a slug for an existing document, pass it's _id to
 * avoid the slug changing
 * @returns {string} The slug passed in the 2nd param, but may be
 */
export const getUnusedSlug = function (collection, slug, documentId) {
  // test if slug is already in use
  for (let index = 0; index <= Number.MAX_SAFE_INTEGER; index++) {
    const suffix = index ? "-" + index : "";
    const documentWithSlug = collection.findOne({ slug: slug + suffix });
    if (
      !documentWithSlug ||
      (documentId && documentWithSlug._id === documentId)
    ) {
      return slug + suffix;
    }
  }
};

// Different version, less calls to the db but it cannot be used until we figure out how to use async for onCreate functions
// getUnusedSlug = async function (collection, slug) {
//   let suffix = '';
//   let index = 0;
//
//   const slugRegex = new RegExp('^' + slug + '-[0-9]+$');
//   // get all the slugs matching slug or slug-123 in that collection
//   const results = await collection.find( { slug: { $in: [slug, slugRegex] } }, { fields: { slug: 1, _id: 0 } });
//   const usedSlugs = results.map(item => item.slug);
//   // increment the index at the end of the slug until we find an unused one
//   while (usedSlugs.indexOf(slug + suffix) !== -1) {
//     index++;
//     suffix = '-' + index;
//   }
//   return slug + suffix;
// };

/**
 * @summary This is the same as getUnusedSlug(), but takes the name of the collection instead
 * @param {string} collectionName
 * @param {string} slug
 * @param {string} [documentId]
 * @returns {string}
 */
/*
export const getUnusedSlugByCollectionName = function (
  collectionName,
  slug,
  documentId
) {
  return getUnusedSlug(getCollection(collectionName), slug, documentId);
};
*/

export const getShortUrl = function (post) {
  return post.shortUrl || post.url;
};

export const getDomain = function (url) {
  try {
    return urlObject.parse(url).hostname.replace("www.", "");
  } catch (error) {
    return null;
  }
};

// add http: if missing
export const addHttp = function (url) {
  try {
    if (url.substring(0, 5) !== "http:" && url.substring(0, 6) !== "https:") {
      url = "http:" + url;
    }
    return url;
  } catch (error) {
    return null;
  }
};
