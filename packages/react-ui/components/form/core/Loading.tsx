// @see https://dockyard.com/blog/2020/03/02/accessible-loading-indicatorswith-no-extra-elements
export const Loading = () => (
  <span aria-live="polite" aria-busy="true">
    Loading...
  </span>
);
