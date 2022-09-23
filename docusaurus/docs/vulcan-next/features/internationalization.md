# Internationalization (i18n)

## next-i18next latest version

Next.js and its ecosystem has made a lot of progress regarding i18n while we were coding VulcanNext.
We currently use the latest version of [next-i18next](https://github.com/isaachinman/next-i18next) package. 
Its role is to handle the loading of the right translation files depending on the user current locale.

I18n is a very vast subject, if you need more advanced features, [check Next.js documentation](https://nextjs.org/docs/advanced-features/i18n-routing), it's complete and well written.

You can tweak the configuration to fit your need, see the file named `next-i18next.config.js`.

## No automated redirect

As a default, we disable automated i18n redirect. So a French user
accessing `/` will still see the page in English. You need to redirect those user manually to `/fr`.

We think that this setup is more consistent, but don't hesitate to tweak the `i18n` config in `next-i18next.config.js`.

## Lang and dir in the custom \_document

`lang` attribute is set automatically by Next.js on `<html>` during server-render/static-render.
`dir` attribute (`rtl` or `ltr` for right-to-left and left-to-right languages) is set based on the current locale.
