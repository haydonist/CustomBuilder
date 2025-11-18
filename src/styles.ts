import { css, unsafeCSS } from "lit";

// @ts-ignore css modules
import appStyleRules from "../assets/app.css?raw";
// @ts-ignore css modules
import themeStyleRules from "../assets/theme.css?raw";

/** Application-specific styles. */
export const app = css`${unsafeCSS(appStyleRules)}`;
/** BeltMaster theme styles for common elements and components. */
export const theme = css`${unsafeCSS(themeStyleRules)}`;
