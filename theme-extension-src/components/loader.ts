import { html, TemplateResult } from "lit";

export function renderLoader(ariaLabel: string): TemplateResult {
  return html`
    <div class="bm-loader" role="status" aria-live="polite" aria-label="${ariaLabel}">
      <style>
        .bm-loader {
          position: relative;
          display: grid;
          place-items: center;
          padding: 24px;
          min-height: 160px;
          margin: 25% 0;
          /* Universal visibility layer */
          isolation: isolate;
        }

        /* Background scrim that adapts to light/dark-ish contexts */
        .bm-loader::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 16px;

          /* Two layers: a soft dark wash + a soft light wash. One will help. */
          background:
            linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255, 0.50)),
            linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.10));

          /* Backdrop blur helps on busy backgrounds */
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);

          z-index: 0;
        }

        /* The "card" that the loader sits on */
        .bm-loader__panel {
          position: relative;
          z-index: 1;
          display: grid;
          justify-items: center;
          gap: 12px;
          padding: 18px 18px 16px;
          border-radius: 16px;

          /* Works on light or dark: semi-opaque surface + border */
          background: rgba(255, 255, 255, 0.80);
          border: 1px solid rgba(255, 255, 255, 0.22);

          /* Outer shadow + inner highlight for contrast */
          box-shadow:
            0 18px 40px rgba(0, 0, 0, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.18);

          /* If the page is dark, this still reads fine */
        }

        /* If you support dark mode explicitly, you can tweak */
        @media (prefers-color-scheme: dark) {
          .bm-loader__panel {
            background: rgba(0, 0, 0, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.18);
            box-shadow:
              0 18px 40px rgba(0, 0, 0, 0.45),
              inset 0 1px 0 rgba(255, 255, 255, 0.10);
          }
        }

        .bm-loader__label {
          font: 600 13px/1.2 system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
          letter-spacing: 0.02em;

          /* Text readable on either */
          color: #000;
          text-shadow: 0 2px 8px rgba(0,0,0,0.35);
        }

        /* --- Belt Loader (unchanged except a tiny outline) --- */
        .belt {
          width: 220px;
          height: 64px;
          position: relative;

          --buckle: #1f2328;
          --metal: #2b3036;
          --strap: #3b2c22;
          --strapHi: rgba(255, 255, 255, 0.18);
          --shadow: rgba(0, 0, 0, 0.18);
        }

        .belt__buckle {
          position: absolute;
          left: 14px;
          top: 14px;
          width: 68px;
          height: 36px;
          border-radius: 12px;
          background: linear-gradient(180deg, var(--metal), var(--buckle));
          box-shadow: 0 10px 18px rgba(0,0,0,0.35);

          /* Outline helps against similarly dark backgrounds */
          outline: 1px solid rgba(255,255,255,0.10);
        }

        .belt__buckle::before {
          content: "";
          position: absolute;
          inset: 7px 10px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.06);
          box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.10);
        }

        .belt__pin {
          position: absolute;
          left: 46px;
          top: 18px;
          width: 6px;
          height: 28px;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(255,255,255,0.26), rgba(0,0,0,0.2));
          transform-origin: 50% 6px;
          animation: pinWiggle 1.15s ease-in-out infinite;
          filter: drop-shadow(0 6px 10px rgba(0,0,0,0.35));
        }

        .belt__strap {
          position: absolute;
          left: 54px;
          top: 24px;
          height: 16px;
          width: 150px;
          border-radius: 999px;
          background: linear-gradient(180deg, var(--strap), #2a1f18);
          box-shadow: inset 0 1px 0 var(--strapHi), 0 8px 14px rgba(0,0,0,0.35);
          overflow: hidden;
          animation: slide 1.05s ease-in-out infinite;
          outline: 1px solid rgba(255,255,255,0.08);
        }

        .belt__strap::before {
          content: "";
          position: absolute;
          top: -40%;
          left: -35%;
          width: 60%;
          height: 180%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          transform: skewX(-18deg);
          animation: sheen 1.2s ease-in-out infinite;
        }

        .belt__holes {
          position: absolute;
          right: 14px;
          top: 28px;
          display: grid;
          grid-auto-flow: column;
          gap: 10px;
          opacity: 0.95;
        }

        .belt__hole {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.45);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
          transform: scale(0.85);
          animation: holes 1.05s ease-in-out infinite;
          outline: 1px solid rgba(255,255,255,0.06);
        }

        .belt__hole:nth-child(2) { animation-delay: 0.12s; }
        .belt__hole:nth-child(3) { animation-delay: 0.24s; }

        @keyframes slide { 0% { transform: translateX(-10px); } 50% { transform: translateX(8px); } 100% { transform: translateX(-10px); } }
        @keyframes sheen { 0% { transform: translateX(-30%) skewX(-18deg); opacity: 0; } 25% { opacity: 0.7; } 55% { opacity: 0.5; } 100% { transform: translateX(190%) skewX(-18deg); opacity: 0; } }
        @keyframes holes { 0%,100% { transform: scale(0.78); opacity: 0.55; } 50% { transform: scale(1); opacity: 0.95; } }
        @keyframes pinWiggle { 0%,100% { transform: rotate(-6deg); } 50% { transform: rotate(10deg); } }

        @media (prefers-reduced-motion: reduce) {
          .belt__strap, .belt__strap::before, .belt__hole, .belt__pin { animation: none !important; }
        }
      </style>

      <div class="bm-loader__panel">
        <div class="belt" aria-hidden="true">
          <div class="belt__buckle"></div>
          <div class="belt__pin"></div>
          <div class="belt__strap"></div>
          <div class="belt__holes">
            <div class="belt__hole"></div>
            <div class="belt__hole"></div>
            <div class="belt__hole"></div>
          </div>
        </div>
        <div class="bm-loader__label">${ariaLabel}</div>
      </div>
    </div>
  `;
}
