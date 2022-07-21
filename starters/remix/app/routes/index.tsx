import { Link } from "@remix-run/react";

import { useOptionalUser } from "~/utils";

const githubButtons = (
  <section className="mx-auto flex max-w-7xl justify-center py-2 text-center sm:px-6 lg:px-8">
    <iframe
      src="https://ghbtns.com/github-btn.html?user=VulcanJS&repo=eurodance-stack&type=star&count=true&size=large"
      frameBorder="0"
      scrolling="0"
      width="170"
      height="30"
      title="GitHub"
    ></iframe>
    <iframe
      src="https://ghbtns.com/github-btn.html?user=VulcanJS&repo=eurodance-stack&type=fork&count=true&size=large"
      frameBorder="0"
      scrolling="0"
      width="170"
      height="30"
      title="GitHub"
    ></iframe>
  </section>
);

const graphqlSection = (
  <section>
    <div className="m-8 border p-4">
      <h2 className="text-center text-3xl">GraphQL with a remote API</h2>
      <div className="py-8">
        <p>
          The Eurodance stack demoes patterns to connect your Remix app with
          your prefered GraphQL API.
        </p>
        <p>
          <strong>There is no client-side GraphQL involved.</strong>{" "}
        </p>
        <p>
          Remix let you define queries and mutations in a server-side, in a
          loader : you can consume GraphQL APIs as usual, but you don't need to
          bloat your client bundle with a massive GraphQL client!
        </p>
      </div>
      <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
        <Link
          className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8"
          to="/distant-api/query"
        >
          Query a distant API
        </Link>
        <Link
          className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8"
          to="/distant-api/mutation"
        >
          Send mutations to a distant API
        </Link>
      </div>
      {/*<div>
              <p>
                The query example connects to the{" "}
                <a
                  href="https://rickandmortyapi.com/"
                  target="_blank"
                  rel="norefferer noreferrer"
                >
                  Rick and Morty API
                </a>
              </p>
              <p>
                The mutation example connects to the{" "}
                <a href="https://api.spacex.land/graphql/">SpaceX API</a>.
              </p>
            </div>*/}
    </div>
  </section>
);
const contributeSection = (
  <section>
    <div className="m-8 border p-4 text-center">
      <div className="my-2">
        <a href="https://github.com/VulcanJS/eurodance-stack">
          <button className="border px-4 py-3 text-3xl text-yellow-700 shadow-sm hover:bg-yellow-50">
            Click to use this stack for your own app
          </button>
        </a>
      </div>
      <div>
        <a href="https://github.com/VulcanJS/vulcan-npm/issues/117">
          <button className="border px-4 py-3 text-xl text-yellow-700 shadow-sm hover:bg-yellow-50">
            Contribute
          </button>
        </a>
      </div>
    </div>
  </section>
);
export default function Index() {
  const user = useOptionalUser();
  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      <div className="relative sm:pb-16 sm:pt-8">
        {githubButtons}
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <div className="absolute inset-0">
              {/**<img
                className="h-full w-full object-cover"
                src="https://user-images.githubusercontent.com/1500684/157774694-99820c51-8165-4908-a031-34fc371ac0d6.jpg"
                alt="Sonic Youth On Stage"
              />*/}
              <div className="absolute inset-0 bg-[color:#7a273c] bg-[url('/img/eurodance-bg-no-text.jpg')] bg-cover bg-center bg-no-repeat mix-blend-multiply" />
            </div>
            <div className="lg:pb-18 relative bg-[rgba(0,0,0,0.3)] px-4 pt-16 pb-8 sm:px-6 sm:pt-24 sm:pb-14 lg:px-8 lg:pt-32">
              <h1 className="text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
                <span
                  // @ts-ignore
                  style={{ "text-shadow": "2px 2px 5px #333333" }}
                  className="block uppercase text-yellow-500 drop-shadow-md"
                >
                  Vulcan Eurodance Stack
                  <br />
                  🇪🇺 🐸 🛵
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-lg text-center text-xl text-white sm:max-w-3xl">
                Check the README.md file for instructions on how to get this
                project deployed.
              </p>
              <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
                {user ? (
                  <Link
                    to="/notes"
                    className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8"
                  >
                    View Notes for {user.email}
                  </Link>
                ) : (
                  <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
                    <Link
                      to="/join"
                      className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8"
                    >
                      Sign up
                    </Link>
                    <Link
                      to="/login"
                      className="flex items-center justify-center rounded-md bg-yellow-500 px-4 py-3 font-medium text-white hover:bg-yellow-600  "
                    >
                      Log In
                    </Link>
                  </div>
                )}
              </div>
              <a href="https://remix.run">
                <img
                  src="https://user-images.githubusercontent.com/1500684/158298926-e45dafff-3544-4b69-96d6-d3bcc33fc76a.svg"
                  alt="Remix"
                  className="mx-auto mt-16 w-full max-w-[12rem] md:max-w-[16rem]"
                />
              </a>
            </div>
          </div>
        </div>
        {graphqlSection}
        {contributeSection}

        <div className="mx-auto max-w-7xl py-2 px-4 sm:px-6 lg:px-8">
          <div className="mt-6 flex flex-wrap justify-center gap-8">
            {[
              {
                src: "https://user-images.githubusercontent.com/1500684/157764397-ccd8ea10-b8aa-4772-a99b-35de937319e1.svg",
                alt: "Fly.io",
                href: "https://fly.io",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157764395-137ec949-382c-43bd-a3c0-0cb8cb22e22d.svg",
                alt: "SQLite",
                href: "https://sqlite.org",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157764484-ad64a21a-d7fb-47e3-8669-ec046da20c1f.svg",
                alt: "Prisma",
                href: "https://prisma.io",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157764276-a516a239-e377-4a20-b44a-0ac7b65c8c14.svg",
                alt: "Tailwind",
                href: "https://tailwindcss.com",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157764454-48ac8c71-a2a9-4b5e-b19c-edef8b8953d6.svg",
                alt: "Cypress",
                href: "https://www.cypress.io",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157772386-75444196-0604-4340-af28-53b236faa182.svg",
                alt: "MSW",
                href: "https://mswjs.io",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157772447-00fccdce-9d12-46a3-8bb4-fac612cdc949.svg",
                alt: "Vitest",
                href: "https://vitest.dev",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157772662-92b0dd3a-453f-4d18-b8be-9fa6efde52cf.png",
                alt: "Testing Library",
                href: "https://testing-library.com",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157772934-ce0a943d-e9d0-40f8-97f3-f464c0811643.svg",
                alt: "Prettier",
                href: "https://prettier.io",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157772990-3968ff7c-b551-4c55-a25c-046a32709a8e.svg",
                alt: "ESLint",
                href: "https://eslint.org",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157773063-20a0ed64-b9f8-4e0b-9d1e-0b65a3d4a6db.svg",
                alt: "TypeScript",
                href: "https://typescriptlang.org",
              },
            ].map((img) => (
              <a
                key={img.href}
                href={img.href}
                className="flex h-16 w-32 justify-center p-1 grayscale transition hover:grayscale-0 focus:grayscale-0"
              >
                <img alt={img.alt} src={img.src} />
              </a>
            ))}
          </div>
        </div>
        <div className="my-4 text-center">
          <a
            href="https://vercel.com?utm_source=vulcan&utm_campaign=oss"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="inline-block"
              alt="Powered by Vercel"
              src="https://www.datocms-assets.com/31049/1618983297-powered-by-vercel.svg"
            />
          </a>
        </div>
      </div>
    </main>
  );
}
