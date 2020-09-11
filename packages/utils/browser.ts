/*
export const scrollPageTo = function ($, selector) {
  $("body").scrollTop($(selector).offset().top);
};
*/

export const scrollIntoView = function (selector) {
  if (!document) return;

  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView();
  }
};
