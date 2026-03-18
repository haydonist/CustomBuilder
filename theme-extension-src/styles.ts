import { css, unsafeCSS } from "lit";

import themeStyleRules from "./assets/theme.css?raw";

/** BeltMaster theme styles for common elements and components. */
export const theme = css`${unsafeCSS(themeStyleRules)}`;
