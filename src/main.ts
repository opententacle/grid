import "./styles/tokens.css";
import { initAnalytics } from "./analytics";
import { getLocale } from "./i18n/i18n";
import { initTheme } from "./theme";

initTheme();
document.documentElement.lang = getLocale();

const page = document.body.dataset.page;
if (page === "privacy" || page === "imprint" || page === "calc") {
  await import("./ui/gc-legal");
  const el = document.createElement("gc-legal");
  el.setAttribute("page", page);
  document.body.append(el);
} else {
  await import("./ui/gc-app");
  document.body.append(document.createElement("gc-app"));
}

void initAnalytics();
