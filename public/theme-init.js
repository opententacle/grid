// Sets the color theme before the first paint (no flash). Kept outside the bundle on purpose.
(() => {
  let theme = null;
  try {
    theme = localStorage.getItem("gc.theme");
  } catch {
    // storage blocked
  }
  if (theme !== "dark" && theme !== "light") {
    theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.documentElement.dataset.theme = theme;
})();
