/**
 * Demo component, just used to demo the Storybook+Vitest workflow
 */
export const GithubButtons = () => (
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
