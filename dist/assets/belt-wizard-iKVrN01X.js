var Lr=Object.create;var ke=Object.defineProperty;var Fr=Object.getOwnPropertyDescriptor;var di=(f,b)=>(b=Symbol[f])?b:Symbol.for("Symbol."+f),St=f=>{throw TypeError(f)};var hi=(f,b,k)=>b in f?ke(f,b,{enumerable:!0,configurable:!0,writable:!0,value:k}):f[b]=k;var pi=(f,b)=>ke(f,"name",{value:b,configurable:!0});var ee=f=>[,,,Lr((f==null?void 0:f[di("metadata")])??null)],ui=["class","method","getter","setter","accessor","field","value","get","set"],jt=f=>f!==void 0&&typeof f!="function"?St("Function expected"):f,jr=(f,b,k,G,T)=>({kind:ui[f],name:b,metadata:G,addInitializer:F=>k._?St("Already initialized"):T.push(jt(F||null))}),Br=(f,b)=>hi(b,di("metadata"),f[3]),h=(f,b,k,G)=>{for(var T=0,F=f[b>>1],W=F&&F.length;T<W;T++)b&1?F[T].call(k):G=F[T].call(k,G);return G},S=(f,b,k,G,T,F)=>{var W,N,Bt,rt,_t,E=b&7,At=!!(b&8),Q=!!(b&16),Et=E>3?f.length+1:E?At?1:2:0,Nt=ui[E+5],J=E>3&&(f[Et-1]=[]),Ut=f[Et]||(f[Et]=[]),q=E&&(!Q&&!At&&(T=T.prototype),E<5&&(E>3||!Q)&&Fr(E<4?T:{get[k](){return R(this,F)},set[k](V){return yt(this,F,V)}},k));E?Q&&E<4&&pi(F,(E>2?"set ":E>1?"get ":"")+k):pi(T,k);for(var ct=G.length-1;ct>=0;ct--)rt=jr(E,k,Bt={},f[3],Ut),E&&(rt.static=At,rt.private=Q,_t=rt.access={has:Q?V=>Nr(T,V):V=>k in V},E^3&&(_t.get=Q?V=>(E^1?R:Ur)(V,T,E^4?F:q.get):V=>V[k]),E>2&&(_t.set=Q?(V,ot)=>yt(V,T,ot,E^4?F:q.set):(V,ot)=>V[k]=ot)),N=(0,G[ct])(E?E<4?Q?F:q[Nt]:E>4?void 0:{get:q.get,set:q.set}:T,rt),Bt._=1,E^4||N===void 0?jt(N)&&(E>4?J.unshift(N):E?Q?F=N:q[Nt]=N:T=N):typeof N!="object"||N===null?St("Object expected"):(jt(W=N.get)&&(q.get=W),jt(W=N.set)&&(q.set=W),jt(W=N.init)&&J.unshift(W));return E||Br(f,T),q&&ke(T,k,q),Q?E^4?F:q:T},y=(f,b,k)=>hi(f,typeof b!="symbol"?b+"":b,k),$e=(f,b,k)=>b.has(f)||St("Cannot "+k),Nr=(f,b)=>Object(b)!==b?St('Cannot use the "in" operator on this value'):f.has(b),R=(f,b,k)=>($e(f,b,"read from private field"),k?k.call(f):b.get(f)),Se=(f,b,k)=>b.has(f)?St("Cannot add the same private member more than once"):b instanceof WeakSet?b.add(f):b.set(f,k),yt=(f,b,k,G)=>($e(f,b,"write to private field"),G?G.call(f,k):b.set(f,k),k),Ur=(f,b,k)=>($e(f,b,"access private method"),k);(function(){"use strict";var _n,An,En,Cn,Tn,In,Pn,zn,Dn,Rn,Vn,On,Ln,Fn,jn,x,Bn,Nn,Un,Mn,Gn,Hn,qn,B,$t,O,Yn,Xn,Wn,Qn,Kn,Jn,Zn,ti,ei,ni,ii,ri,oi,si,ai,li,ci,m;var f=document.createElement("style");f.textContent=`@font-face{font-family:Founders Grotesque X Condensed;font-weight:700;src:url(./FoundersGroteskXCond-Bold.otf)}@font-face{font-family:Founders Grotesque X Condensed Light;font-weight:lighter;src:url(./FoundersGroteskXCond-Lt.otf)}@font-face{font-family:Founders Grotesque Condensed;font-weight:lighter;src:url(./FoundersGroteskCond-Lt.otf)}:root{--neutral-white: #fff;--neutral-lightest: #f2f2f2;--neutral-lighter: #dadada;--neutral-light: #b6b6b6;--neutral: #fff;--neutral-dark: #545454;--neutral-darker: #242424;--neutral-darkest: #0c0c0c;--potters-clay-lightest: #f3eeeb;--potters-clay-lighter: #e7ded8;--potters-clay-light: #ad8e76;--potters-clay: #8b5e3c;--potters-clay-dark: #6f4b30;--potters-clay-darker: #372518;--potters-clay-darkest: #291c12;--spring-wood-lightest: #fefefd;--spring-wood-lighter: #fdfdfc;--spring-wood-light: #faf8f4;--spring-wood: #f8f5f0;--spring-wood-dark: #c6c4c0;--spring-wood-darker: #636260;--spring-wood-darkest: #4a4948;--old-gold-lightest: #faf7eb;--old-gold-lighter: #f6efd7;--old-gold-light: #e8c773;--old-gold: #d4af37;--old-gold-dark: #a98c2c;--old-gold-darker: #544616;--old-gold-darkest: #3f3410;--belt-wizard-background-color: var(--potters-clay-darkest);--gap-small: 1rem;--gap-medium: 1rem;--radius-medium: 16px;--radius-large: 16px;--shadow-xxs: 0 1px 2px 0 #0000000d;--shadow-xs: 0 1px 2px 0 #0000000f, 0 1px 3px 0 #0000001a;--shadow-small: 0 4px 2px -2px #0000000d, 0 4px 8px -2px #0000001a;--shadow-medium: 0 4px 6px -2px #00000008, 0 12px 16px -4px #00000014;--shadow-large: 0 8px 8px -4px #00000008, 0 20px 24px -4px #00000014;--shadow-xl: 0 24px 48px -12px #0000002e;--shadow-xxl: 0 32px 64px -12px #00000024}body{font-family:Work Sans,sans-serif;font-optical-sizing:auto;font-weight:400;font-style:normal}h1,h2,h3,h4,h5,h6{font-family:Founders Grotesque X Condensed,sans-serif;font-optical-sizing:auto;font-weight:400;font-style:normal}h1,.heading-1{font-size:84px}h2,.heading-2{font-size:60px}h3,.heading-3{font-size:48px}h4,.heading-4{font-size:40px}h5,.heading-5{font-size:32px}h6,.heading-6{font-size:26px}.tagline{font-size:16px}.sr-only{clip:rect(0 0 0 0);clip-path:inset(50%);height:1px;overflow:hidden;position:absolute;white-space:nowrap;width:1px}.container{max-width:960px}.row{display:flex}.row.wrap{flex-wrap:wrap}.column{display:flex;flex-direction:column}.gap-medium{gap:var(--gap-medium)}.gap-small{gap:var(--gap-small)}button.btn,a.btn{color:#fff;font-family:Work Sans,sans-serif;font-weight:700;text-decoration:none;padding:12px 22px;border:none;border-radius:8px;background:#8b5e3c;cursor:pointer;box-shadow:0 1px 2px #0c0c0c0d,inset 0 -2px 1px #0003,inset 0 0 0 1px #0c0c0c26,inset 0 2px 1px #ffffff40,inset 0 32px 24px #ffffff0d!important;transition:background-color .3s ease,box-shadow .3s ease}a.btn{text-decoration:none}button.btn.primary,a.btn.primary{color:var(--neutral-white);background-color:#8b5e3c}#stepShortcut{position:relative;z-index:5}.btn.primary:hover{background-color:#7a4f31;box-shadow:0 4px 6px #0000000f,inset 0 -2px 1px #0003,inset 0 0 0 1px #00000026}.btn.primary[disabled],.btn.primary[disabled]:hover{opacity:.5!important;cursor:not-allowed!important}button.btn.secondary,a.btn.secondary{color:var(--neutral-darkest);background-color:#0c0c0c0d;box-shadow:0 1px 2px #0c0c0c0d,inset 0 -2px 1px #0c0c0c0d,inset 0 0 0 1px #0c0c0c0d}button.btn.tertiary,a.btn.tertiary{color:var(--neutral-darkest);background-color:transparent;box-shadow:none}button.btn.tertiary:hover,a.btn.tertiary:hover{box-shadow:0 1px 2px #0c0c0c0d,inset 0 -2px 1px #0c0c0c0d,inset 0 0 0 1px #0c0c0c0d}.buckle-option{display:flex;flex-direction:column;align-items:center}.buckle-variants{margin-top:8px}.buckle-variant-swatch{border:none;padding:0;margin:3px;background:transparent;cursor:pointer;border-radius:8px;overflow:hidden}.buckle-variant-swatch img{display:block;width:48px;height:48px;object-fit:cover}.buckle-variant-swatch.is-selected{outline:2px solid var(--old-gold);outline-offset:2px}.variant-popup[data-kind=base] .variant-swatch img{scale:1}.collection-title{font-size:2rem;margin-bottom:0}.option{cursor:pointer;max-width:170px}.option .selection-indicator{min-width:128px;max-width:calc(50vw - 44px);width:160px;aspect-ratio:1}.option.text-only,.option .selection-indicator{object-fit:contain}.option:not(.text-only):not(.color-chip) label{display:flex;flex-direction:column;align-items:center;position:relative}.option.text-only{display:flex;align-items:center;justify-content:center;width:3rem;height:3rem;margin:3px;border:1px solid var(--neutral-white);border-radius:8px;background:#fff3;transition:background-color .3s ease,border-color .3s ease}.row.wrap:has(.option.text-only){display:grid;grid-template-columns:auto auto auto auto;margin:0 auto;width:min-content}@media screen and (min-width:500px){.row.wrap:has(.option.text-only){margin:initial}}.option.text-only:has(input:checked){margin:0;border-width:4px;background:#ffffff80}.option.color-chip label{align-items:center}.option.color-chip .selection-indicator{display:inline-block;min-width:64px;width:64px;height:64px}.option label{cursor:pointer;text-wrap:auto;text-align:center}.option.thumbnail label span.label{font-size:18px;font-weight:600;margin-bottom:.2rem}.option:not(.text-only) label span.label{margin-block-start:8px;text-align:center}.option.text-only label{display:inline-block;font-size:24px;padding:8px 3px}.option:not(.text-only) input:checked+label .selection-indicator{padding:0}.option:not(.text-only) input:checked+label .selection-indicator,.option.thumbnail.selected .selection-indicator-wrapper{margin:0;border-width:4px;background:#ffffff80;aspect-ratio:1}.option.thumbnail[data-kind=concho] img.selection-indicator{transform:scale(5)}.option.thumbnail[data-kind=buckle][data-is-set=false] img.selection-indicator{transform:scale(2) translate(15%)}.option.thumbnail[data-kind=buckle][data-is-set=true] img.selection-indicator{transform:translate(-5%)}.option.thumbnail[data-kind=loop] img.selection-indicator,.option.thumbnail[data-kind=tip] img.selection-indicator{transform:scale(3)}.option.thumbnail .selection-indicator-wrapper{position:relative;display:inline-block;margin:3px;border:1px solid var(--neutral-white);border-radius:8px;background:#fff3;transition:background-color .3s ease,border-color .3s ease;overflow:hidden}.option.thumbnail[data-kind=base] .selection-indicator-wrapper{position:relative}.option.thumbnail[data-kind=base] .selection-indicator{transition:opacity .3s ease}.option.thumbnail[data-kind=base] .hover-image{position:absolute;top:0;right:0;bottom:0;left:0;opacity:0;transition:opacity .3s ease;object-fit:contain}.option.thumbnail[data-kind=base]:hover .hover-image{opacity:1}.option.thumbnail[data-kind=base]:hover .selection-indicator{opacity:0}.option.thumbnail .option-count{position:absolute;top:4px;right:4px;padding:2px 6px;border-radius:999px;background:#0c0c0cd9;color:var(--neutral-white);font-size:12px;font-weight:600;pointer-events:none}.option.thumbnail .variant-swatch .option-count{font-size:6px}.option.thumbnail{position:relative}.variant-popup{position:absolute;scale:2;top:0;right:0;bottom:0;left:0;display:flex;align-items:center;justify-content:center;padding:8px;border-radius:8px;z-index:10;height:50%}.variant-popup-grid{display:flex;flex-wrap:wrap;justify-content:center;background:#ffffff95;border-radius:.5rem;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}.variant-swatch{border:none;padding:0;margin:2px;cursor:pointer;border-radius:6px;overflow:hidden;background:#fff;position:relative}.variant-swatch img{display:block;width:40px;height:40px;scale:5;object-fit:cover}.variant-swatch.is-selected{outline:2px solid var(--old-gold)}#preview{opacity:0;transform:translate(120px);max-height:150px}#preview.preview-enter{animation:previewSlideIn 1s ease forwards}section.step.step-shifted{animation:optionsSlideDown 1s ease forwards}@keyframes previewSlideIn{0%{opacity:0;transform:translate(120px)}to{opacity:1;transform:translate(0)}}@keyframes optionsSlideDown{0%{transform:translateY(-20%)}to{transform:translateY(0)}}.step-title,.step-content{opacity:0;transform:scale(.96) translateY(8px)}.step-title.step-enter-0,.step-content.step-enter-0{animation:stepGrowIn-0 .5s ease forwards}.step-title.step-enter-1,.step-content.step-enter-1{animation:stepGrowIn-1 .5s ease forwards}.step-title.step-enter-2,.step-content.step-enter-2{animation:stepGrowIn-2 .5s ease forwards}.step-title.step-enter-3,.step-content.step-enter-3{animation:stepGrowIn-3 .5s ease forwards}.step-title.step-enter-4,.step-content.step-enter-4{animation:stepGrowIn-4 .5s ease forwards}.step-title.step-enter-5,.step-content.step-enter-5{animation:stepGrowIn-5 .5s ease forwards}.step-title.step-enter-6,.step-content.step-enter-6{animation:stepGrowIn-6 .5s ease forwards}@keyframes stepGrowIn-0{0%{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}@keyframes stepGrowIn-1{0%{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}@keyframes stepGrowIn-2{0%{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}@keyframes stepGrowIn-3{0%{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}@keyframes stepGrowIn-4{0%{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}@keyframes stepGrowIn-5{0%{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}@keyframes stepGrowIn-6{0%{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}belt-wizard #summary .summary-header{margin-bottom:1.5rem}belt-wizard #summary .summary-warning{border:1px solid #d97757;padding:1rem 1.25rem;border-radius:.5rem;font-size:.9rem}belt-wizard #summary .summary-warning p{margin:0 0 .5rem;font-weight:600}belt-wizard #summary .summary-warning ul{margin:0;padding-left:0;list-style:none;display:flex;flex-wrap:wrap;gap:.5rem}belt-wizard #summary .summary-warning li{margin:0}belt-wizard #summary .summary-missing-link{border:1px dashed #d97757;color:#fff;background:transparent;border-radius:999px;padding:.35rem .75rem;font-size:.85rem;cursor:pointer;white-space:nowrap}belt-wizard #summary .summary-missing-link:hover{background:#fed7aa}belt-wizard #summary .summary-complete{margin:.5rem 0 0;font-size:.9rem;color:#15803d;font-weight:500}.size-step-wrapper{display:flex;align-items:flex-start;gap:2rem}.switch{display:inline-flex;align-items:center;gap:10px;-webkit-user-select:none;user-select:none;cursor:pointer;font-size:14px}.switch input{position:absolute;opacity:0;pointer-events:none}.switch-track{width:42px;height:24px;border-radius:999px;background:#b0b0b0;position:relative;transition:background .15s ease;flex:0 0 auto}.switch-thumb{width:18px;height:18px;border-radius:999px;background:#fff;position:absolute;top:3px;left:3px;transition:transform .15s ease;box-shadow:0 1px 2px #00000059}.switch input:checked+.switch-track{background:#476fff}.switch input:checked+.switch-track .switch-thumb{transform:translate(18px)}.switch input:focus-visible+.switch-track{outline:2px solid #476fff;outline-offset:2px}.switch-label{line-height:1}.buckle-switch-row{margin-top:8px}.step-tools{display:flex;justify-content:flex-end;align-items:center;gap:12px;margin-bottom:12px}.filter-wrap{position:relative;display:inline-flex;align-items:center}.filter-btn{width:30px;height:30px;padding:0;border:0;border-radius:8px;background:#ffffff14;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}.filter-btn:hover{background:#ffffff24}.filter-btn:active{transform:scale(.98)}.filter-icon{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;line-height:0}.filter-icon .bar{display:block;height:3px;border-radius:999px;background:#fff}.filter-icon .bar-1{width:18px}.filter-icon .bar-2{width:14px}.filter-icon .bar-3{width:10px}.filter-popover{position:absolute;top:calc(100% + 8px);right:0;width:280px;background:#fff;border-radius:12px;padding:12px;box-shadow:0 12px 28px #00000047;z-index:9999}.filter-popover-header{display:flex;align-items:center;justify-content:space-between;gap:8px}.filter-popover-title{font-size:14px;font-weight:600;color:#111}.filter-popover-close{border:0;background:transparent;font-size:20px;line-height:1;cursor:pointer;color:#111}.filter-popover-body{margin-top:10px;min-height:80px}.filter-item{display:flex;align-items:center;gap:10px;color:#111!important;font-size:14px;width:100%;border:1px solid rgba(0,0,0,.1);background:transparent;color:inherit;border-radius:10px;padding:10px 12px;text-align:left;cursor:pointer;font:inherit;line-height:1.2}.filter-list{display:flex;flex-direction:column;gap:6px;padding:6px}.filter-item:hover{background:#0000000f}.filter-item.is-selected{background:#111;color:#fff!important;border-color:#111}.filter-item.is-selected:hover{background:#000}.filter-item:focus-visible{outline:2px solid rgba(17,17,17,.6);outline-offset:2px}.filter-item-title{display:block}.concho-helper-text{padding:.5rem 1rem;background-color:#ffffff0d;border-left:4px solid var(--color-primary, #333);border-radius:4px;margin-right:auto;max-width:500px}.concho-helper-text p{margin:0;font-size:14px;color:inherit}.concho-helper-text strong{font-weight:600}html,body{margin:0;padding:0;font-family:Work Sans,sans-serif;background-color:var(--belt-wizard-background-color)}body{color:var(--neutral);display:flex;flex-direction:column;justify-content:flex-start;min-height:100vh;margin:0 auto;overflow-x:hidden}a{color:var(--potters-clay-light)}body>header{display:flex;justify-content:space-between;align-items:center;padding-inline:20px;height:75px}@media screen and (min-width:500px){body>header{padding-inline:64px;justify-content:unset}}header#navbar{color:var(--neutral-darkest);background-color:var(--potters-clay-lightest)}header#navbar .logo{height:28px}header#navbar nav{display:none}@media screen and (min-width:500px){header#navbar nav{display:unset;flex-grow:1}}header#navbar ul{display:flex;justify-content:center;list-style:none;margin:0;padding:0;gap:32px}header#navbar li{padding:0}header#navbar li a{color:var(--neutral-darkest);font-weight:400;text-decoration:none}header#navbar li a:hover{text-decoration:underline}body>main{display:flex;flex-direction:column;flex-grow:1;margin:0rem auto;min-width:1260px;max-width:min(1260px,100%)}#jumbotron{display:flex;flex-direction:column;justify-content:center;flex-grow:1;margin-inline:-8px;padding-inline-start:24px;background:url(/assets/belts/jumbotron-belts.png),radial-gradient(#433f3c,#2d2d2d);background-repeat:no-repeat,no-repeat;background-size:55vw,auto;background-position-x:-25%,center;background-position-y:center,center;background-position-y:bottom 10%,center}#jumbotron[hidden]{display:none}@media screen and (min-width:500px){#jumbotron{padding-inline-start:50vw;background-size:57vw,auto;background-position-x:left,center;background-position-y:130%,center;background-position-y:bottom 10%,center}}@media screen and (max-width:500px){#jumbotron{background-size:90vw,auto;background-position-x:left,center;background-position-y:20%,center;background-position-y:bottom 10%,center}}#jumbotron h1{font-family:Founders Grotesque X Condensed Light;letter-spacing:.15em;text-transform:uppercase;margin:0}#jumbotron h2{margin-block-start:0;margin-block-end:.5em;font-family:Times New Roman,Times,serif;font-size:44px}@media screen and (min-width:500px){#jumbotron h2{font-size:60px}}#jumbotron p{margin-block-start:0;color:var(--potters-clay-light)}#jumbotron button.btn{align-self:flex-start}belt-wizard{flex-grow:1;margin-inline:8px}#stepper{position:relative;display:flex;flex-grow:1;justify-content:space-between;margin:0 auto;max-width:1260px}#stepper:before{content:"";position:absolute;width:100%;height:1px;background-color:var(--neutral-white);top:7px;z-index:0}#stepper button.step{position:relative;width:14px;height:14px;border-radius:7px;border:none;background-color:#b6c6fd;z-index:1;cursor:pointer}#stepper button.step:not(:first-child):before{content:"";display:block;position:absolute;background-color:var(--belt-wizard-background-color);width:7px;height:1px;left:-50%}#stepper button.step:not(:last-child):after{content:"";display:block;position:absolute;background-color:var(--belt-wizard-background-color);width:7px;height:1px;right:-50%}#stepper button.step:disabled{background-color:#476fff;cursor:not-allowed}#stepHeading{margin-block-start:2em}#stepHeading h2{margin-block:0}#stepHeading h2~.subtitle{margin-block-start:0}#stepTitle{flex-grow:1}belt-wizard section.step h2{margin-block-start:0;margin-block-end:.5em}belt-wizard>header{position:sticky;top:0;padding-block-start:1rem;background:var(--belt-wizard-background-color);z-index:5}#preview belt-preview{display:block;position:relative;left:-8px;min-height:150px;pointer-events:none;transition:transform .5s ease-in-out;align-content:center}#preview belt-preview.step-1{transform:scale(1.5) translate(1600px);transform-origin:left}#preview belt-preview.step-2{transform:scale(1.5) translate(300px);transform-origin:left}#preview belt-preview.step-3{transform:scale(2.5) translate(150px);transform-origin:left}#preview belt-preview.step-4{transform:scale(2) translate(89px)}#preview belt-preview.step-5{transform:scale(1.5) translate(-300px);transform-origin:right}#size{background-position:right 30%;background-size:80vw auto;background-repeat:no-repeat;position:relative;margin-top:-10%;z-index:5}@media screen and (min-width:500px){#size{background-position-x:right;background-position-y:20%;background-size:450px auto}}#sizingChart{width:auto;border-radius:8px}@media screen and (min-width:500px){#sizingChart{max-width:50vw;position:absolute;right:0;top:-20%}}#checkoutTotal{margin-block:28px 16px}
/*$vite$:1*/`,document.head.appendChild(f);/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const b=globalThis,k=b.ShadowRoot&&(b.ShadyCSS===void 0||b.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,G=Symbol(),T=new WeakMap;let F=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==G)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(k&&e===void 0){const n=t!==void 0&&t.length===1;n&&(e=T.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&T.set(t,e))}return e}toString(){return this.cssText}};const W=i=>new F(typeof i=="string"?i:i+"",void 0,G),N=(i,...e)=>{const t=i.length===1?i[0]:e.reduce((n,r,o)=>n+(s=>{if(s._$cssResult$===!0)return s.cssText;if(typeof s=="number")return s;throw Error("Value passed to 'css' function must be a 'css' function result: "+s+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+i[o+1],i[0]);return new F(t,i,G)},Bt=(i,e)=>{if(k)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const n=document.createElement("style"),r=b.litNonce;r!==void 0&&n.setAttribute("nonce",r),n.textContent=t.cssText,i.appendChild(n)}},rt=k?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(const n of e.cssRules)t+=n.cssText;return W(t)})(i):i;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:_t,defineProperty:E,getOwnPropertyDescriptor:At,getOwnPropertyNames:Q,getOwnPropertySymbols:Et,getPrototypeOf:Nt}=Object,J=globalThis,Ut=J.trustedTypes,q=Ut?Ut.emptyScript:"",ct=J.reactiveElementPolyfillSupport,V=(i,e)=>i,ot={toAttribute(i,e){switch(e){case Boolean:i=i?q:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},ne=(i,e)=>!_t(i,e),_e={attribute:!0,type:String,converter:ot,reflect:!1,useDefault:!1,hasChanged:ne};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),J.litPropertyMetadata??(J.litPropertyMetadata=new WeakMap);let wt=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=_e){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&E(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){const{get:r,set:o}=At(this.prototype,e)??{get(){return this[t]},set(s){this[t]=s}};return{get:r,set(s){const a=r==null?void 0:r.call(this);o==null||o.call(this,s),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??_e}static _$Ei(){if(this.hasOwnProperty(V("elementProperties")))return;const e=Nt(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(V("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(V("properties"))){const t=this.properties,n=[...Q(t),...Et(t)];for(const r of n)this.createProperty(r,t[r])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[n,r]of t)this.elementProperties.set(n,r)}this._$Eh=new Map;for(const[t,n]of this.elementProperties){const r=this._$Eu(t,n);r!==void 0&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const r of n)t.unshift(rt(r))}else e!==void 0&&t.push(rt(e));return t}static _$Eu(e,t){const n=t.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var e;this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),(e=this.constructor.l)==null||e.forEach(t=>t(this))}addController(e){var t;(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&((t=e.hostConnected)==null||t.call(e))}removeController(e){var t;(t=this._$EO)==null||t.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Bt(e,this.constructor.elementStyles),e}connectedCallback(){var e;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$EO)==null||e.forEach(t=>{var n;return(n=t.hostConnected)==null?void 0:n.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$EO)==null||e.forEach(t=>{var n;return(n=t.hostDisconnected)==null?void 0:n.call(t)})}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){var o;const n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&n.reflect===!0){const s=(((o=n.converter)==null?void 0:o.toAttribute)!==void 0?n.converter:ot).toAttribute(t,n.type);this._$Em=e,s==null?this.removeAttribute(r):this.setAttribute(r,s),this._$Em=null}}_$AK(e,t){var o,s;const n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){const a=n.getPropertyOptions(r),l=typeof a.converter=="function"?{fromAttribute:a.converter}:((o=a.converter)==null?void 0:o.fromAttribute)!==void 0?a.converter:ot;this._$Em=r;const c=l.fromAttribute(t,a.type);this[r]=c??((s=this._$Ej)==null?void 0:s.get(r))??c,this._$Em=null}}requestUpdate(e,t,n,r=!1,o){var s;if(e!==void 0){const a=this.constructor;if(r===!1&&(o=this[e]),n??(n=a.getPropertyOptions(e)),!((n.hasChanged??ne)(o,t)||n.useDefault&&n.reflect&&o===((s=this._$Ej)==null?void 0:s.get(e))&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:o},s){n&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,s??t??this[e]),o!==!0||s!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),r===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var n;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[o,s]of this._$Ep)this[o]=s;this._$Ep=void 0}const r=this.constructor.elementProperties;if(r.size>0)for(const[o,s]of r){const{wrapped:a}=s,l=this[o];a!==!0||this._$AL.has(o)||l===void 0||this.C(o,void 0,s,l)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),(n=this._$EO)==null||n.forEach(r=>{var o;return(o=r.hostUpdate)==null?void 0:o.call(r)}),this.update(t)):this._$EM()}catch(r){throw e=!1,this._$EM(),r}e&&this._$AE(t)}willUpdate(e){}_$AE(e){var t;(t=this._$EO)==null||t.forEach(n=>{var r;return(r=n.hostUpdated)==null?void 0:r.call(n)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(t=>this._$ET(t,this[t]))),this._$EM()}updated(e){}firstUpdated(e){}};wt.elementStyles=[],wt.shadowRootOptions={mode:"open"},wt[V("elementProperties")]=new Map,wt[V("finalized")]=new Map,ct==null||ct({ReactiveElement:wt}),(J.reactiveElementVersions??(J.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ct=globalThis,Ae=i=>i,Mt=Ct.trustedTypes,Ee=Mt?Mt.createPolicy("lit-html",{createHTML:i=>i}):void 0,Ce="$lit$",st=`lit$${Math.random().toFixed(9).slice(2)}$`,Te="?"+st,fi=`<${Te}>`,pt=document,Tt=()=>pt.createComment(""),It=i=>i===null||typeof i!="object"&&typeof i!="function",ie=Array.isArray,gi=i=>ie(i)||typeof(i==null?void 0:i[Symbol.iterator])=="function",re=`[ 	
\f\r]`,Pt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ie=/-->/g,Pe=/>/g,dt=RegExp(`>|${re}(?:([^\\s"'>=/]+)(${re}*=${re}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ze=/'/g,De=/"/g,Re=/^(?:script|style|textarea|title)$/i,bi=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),w=bi(1),ht=Symbol.for("lit-noChange"),P=Symbol.for("lit-nothing"),Ve=new WeakMap,ut=pt.createTreeWalker(pt,129);function Oe(i,e){if(!ie(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ee!==void 0?Ee.createHTML(e):e}const mi=(i,e)=>{const t=i.length-1,n=[];let r,o=e===2?"<svg>":e===3?"<math>":"",s=Pt;for(let a=0;a<t;a++){const l=i[a];let c,d,p=-1,u=0;for(;u<l.length&&(s.lastIndex=u,d=s.exec(l),d!==null);)u=s.lastIndex,s===Pt?d[1]==="!--"?s=Ie:d[1]!==void 0?s=Pe:d[2]!==void 0?(Re.test(d[2])&&(r=RegExp("</"+d[2],"g")),s=dt):d[3]!==void 0&&(s=dt):s===dt?d[0]===">"?(s=r??Pt,p=-1):d[1]===void 0?p=-2:(p=s.lastIndex-d[2].length,c=d[1],s=d[3]===void 0?dt:d[3]==='"'?De:ze):s===De||s===ze?s=dt:s===Ie||s===Pe?s=Pt:(s=dt,r=void 0);const g=s===dt&&i[a+1].startsWith("/>")?" ":"";o+=s===Pt?l+fi:p>=0?(n.push(c),l.slice(0,p)+Ce+l.slice(p)+st+g):l+st+(p===-2?a:g)}return[Oe(i,o+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]};class zt{constructor({strings:e,_$litType$:t},n){let r;this.parts=[];let o=0,s=0;const a=e.length-1,l=this.parts,[c,d]=mi(e,t);if(this.el=zt.createElement(c,n),ut.currentNode=this.el.content,t===2||t===3){const p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(r=ut.nextNode())!==null&&l.length<a;){if(r.nodeType===1){if(r.hasAttributes())for(const p of r.getAttributeNames())if(p.endsWith(Ce)){const u=d[s++],g=r.getAttribute(p).split(st),$=/([.?@])?(.*)/.exec(u);l.push({type:1,index:o,name:$[2],strings:g,ctor:$[1]==="."?wi:$[1]==="?"?vi:$[1]==="@"?xi:Gt}),r.removeAttribute(p)}else p.startsWith(st)&&(l.push({type:6,index:o}),r.removeAttribute(p));if(Re.test(r.tagName)){const p=r.textContent.split(st),u=p.length-1;if(u>0){r.textContent=Mt?Mt.emptyScript:"";for(let g=0;g<u;g++)r.append(p[g],Tt()),ut.nextNode(),l.push({type:2,index:++o});r.append(p[u],Tt())}}}else if(r.nodeType===8)if(r.data===Te)l.push({type:2,index:o});else{let p=-1;for(;(p=r.data.indexOf(st,p+1))!==-1;)l.push({type:7,index:o}),p+=st.length-1}o++}}static createElement(e,t){const n=pt.createElement("template");return n.innerHTML=e,n}}function vt(i,e,t=i,n){var s,a;if(e===ht)return e;let r=n!==void 0?(s=t._$Co)==null?void 0:s[n]:t._$Cl;const o=It(e)?void 0:e._$litDirective$;return(r==null?void 0:r.constructor)!==o&&((a=r==null?void 0:r._$AO)==null||a.call(r,!1),o===void 0?r=void 0:(r=new o(i),r._$AT(i,t,n)),n!==void 0?(t._$Co??(t._$Co=[]))[n]=r:t._$Cl=r),r!==void 0&&(e=vt(i,r._$AS(i,e.values),r,n)),e}class yi{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:n}=this._$AD,r=((e==null?void 0:e.creationScope)??pt).importNode(t,!0);ut.currentNode=r;let o=ut.nextNode(),s=0,a=0,l=n[0];for(;l!==void 0;){if(s===l.index){let c;l.type===2?c=new Dt(o,o.nextSibling,this,e):l.type===1?c=new l.ctor(o,l.name,l.strings,this,e):l.type===6&&(c=new ki(o,this,e)),this._$AV.push(c),l=n[++a]}s!==(l==null?void 0:l.index)&&(o=ut.nextNode(),s++)}return ut.currentNode=pt,r}p(e){let t=0;for(const n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}}class Dt{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=P,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=(r==null?void 0:r.isConnected)??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=vt(this,e,t),It(e)?e===P||e==null||e===""?(this._$AH!==P&&this._$AR(),this._$AH=P):e!==this._$AH&&e!==ht&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):gi(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==P&&It(this._$AH)?this._$AA.nextSibling.data=e:this.T(pt.createTextNode(e)),this._$AH=e}$(e){var o;const{values:t,_$litType$:n}=e,r=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=zt.createElement(Oe(n.h,n.h[0]),this.options)),n);if(((o=this._$AH)==null?void 0:o._$AD)===r)this._$AH.p(t);else{const s=new yi(r,this),a=s.u(this.options);s.p(t),this.T(a),this._$AH=s}}_$AC(e){let t=Ve.get(e.strings);return t===void 0&&Ve.set(e.strings,t=new zt(e)),t}k(e){ie(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let n,r=0;for(const o of e)r===t.length?t.push(n=new Dt(this.O(Tt()),this.O(Tt()),this,this.options)):n=t[r],n._$AI(o),r++;r<t.length&&(this._$AR(n&&n._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){var n;for((n=this._$AP)==null?void 0:n.call(this,!1,!0,t);e!==this._$AB;){const r=Ae(e).nextSibling;Ae(e).remove(),e=r}}setConnected(e){var t;this._$AM===void 0&&(this._$Cv=e,(t=this._$AP)==null||t.call(this,e))}}class Gt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,o){this.type=1,this._$AH=P,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=o,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=P}_$AI(e,t=this,n,r){const o=this.strings;let s=!1;if(o===void 0)e=vt(this,e,t,0),s=!It(e)||e!==this._$AH&&e!==ht,s&&(this._$AH=e);else{const a=e;let l,c;for(e=o[0],l=0;l<o.length-1;l++)c=vt(this,a[n+l],t,l),c===ht&&(c=this._$AH[l]),s||(s=!It(c)||c!==this._$AH[l]),c===P?e=P:e!==P&&(e+=(c??"")+o[l+1]),this._$AH[l]=c}s&&!r&&this.j(e)}j(e){e===P?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class wi extends Gt{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===P?void 0:e}}class vi extends Gt{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==P)}}class xi extends Gt{constructor(e,t,n,r,o){super(e,t,n,r,o),this.type=5}_$AI(e,t=this){if((e=vt(this,e,t,0)??P)===ht)return;const n=this._$AH,r=e===P&&n!==P||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,o=e!==P&&(n===P||r);r&&this.element.removeEventListener(this.name,this,n),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t;typeof this._$AH=="function"?this._$AH.call(((t=this.options)==null?void 0:t.host)??this.element,e):this._$AH.handleEvent(e)}}class ki{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){vt(this,e)}}const oe=Ct.litHtmlPolyfillSupport;oe==null||oe(zt,Dt),(Ct.litHtmlVersions??(Ct.litHtmlVersions=[])).push("3.3.2");const $i=(i,e,t)=>{const n=(t==null?void 0:t.renderBefore)??e;let r=n._$litPart$;if(r===void 0){const o=(t==null?void 0:t.renderBefore)??null;n._$litPart$=r=new Dt(e.insertBefore(Tt(),o),o,void 0,t??{})}return r._$AI(i),r};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ft=globalThis;let at=class extends wt{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t;const e=super.createRenderRoot();return(t=this.renderOptions).renderBefore??(t.renderBefore=e.firstChild),e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=$i(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)==null||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)==null||e.setConnected(!1)}render(){return ht}};at._$litElement$=!0,at.finalized=!0,(_n=ft.litElementHydrateSupport)==null||_n.call(ft,{LitElement:at});const se=ft.litElementPolyfillSupport;se==null||se({LitElement:at}),(ft.litElementVersions??(ft.litElementVersions=[])).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ae=i=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(i,e)}):customElements.define(i,e)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Si={attribute:!0,type:String,converter:ot,reflect:!1,hasChanged:ne},_i=(i=Si,e,t)=>{const{kind:n,metadata:r}=t;let o=globalThis.litPropertyMetadata.get(r);if(o===void 0&&globalThis.litPropertyMetadata.set(r,o=new Map),n==="setter"&&((i=Object.create(i)).wrapped=!0),o.set(t.name,i),n==="accessor"){const{name:s}=t;return{set(a){const l=e.get.call(this);e.set.call(this,a),this.requestUpdate(s,l,i,!0,a)},init(a){return a!==void 0&&this.C(s,void 0,i,a),a}}}if(n==="setter"){const{name:s}=t;return function(a){const l=this[s];e.call(this,a),this.requestUpdate(s,l,i,!0,a)}}throw Error("Unsupported decorator location: "+n)};function K(i){return(e,t)=>typeof t=="object"?_i(i,e,t):((n,r,o)=>{const s=r.hasOwnProperty(o);return r.constructor.createProperty(o,n),s?Object.getOwnPropertyDescriptor(r,o):void 0})(i,e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function z(i){return K({...i,state:!0,attribute:!1})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Ai(i){return(e,t)=>{const n=typeof e=="function"?e:e[t];Object.assign(n,i)}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Le={ATTRIBUTE:1,CHILD:2},Fe=i=>(...e)=>({_$litDirective$:i,values:e});class je{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const le=Fe(class extends je{constructor(i){var e;if(super(i),i.type!==Le.ATTRIBUTE||i.name!=="class"||((e=i.strings)==null?void 0:e.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(i){return" "+Object.keys(i).filter(e=>i[e]).join(" ")+" "}update(i,[e]){var n,r;if(this.st===void 0){this.st=new Set,i.strings!==void 0&&(this.nt=new Set(i.strings.join(" ").split(/\s/).filter(o=>o!=="")));for(const o in e)e[o]&&!((n=this.nt)!=null&&n.has(o))&&this.st.add(o);return this.render(e)}const t=i.element.classList;for(const o of this.st)o in e||(t.remove(o),this.st.delete(o));for(const o in e){const s=!!e[o];s===this.st.has(o)||(r=this.nt)!=null&&r.has(o)||(s?(t.add(o),this.st.add(o)):(t.remove(o),this.st.delete(o)))}return ht}});/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ei=i=>i.strings===void 0;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Rt=(i,e)=>{var n;const t=i._$AN;if(t===void 0)return!1;for(const r of t)(n=r._$AO)==null||n.call(r,e,!1),Rt(r,e);return!0},Ht=i=>{let e,t;do{if((e=i._$AM)===void 0)break;t=e._$AN,t.delete(i),i=e}while((t==null?void 0:t.size)===0)},Be=i=>{for(let e;e=i._$AM;i=e){let t=e._$AN;if(t===void 0)e._$AN=t=new Set;else if(t.has(i))break;t.add(i),Ii(e)}};function Ci(i){this._$AN!==void 0?(Ht(this),this._$AM=i,Be(this)):this._$AM=i}function Ti(i,e=!1,t=0){const n=this._$AH,r=this._$AN;if(r!==void 0&&r.size!==0)if(e)if(Array.isArray(n))for(let o=t;o<n.length;o++)Rt(n[o],!1),Ht(n[o]);else n!=null&&(Rt(n,!1),Ht(n));else Rt(this,i)}const Ii=i=>{i.type==Le.CHILD&&(i._$AP??(i._$AP=Ti),i._$AQ??(i._$AQ=Ci))};class Pi extends je{constructor(){super(...arguments),this._$AN=void 0}_$AT(e,t,n){super._$AT(e,t,n),Be(this),this.isConnected=e._$AU}_$AO(e,t=!0){var n,r;e!==this.isConnected&&(this.isConnected=e,e?(n=this.reconnected)==null||n.call(this):(r=this.disconnected)==null||r.call(this)),t&&(Rt(this,e),Ht(this))}setValue(e){if(Ei(this._$Ct))this._$Ct._$AI(e,this);else{const t=[...this._$Ct._$AH];t[this._$Ci]=e,this._$Ct._$AI(t,this,0)}}disconnected(){}reconnected(){}}/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const qt=()=>new zi;class zi{}const ce=new WeakMap,Vt=Fe(class extends Pi{render(i){return P}update(i,[e]){var n;const t=e!==this.G;return t&&this.G!==void 0&&this.rt(void 0),(t||this.lt!==this.ct)&&(this.G=e,this.ht=(n=i.options)==null?void 0:n.host,this.rt(this.ct=i.element)),P}rt(i){if(this.isConnected||(i=void 0),typeof this.G=="function"){const e=this.ht??globalThis;let t=ce.get(e);t===void 0&&(t=new WeakMap,ce.set(e,t)),t.get(this.G)!==void 0&&this.G.call(this.ht,void 0),t.set(this.G,i),i!==void 0&&this.G.call(this.ht,i)}else this.G.value=i}get lt(){var i,e;return typeof this.G=="function"?(i=ce.get(this.ht??globalThis))==null?void 0:i.get(this.G):(e=this.G)==null?void 0:e.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}});function pe(i){const e=Number.parseFloat(i.amount);return Number.isNaN(e)?`${i.currencyCode} ${i.amount}`:new Intl.NumberFormat("en-US",{style:"currency",currency:i.currencyCode,minimumFractionDigits:2,maximumFractionDigits:2}).format(e)}function xt(i,e){if(!i)throw new Error(e??"Assertion failed")}function Di(i,e,t){if(!(i instanceof e))throw new Error(`Expected value to be instance of ${e.name}`)}const Yt="GraphQL Client",Ne=0,Ue=3,Me="An error occurred while fetching from the API. Review 'graphQLErrors' for details.",Ge="Response returned unexpected Content-Type:",He="An unknown error has occurred. The API did not return a data object or any errors in its response.",de={json:"application/json",multipart:"multipart/mixed"},qe="X-SDK-Variant",Ye="X-SDK-Version",Ri="shopify-graphql-client",Vi="1.4.1",Xe=1e3,Oi=[429,503],We=/@(defer)\b/i,Qe=`\r
`,Li=/boundary="?([^=";]+)"?/i,Ke=Qe+Qe;function lt(i,e=Yt){return i.startsWith(`${e}`)?i:`${e}: ${i}`}function kt(i){return i instanceof Error?i.message:JSON.stringify(i)}function Je(i){return i instanceof Error&&i.cause?i.cause:void 0}function Ze(i){return i.flatMap(({errors:e})=>e??[])}function tn({client:i,retries:e}){if(e!==void 0&&(typeof e!="number"||e<Ne||e>Ue))throw new Error(`${i}: The provided "retries" value (${e}) is invalid - it cannot be less than ${Ne} or greater than ${Ue}`)}function H(i,e){return e&&(typeof e!="object"||Array.isArray(e)||typeof e=="object"&&Object.keys(e).length>0)?{[i]:e}:{}}function en(i,e){if(i.length===0)return e;const n={[i.pop()]:e};return i.length===0?n:en(i,n)}function nn(i,e){return Object.keys(e||{}).reduce((t,n)=>(typeof e[n]=="object"||Array.isArray(e[n]))&&i[n]?(t[n]=nn(i[n],e[n]),t):(t[n]=e[n],t),Array.isArray(i)?[...i]:{...i})}function rn([i,...e]){return e.reduce(nn,{...i})}function Fi({clientLogger:i,customFetchApi:e=fetch,client:t=Yt,defaultRetryWaitTime:n=Xe,retriableCodes:r=Oi}){const o=async(s,a,l)=>{const c=a+1,d=l+1;let p;try{if(p=await e(...s),i({type:"HTTP-Response",content:{requestParams:s,response:p}}),!p.ok&&r.includes(p.status)&&c<=d)throw new Error;const u=(p==null?void 0:p.headers.get("X-Shopify-API-Deprecated-Reason"))||"";return u&&i({type:"HTTP-Response-GraphQL-Deprecation-Notice",content:{requestParams:s,deprecationNotice:u}}),p}catch(u){if(c<=d){const g=p==null?void 0:p.headers.get("Retry-After");return await ji(g?parseInt(g,10):n),i({type:"HTTP-Retry",content:{requestParams:s,lastResponse:p,retryAttempt:a,maxRetries:l}}),o(s,c,l)}throw new Error(lt(`${l>0?`Attempted maximum number of ${l} network retries. Last message - `:""}${kt(u)}`,t))}};return o}async function ji(i){return new Promise(e=>setTimeout(e,i))}function Bi({headers:i,url:e,customFetchApi:t=fetch,retries:n=0,logger:r}){tn({client:Yt,retries:n});const o={headers:i,url:e,retries:n},s=Ni(r),a=Fi({customFetchApi:t,clientLogger:s,defaultRetryWaitTime:Xe}),l=Ui(a,o),c=Mi(l),d=Qi(l);return{config:o,fetch:l,request:c,requestStream:d}}function Ni(i){return e=>{i&&i(e)}}async function on(i){const{errors:e,data:t,extensions:n}=await i.json();return{...H("data",t),...H("extensions",n),headers:i.headers,...e||!t?{errors:{networkStatusCode:i.status,message:lt(e?Me:He),...H("graphQLErrors",e),response:i}}:{}}}function Ui(i,{url:e,headers:t,retries:n}){return async(r,o={})=>{const{variables:s,headers:a,url:l,retries:c,keepalive:d,signal:p}=o,u=JSON.stringify({query:r,variables:s});tn({client:Yt,retries:c});const g=Object.entries({...t,...a}).reduce((v,[D,C])=>(v[D]=Array.isArray(C)?C.join(", "):C.toString(),v),{});return!g[qe]&&!g[Ye]&&(g[qe]=Ri,g[Ye]=Vi),i([l??e,{method:"POST",headers:g,body:u,signal:p,keepalive:d}],1,c??n)}}function Mi(i){return async(...e)=>{if(We.test(e[0]))throw new Error(lt("This operation will result in a streamable response - use requestStream() instead."));let t=null;try{t=await i(...e);const{status:n,statusText:r}=t,o=t.headers.get("content-type")||"";return t.ok?o.includes(de.json)?await on(t):{errors:{networkStatusCode:n,message:lt(`${Ge} ${o}`),response:t}}:{errors:{networkStatusCode:n,message:lt(r),response:t}}}catch(n){return{errors:{message:kt(n),...t==null?{}:{networkStatusCode:t.status,response:t}}}}}}async function*Gi(i){const e=new TextDecoder;if(i.body[Symbol.asyncIterator])for await(const t of i.body)yield e.decode(t);else{const t=i.body.getReader();let n;try{for(;!(n=await t.read()).done;)yield e.decode(n.value)}finally{t.cancel()}}}function Hi(i,e){return{async*[Symbol.asyncIterator](){try{let t="";for await(const n of i)if(t+=n,t.indexOf(e)>-1){const r=t.lastIndexOf(e),s=t.slice(0,r).split(e).filter(a=>a.trim().length>0).map(a=>a.slice(a.indexOf(Ke)+Ke.length).trim());s.length>0&&(yield s),t=t.slice(r+e.length),t.trim()==="--"&&(t="")}}catch(t){throw new Error(`Error occured while processing stream payload - ${kt(t)}`)}}}}function qi(i){return{async*[Symbol.asyncIterator](){yield{...await on(i),hasNext:!1}}}}function Yi(i){return i.map(e=>{try{return JSON.parse(e)}catch(t){throw new Error(`Error in parsing multipart response - ${kt(t)}`)}}).map(e=>{const{data:t,incremental:n,hasNext:r,extensions:o,errors:s}=e;if(!n)return{data:t||{},...H("errors",s),...H("extensions",o),hasNext:r};const a=n.map(({data:l,path:c,errors:d})=>({data:l&&c?en(c,l):{},...H("errors",d)}));return{data:a.length===1?a[0].data:rn([...a.map(({data:l})=>l)]),...H("errors",Ze(a)),hasNext:r}})}function Xi(i,e){if(i.length>0)throw new Error(Me,{cause:{graphQLErrors:i}});if(Object.keys(e).length===0)throw new Error(He)}function Wi(i,e){var a,l;const t=(e??"").match(Li),n=`--${t?t[1]:"-"}`;if(!((a=i.body)!=null&&a.getReader)&&!((l=i.body)!=null&&l[Symbol.asyncIterator]))throw new Error("API multipart response did not return an iterable body",{cause:i});const r=Gi(i);let o={},s;return{async*[Symbol.asyncIterator](){var c;try{let d=!0;for await(const p of Hi(r,n)){const u=Yi(p);s=((c=u.find($=>$.extensions))==null?void 0:c.extensions)??s;const g=Ze(u);o=rn([o,...u.map(({data:$})=>$)]),d=u.slice(-1)[0].hasNext,Xi(g,o),yield{...H("data",o),...H("extensions",s),hasNext:d}}if(d)throw new Error("Response stream terminated unexpectedly")}catch(d){const p=Je(d);yield{...H("data",o),...H("extensions",s),errors:{message:lt(kt(d)),networkStatusCode:i.status,...H("graphQLErrors",p==null?void 0:p.graphQLErrors),response:i},hasNext:!1}}}}}function Qi(i){return async(...e)=>{if(!We.test(e[0]))throw new Error(lt("This operation does not result in a streamable response - use request() instead."));try{const t=await i(...e),{statusText:n}=t;if(!t.ok)throw new Error(n,{cause:t});const r=t.headers.get("content-type")||"";switch(!0){case r.includes(de.json):return qi(t);case r.includes(de.multipart):return Wi(t,r);default:throw new Error(`${Ge} ${r}`,{cause:t})}}catch(t){return{async*[Symbol.asyncIterator](){const n=Je(t);yield{errors:{message:lt(kt(t)),...H("networkStatusCode",n==null?void 0:n.status),...H("response",n)},hasNext:!1}}}}}}function Ki({client:i,storeDomain:e}){try{const t=e.trim(),n=t.match(/^https?:/)?t:`https://${t}`,r=new URL(n);return r.protocol="https",r.origin}catch(t){throw new Error(`${i}: a valid store domain ("${e}") must be provided`,{cause:t})}}function sn({client:i,currentSupportedApiVersions:e,apiVersion:t,logger:n}){const r=`${i}: the provided apiVersion ("${t}")`,o=`Currently supported API versions: ${e.join(", ")}`;if(!t||typeof t!="string")throw new Error(`${r} is invalid. ${o}`);const s=t.trim();e.includes(s)||(n?n({type:"Unsupported_Api_Version",content:{apiVersion:t,supportedApiVersions:e}}):console.warn(`${r} is likely deprecated or not supported. ${o}`))}function Xt(i){const e=i*3-2;return e===10?e:`0${e}`}function he(i,e,t){const n=e-t;return n<=0?`${i-1}-${Xt(n+4)}`:`${i}-${Xt(n)}`}function Ji(){const i=new Date,e=i.getUTCMonth(),t=i.getUTCFullYear(),n=Math.floor(e/3+1);return{year:t,quarter:n,version:`${t}-${Xt(n)}`}}function Zi(){const{year:i,quarter:e,version:t}=Ji(),n=e===4?`${i+1}-01`:`${i}-${Xt(e+1)}`;return[he(i,e,3),he(i,e,2),he(i,e,1),t,n,"unstable"]}function tr(i){return e=>({...e??{},...i.headers})}function er({getHeaders:i,getApiUrl:e}){return(t,n)=>{const r=[t];if(n&&Object.keys(n).length>0){const{variables:o,apiVersion:s,headers:a,retries:l,signal:c}=n;r.push({...o?{variables:o}:{},...a?{headers:i(a)}:{},...s?{url:e(s)}:{},...l?{retries:l}:{},...c?{signal:c}:{}})}return r}}const an="application/json",nr="storefront-api-client",ir="1.0.9",rr="X-Shopify-Storefront-Access-Token",or="X-SDK-Variant",sr="X-SDK-Version",ar="X-SDK-Variant-Source",Wt="Storefront API Client";function lr(i){if(i&&typeof window<"u")throw new Error(`${Wt}: private access tokens and headers should only be used in a server-to-server implementation. Use the public API access token in nonserver environments.`)}function cr(i,e){if(e)throw new Error(`${Wt}: only provide either a public or private access token`)}function pr({storeDomain:i,apiVersion:e,publicAccessToken:t,privateAccessToken:n,clientName:r,retries:o=0,customFetchApi:s,logger:a}){const l=Zi(),c=Ki({client:Wt,storeDomain:i}),d={client:Wt,currentSupportedApiVersions:l,logger:a};sn({...d,apiVersion:e}),cr(t,n),lr(n);const p=dr(c,e,d),u={storeDomain:c,apiVersion:e,publicAccessToken:t,headers:{"Content-Type":an,Accept:an,[or]:nr,[sr]:ir,...r?{[ar]:r}:{},[rr]:t},apiUrl:p(),clientName:r},g=Bi({headers:u.headers,url:u.apiUrl,retries:o,customFetchApi:s,logger:a}),$=tr(u),v=hr(u,p),D=er({getHeaders:$,getApiUrl:v});return Object.freeze({config:u,getHeaders:$,getApiUrl:v,fetch:(..._)=>g.fetch(...D(..._)),request:(..._)=>g.request(...D(..._)),requestStream:(..._)=>g.requestStream(...D(..._))})}function dr(i,e,t){return n=>{n&&sn({...t,apiVersion:n});const r=(n??e).trim();return`${i}/api/${r}/graphql.json`}}function hr(i,e){return t=>t?e(t):i.apiUrl}const ln=pr({storeDomain:"https://belt-master-belts.myshopify.com",apiVersion:"2025-10",publicAccessToken:"150be8d747708199c1f1b33ab7ab43bb",retries:2}),ur=`
  query ProductQuery($query: String) {
    products(first: 20, query: $query) {
      edges {
        node {
          id
          title
          tags
          collections(first: 10) {
            edges {
              node {
                id
                title
                handle
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 4, sortKey: POSITION) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                sku
                image {
                  id
                  url
                  altText
                }
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
                quantityAvailable
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;async function Z(i,{prefetchImages:e}={prefetchImages:!0}){const t=await ln.request(ur,{variables:{query:i}});if(t.errors)throw new Error(JSON.stringify(t.errors));if(e){const n=t.data.products.edges.flatMap(({node:r})=>r.images.edges.map(({node:o})=>o));await Promise.all(n.map(async r=>{const o=new Image;o.src=r.url;try{await o.decode()}catch(s){console.debug(s,r.url)}}))}return t.data.products.edges.map(({node:n})=>{var r;return{id:n.id,title:n.title,tags:n.tags,collections:(((r=n.collections)==null?void 0:r.edges)??[]).map(({node:o})=>({id:o.id,title:o.title,handle:o.handle})),images:n.images.edges.map(({node:o})=>o),priceRange:n.priceRange,variants:n.variants.edges.map(({node:o})=>({id:o.id,title:o.title,sku:o.sku,image:o.image,price:o.price,compareAtPrice:o.compareAtPrice,selectedOptions:o.selectedOptions,availableForSale:o.availableForSale,quantityAvailable:o.quantityAvailable}))}})}function I(i,e,{fallbackToFirst:t=!0}={}){const n=i.images??[];if(!n.length)return null;const r=n[e]??(t?n[0]:null);return(r==null?void 0:r.url)??null}const fr=`
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;function Ot(i,e){if(!i)throw new Error("Missing variantId for cart line.");return{merchandiseId:i,quantity:e}}async function gr(i){var o,s;const e=await ln.request(fr,{variables:{input:{lines:i}}});if(e.errors)throw new Error(`Storefront API errors: ${JSON.stringify(e.errors)}`);const t=(o=e.data)==null?void 0:o.cartCreate,n=(t==null?void 0:t.userErrors)??[];if(n.length)throw new Error(`cartCreate userErrors: ${JSON.stringify(n)}`);const r=(s=t==null?void 0:t.cart)==null?void 0:s.checkoutUrl;if(!r)throw new Error("cartCreate returned no checkoutUrl.");return r}const br=`/* Application-specific styles. */
html,
body {
  margin: 0;
  padding: 0;
  font-family: "Work Sans", sans-serif;
  background-color: var(--belt-wizard-background-color);
}

body {
  color: var(--neutral);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 100vh;
  margin: 0 auto;
  overflow-x: hidden;
}

a {
  color: var(--potters-clay-light);
}

body > header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-inline: 20px;
  height: 75px;
}

@media screen and (min-width: 500px) {
  body > header {
    padding-inline: 64px;
    justify-content: unset;
  }
}

header#navbar {
  color: var(--neutral-darkest);
  background-color: var(--potters-clay-lightest);
}

header#navbar .logo {
  height: 28px;
}

header#navbar nav {
  display: none;
}

@media screen and (min-width: 500px) {
  header#navbar nav {
    display: unset;
    flex-grow: 1;
  }
}

header#navbar ul {
  display: flex;
  justify-content: center;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 32px;
}

header#navbar li {
  padding: 0;
}

header#navbar li a {
  color: var(--neutral-darkest);
  font-weight: 400;
  text-decoration: none;
}

header#navbar li a:hover {
  text-decoration: underline;
}

body > main {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin: 0rem auto;
  min-width: 1260px;
  max-width: min(1260px, 100%);
}

/* Jumbotron */
#jumbotron {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
  margin-inline: -8px;
  padding-inline-start: 24px;
  background:
    url(/assets/belts/jumbotron-belts.png),
    radial-gradient(#433f3c, #2d2d2d);
  background-repeat: no-repeat, no-repeat;
  background-size: 55vw, auto;
  /* Fallback that's good enough. */
  background-position-x: -25%, center;
  background-position-y: center, center;
  /* Future forward, see https://caniuse.com/mdn-css_properties_background-position-x_side-relative_values */
  background-position-y: bottom 10%, center;
}
#jumbotron[hidden] {
  display: none;
}

@media screen and (min-width: 500px) {
  #jumbotron {
    padding-inline-start: 50vw;
    background-size: 57vw, auto;
    /* Fallback that's good enough. */
    background-position-x: left, center;
    background-position-y: 130%, center;
    /* Future forward, see https://caniuse.com/mdn-css_properties_background-position-x_side-relative_values */
    background-position-y: bottom 10%, center;
  }
}

@media screen and (max-width: 500px) {
  #jumbotron {
    background-size: 90vw, auto;
    /* Fallback that's good enough. */
    background-position-x: left, center;
    background-position-y: 20%, center;
    /* Future forward, see https://caniuse.com/mdn-css_properties_background-position-x_side-relative_values */
    background-position-y: bottom 10%, center;
  }
}

#jumbotron h1 {
  font-family: "Founders Grotesque X Condensed Light";
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin: 0;
}

#jumbotron h2 {
  margin-block-start: 0;
  margin-block-end: 0.5em;
  font-family: "Times New Roman", Times, serif;
  font-size: 44px;
}

@media screen and (min-width: 500px) {
  #jumbotron h2 {
    font-size: 60px;
  }
}

#jumbotron p {
  margin-block-start: 0;
  color: var(--potters-clay-light);
}

#jumbotron button.btn {
  align-self: flex-start;
}

/* Belt Wizard */
belt-wizard {
  flex-grow: 1;
  margin-inline: 8px;
}

/* Stepper */
#stepper {
  position: relative;
  display: flex;
  flex-grow: 1;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 1260px;
}
#stepper:before {
  content: "";
  position: absolute;
  width: 100%;
  height: 1px;
  background-color: var(--neutral-white);
  top: 7px;
  z-index: 0;
}

#stepper button.step {
  position: relative;
  width: 14px;
  height: 14px;
  border-radius: 7px;
  border: none;
  background-color: #b6c6fd;
  z-index: 1;
  cursor: pointer;
}
#stepper button.step:not(:first-child):before {
  content: "";
  display: block;
  position: absolute;
  background-color: var(--belt-wizard-background-color);
  width: 7px;
  height: 1px;
  left: -50%;
}
#stepper button.step:not(:last-child):after {
  content: "";
  display: block;
  position: absolute;
  background-color: var(--belt-wizard-background-color);
  width: 7px;
  height: 1px;
  right: -50%;
}

#stepper button.step:disabled {
  background-color: #476fff;
  cursor: not-allowed;
}

/* Steps */
#stepHeading {
  margin-block-start: 2em;
}

#stepHeading h2 {
  margin-block: 0;
}
#stepHeading h2 ~ .subtitle {
  margin-block-start: 0;
}

#stepTitle {
  flex-grow: 1;
}

belt-wizard section.step h2 {
  margin-block-start: 0;
  margin-block-end: 0.5em;
}

/* Belt Preview */
belt-wizard > header {
  position: sticky;
  top: 0;
  padding-block-start: 1rem;
  background: var(--belt-wizard-background-color);
  z-index: 5;
}

/* Belt Preview Animation */
#preview belt-preview {
  display: block;
  position: relative;
  left: -8px;
  min-height: 150px;
  pointer-events: none;
  transition: transform 0.5s ease-in-out;
  align-content: center;
}
#preview belt-preview.step-1 {
  transform: scale(1.5) translateX(1600px);
  transform-origin: left;
}
#preview belt-preview.step-2 {
  transform: scale(1.5) translateX(300px);
  transform-origin: left;
}
#preview belt-preview.step-3 {
  transform: scale(2.5) translateX(150px);
  transform-origin: left;
}
#preview belt-preview.step-4 {
  transform: scale(2) translateX(89px);
}
#preview belt-preview.step-5 {
  transform: scale(1.5) translateX(-300px);
  transform-origin: right;
}

/* Belt Size */
#size {
  background-position: right 30%;
  background-size: 80vw auto;
  background-repeat: no-repeat;
  position: relative;
  margin-top: -10%;
  z-index: 5;
}

@media screen and (min-width: 500px) {
  #size {
    background-position-x: right;
    background-position-y: 20%;
    background-size: 450px auto;
  }
}

#sizingChart {
  width: auto;
  border-radius: 8px;
}

@media screen and (min-width: 500px) {
  #sizingChart {
    max-width: 50vw;
    position: absolute;
    right: 0;
    top: -20%;
  }
}

/* Checkout Summary */
#checkoutTotal {
  margin-block: 28px 16px;
}
`,mr=`/** BeltMaster theme styles for common elements and components. */
@font-face {
  font-family: "Founders Grotesque X Condensed";
  font-weight: bold;
  src: url(./FoundersGroteskXCond-Bold.otf);
}
@font-face {
  font-family: "Founders Grotesque X Condensed Light";
  font-weight: lighter;
  src: url(./FoundersGroteskXCond-Lt.otf);
}
@font-face {
  font-family: "Founders Grotesque Condensed";
  font-weight: lighter;
  src: url(./FoundersGroteskCond-Lt.otf);
}

:root {
  /* Colors */
  --neutral-white: #fff;
  --neutral-lightest: #f2f2f2;
  --neutral-lighter: #dadada;
  --neutral-light: #b6b6b6;
  --neutral: #fff;
  --neutral-dark: #545454;
  --neutral-darker: #242424;
  --neutral-darkest: #0c0c0c;

  --potters-clay-lightest: #f3eeeb;
  --potters-clay-lighter: #e7ded8;
  --potters-clay-light: #ad8e76;
  --potters-clay: #8b5e3c;
  --potters-clay-dark: #6f4b30;
  --potters-clay-darker: #372518;
  --potters-clay-darkest: #291c12;

  --spring-wood-lightest: #fefefd;
  --spring-wood-lighter: #fdfdfc;
  --spring-wood-light: #faf8f4;
  --spring-wood: #f8f5f0;
  --spring-wood-dark: #c6c4c0;
  --spring-wood-darker: #636260;
  --spring-wood-darkest: #4a4948;

  --old-gold-lightest: #faf7eb;
  --old-gold-lighter: #f6efd7;
  --old-gold-light: #e8c773;
  --old-gold: #d4af37;
  --old-gold-dark: #a98c2c;
  --old-gold-darker: #544616;
  --old-gold-darkest: #3f3410;

  /* Backgrounds */
  --belt-wizard-background-color: var(--potters-clay-darkest);

  /* Sizes */
  --gap-small: 1rem;
  --gap-medium: 1rem;
  --radius-large: 16px;
  --radius-medium: 16px;
  --radius-large: 16px;

  /* Shadows */
  --shadow-xxs: 0 1px 2px 0 #0000000d;
  --shadow-xs: 0 1px 2px 0 #0000000f, 0 1px 3px 0 #0000001a;
  --shadow-small: 0 4px 2px -2px #0000000d, 0 4px 8px -2px #0000001a;
  --shadow-medium: 0 4px 6px -2px #00000008, 0 12px 16px -4px #00000014;
  --shadow-large: 0 8px 8px -4px #00000008, 0 20px 24px -4px #00000014;
  --shadow-xl: 0 24px 48px -12px #0000002e;
  --shadow-xxl: 0 32px 64px -12px #00000024;
}

body {
  font-family: "Work Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: normal;
  font-style: normal;
}

h1, h2, h3, h4, h5, h6 {
  font-family: "Founders Grotesque X Condensed", sans-serif;
  font-optical-sizing: auto;
  font-weight: normal;
  font-style: normal;
}

h1, .heading-1 {
  font-size: 84px;
}

h2, .heading-2 {
  font-size: 60px;
}

h3, .heading-3 {
  font-size: 48px;
}

h4, .heading-4 {
  font-size: 40px;
}

h5, .heading-5 {
  font-size: 32px;
}

h6, .heading-6 {
  font-size: 26px;
}

.tagline {
  font-size: 16px;
}

.sr-only {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

.container {
  max-width: 960px;
}

.row {
  display: flex;
}
.row.wrap {
  flex-wrap: wrap;
}

.column {
  display: flex;
  flex-direction: column;
}

.gap-medium {
  gap: var(--gap-medium);
}
.gap-small {
  gap: var(--gap-small);
}

/* Components */

/* Button */
button.btn, a.btn {
  color: #fff;
  font-family: "Work Sans", sans-serif;
  font-weight: 700;
  text-decoration: none;

  padding: 12px 22px;
  border: none;
  border-radius: 8px;
  background: #8b5e3c;
  cursor: pointer;
  box-shadow:
    0px 1px 2px 0px rgba(12, 12, 12, 0.05),
    inset 0px -2px 1px 0px rgba(0, 0, 0, 0.20),
    inset 0px 0px 0px 1px rgba(12, 12, 12, 0.15),
    inset 0px 2px 1px 0px rgba(255, 255, 255, 0.25),
    inset 0px 32px 24px 0px rgba(255, 255, 255, 0.05) !important;

  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}
a.btn {
  text-decoration: none;
}

button.btn.primary, a.btn.primary {
  color: var(--neutral-white);
  background-color: #8b5e3c;
}
#stepShortcut {
  position: relative;
  z-index: 5;
}

.btn.primary:hover {
  background-color: #7a4f31;
  box-shadow:
    0 4px 6px 0 #0000000f,
    inset 0 -2px 1px 0 #00000033,
    inset 0 0 0 1px #00000026;
}
.btn.primary[disabled],
.btn.primary[disabled]:hover {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}

button.btn.secondary, a.btn.secondary {
  color: var(--neutral-darkest);
  background-color: #0c0c0c0d;
  box-shadow:
    0 1px 2px 0 #0c0c0c0d,
    inset 0 -2px 1px 0 #0c0c0c0d,
    inset 0 0 0 1px #0c0c0c0d;
}

button.btn.tertiary, a.btn.tertiary {
  color: var(--neutral-darkest);
  background-color: transparent;
  box-shadow: none;
}

button.btn.tertiary:hover, a.btn.tertiary:hover {
  box-shadow:
    0 1px 2px 0 #0c0c0c0d,
    inset 0 -2px 1px 0 #0c0c0c0d,
    inset 0 0 0 1px #0c0c0c0d;
}

.buckle-option {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.buckle-variants {
  margin-top: 8px;
}

.buckle-variant-swatch {
  border: none;
  padding: 0;
  margin: 3px;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
}

.buckle-variant-swatch img {
  display: block;
  width: 48px;
  height: 48px;
  object-fit: cover;
}

.buckle-variant-swatch.is-selected {
  outline: 2px solid var(--old-gold);
  outline-offset: 2px;
}

.variant-popup[data-kind="base"] .variant-swatch img {
  scale: 1;
}

.collection-title {
  font-size: 2rem;
  margin-bottom: 0;
}

/* Options */
.option {
  cursor: pointer;
  max-width: 170px;
}

.option .selection-indicator {
  min-width: 128px;
  max-width: calc(50vw - 28px - 16px);
  width: 160px;
  aspect-ratio: 1;
}

.option.text-only, .option .selection-indicator {
  object-fit: contain;
}

.option:not(.text-only):not(.color-chip) label {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.option.text-only {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  margin: 3px;
  border: 1px solid var(--neutral-white);
  border-radius: 8px;
  background: #ffffff33;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.row.wrap:has(.option.text-only) {
  display: grid;
  grid-template-columns: auto auto auto auto;
  margin: 0 auto;
  width: min-content;
}

@media screen and (min-width: 500px) {
  .row.wrap:has(.option.text-only) {
    margin: initial;
  }
}

.option.text-only:has(input:checked) {
  margin: 0;
  border-width: 4px;
  background: #ffffff80;
}

.option.color-chip label {
  align-items: center;
}

.option.color-chip .selection-indicator {
  display: inline-block;
  min-width: 64px;
  width: 64px;
  height: 64px;
}

.option label {
  cursor: pointer;
  text-wrap: auto;
  text-align: center;
}

.option.thumbnail label span.label {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.option:not(.text-only) label span.label {
  margin-block-start: 8px;
  text-align: center;
}

.option.text-only label {
  display: inline-block;
  font-size: 24px;
  padding: 8px 3px;
}

.option:not(.text-only) input:checked + label .selection-indicator {
  padding: 0;
}

.option:not(.text-only) input:checked + label .selection-indicator,
.option.thumbnail.selected .selection-indicator-wrapper {
  margin: 0;
  border-width: 4px;
  background: #ffffff80;
  aspect-ratio: 1;
}
.option.thumbnail[data-kind="concho"] img.selection-indicator {
  transform: scale(5);
}

.option.thumbnail[data-kind="buckle"][data-is-set="false"]
  img.selection-indicator {
  transform: scale(2) translateX(15%);
}

.option.thumbnail[data-kind="buckle"][data-is-set="true"]
  img.selection-indicator {
  transform: translatex(-5%);
}
.option.thumbnail[data-kind="loop"] img.selection-indicator {
  transform: scale(3);
}

.option.thumbnail[data-kind="tip"] img.selection-indicator {
  transform: scale(3);
}

.option.thumbnail .selection-indicator-wrapper {
  position: relative;
  display: inline-block;
  margin: 3px;
  border: 1px solid var(--neutral-white);
  border-radius: 8px;
  background: #ffffff33;
  transition: background-color 0.3s ease, border-color 0.3s ease;
  overflow: hidden;
}

.option.thumbnail[data-kind="base"] .selection-indicator-wrapper {
  position: relative;
}

.option.thumbnail[data-kind="base"] .selection-indicator {
  transition: opacity 300ms ease;
}

.option.thumbnail[data-kind="base"] .hover-image {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 300ms ease;
  object-fit: contain;
}

.option.thumbnail[data-kind="base"]:hover .hover-image {
  opacity: 1;
}

.option.thumbnail[data-kind="base"]:hover .selection-indicator {
  opacity: 0;
}

.option.thumbnail .option-count {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(12, 12, 12, 0.85);
  color: var(--neutral-white);
  font-size: 12px;
  font-weight: 600;
  pointer-events: none;
}

.option.thumbnail .variant-swatch .option-count {
  font-size: 6px;
}

.option.thumbnail {
  position: relative;
}

/* Overlay container for the buckle variant chooser */
.variant-popup {
  position: absolute;
  scale: 2;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  z-index: 10;
  height: 50%;
}

.variant-popup-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  background: #ffffff95;
  border-radius: 0.5rem;
  backdrop-filter: blur(10px);
}

.variant-swatch {
  border: none;
  padding: 0;
  margin: 2px;
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  background: #ffffff;
  position: relative;
}

.variant-swatch img {
  display: block;
  width: 40px;
  height: 40px;
  scale: 5;
  object-fit: cover;
}

.variant-swatch.is-selected {
  outline: 2px solid var(--old-gold);
}

/* Preview starts off to the side and invisible */
#preview {
  opacity: 0;
  transform: translateX(120px);
  max-height: 150px;
}

/* When first base is selected, ease in from the side over 0.5s */
#preview.preview-enter {
  animation: previewSlideIn 1s ease forwards;
}

/* Options section: slide down once when preview comes in */
section.step.step-shifted {
  animation: optionsSlideDown 1s ease forwards;
}

/* Preview animation */
@keyframes previewSlideIn {
  from {
    opacity: 0;
    transform: translateX(120px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Options slide-down animation */
@keyframes optionsSlideDown {
  from {
    transform: translateY(-20%);
  }
  to {
    transform: translateY(0%);
  }
}

/* Step title + options grow/fade in on each step */

.step-title,
.step-content {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
}

/* STEP 0 */
.step-title.step-enter-0,
.step-content.step-enter-0 {
  animation: stepGrowIn-0 0.5s ease forwards;
}

/* STEP 1 */
.step-title.step-enter-1,
.step-content.step-enter-1 {
  animation: stepGrowIn-1 0.5s ease forwards;
}

/* STEP 2 */
.step-title.step-enter-2,
.step-content.step-enter-2 {
  animation: stepGrowIn-2 0.5s ease forwards;
}

/* STEP 3 */
.step-title.step-enter-3,
.step-content.step-enter-3 {
  animation: stepGrowIn-3 0.5s ease forwards;
}

/* STEP 4 */
.step-title.step-enter-4,
.step-content.step-enter-4 {
  animation: stepGrowIn-4 0.5s ease forwards;
}

/* STEP 5 */
.step-title.step-enter-5,
.step-content.step-enter-5 {
  animation: stepGrowIn-5 0.5s ease forwards;
}

/* STEP 6 */
.step-title.step-enter-6,
.step-content.step-enter-6 {
  animation: stepGrowIn-6 0.5s ease forwards;
}

@keyframes stepGrowIn-0 {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes stepGrowIn-1 {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes stepGrowIn-2 {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes stepGrowIn-3 {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes stepGrowIn-4 {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes stepGrowIn-5 {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes stepGrowIn-6 {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

belt-wizard #summary .summary-header {
  margin-bottom: 1.5rem;
}

belt-wizard #summary .summary-warning {
  border: 1px solid #d97757;
  padding: 1rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

belt-wizard #summary .summary-warning p {
  margin: 0 0 0.5rem;
  font-weight: 600;
}

belt-wizard #summary .summary-warning ul {
  margin: 0;
  padding-left: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

belt-wizard #summary .summary-warning li {
  margin: 0;
}

belt-wizard #summary .summary-missing-link {
  border: 1px dashed #d97757;
  color: white;
  background: transparent;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
}

belt-wizard #summary .summary-missing-link:hover {
  background: #fed7aa;
}

belt-wizard #summary .summary-complete {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: #15803d;
  font-weight: 500;
}

.size-step-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
}

/* ===== Set? Switch ===== */
.switch {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  user-select: none;
  cursor: pointer;
  font-size: 14px;
}

.switch input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.switch-track {
  width: 42px;
  height: 24px;
  border-radius: 999px;
  background: #b0b0b0;
  position: relative;
  transition: background 150ms ease;
  flex: 0 0 auto;
}

.switch-thumb {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #fff;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: transform 150ms ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.switch input:checked + .switch-track {
  background: #476fff;
}

.switch input:checked + .switch-track .switch-thumb {
  transform: translateX(18px);
}

.switch input:focus-visible + .switch-track {
  outline: 2px solid #476fff;
  outline-offset: 2px;
}

.switch-label {
  line-height: 1;
}
.buckle-switch-row {
  margin-top: 8px;
}

.step-tools {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.filter-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.filter-btn {
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.14);
}

.filter-btn:active {
  transform: scale(0.98);
}

.filter-icon {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  line-height: 0;
}

.filter-icon .bar {
  display: block;
  height: 3px;
  border-radius: 999px;
  background: #fff;
}

.filter-icon .bar-1 {
  width: 18px;
}
.filter-icon .bar-2 {
  width: 14px;
}
.filter-icon .bar-3 {
  width: 10px;
}

.filter-popover {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
  z-index: 9999;
}

.filter-popover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.filter-popover-title {
  font-size: 14px;
  font-weight: 600;
  color: #111;
}

.filter-popover-close {
  border: 0;
  background: transparent;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  color: #111;
}

.filter-popover-body {
  margin-top: 10px;
  min-height: 80px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #111 !important;
  font-size: 14px;
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.10);
  background: transparent;
  color: inherit;
  border-radius: 10px;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  font: inherit;
  line-height: 1.2;
}
.filter-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px;
}

.filter-item:hover {
  background: rgba(0, 0, 0, 0.06);
}

.filter-item.is-selected {
  background: #111;
  color: #fff !important;
  border-color: #111;
}

.filter-item.is-selected:hover {
  background: #000;
}

.filter-item:focus-visible {
  outline: 2px solid rgba(17, 17, 17, 0.6);
  outline-offset: 2px;
}

.filter-item-title {
  display: block;
}

.concho-helper-text {
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-left: 4px solid var(--color-primary, #333);
  border-radius: 4px;
  margin-right: auto;
  max-width: 500px;
}

.concho-helper-text p {
  margin: 0;
  font-size: 14px;
  color: inherit;
}

.concho-helper-text strong {
  font-weight: 600;
}
`;N`${W(br)}`;const cn=N`${W(mr)}`;function yr(i,e,t,n,r,o){return w`
    <div>
      <div class="option text-only ${(o==null?void 0:o.class)??""}" @click="${o==null?void 0:o.onClick}">
        <input
          id="${i}"
          class="sr-only"
          type="radio"
          name="${e}"
          value="${t}"
        />
        <label for="${i}">${n}</label>
      </div>
    </div>
  `}function pn(i,e,t,n,r,o,s){s||(s={});const a=s.class??"",l=s.selected?" selected":"";s.class=`${a} ${l}`.trim();const c=!!s.count&&s.count>0;return w`
    <span
      class="option thumbnail ${s.class??""}"
      data-kind="${t}"
      data-is-set="${s.isSet?"true":"false"}"
      @click="${s.onClick}"
    >
      <input
        id="${i}"
        class="sr-only"
        type="${s.type??"radio"}"
        name="${t}"
        value="${n}"
      />
      <label for="${i}">
        <div class="selection-indicator-wrapper ${s.class??""}">
          <img
            class="thumbnail selection-indicator"
            src="${e}"
            alt="${r}"
            width="160"
            height="160"
          />
          ${c?w`
              <span class="option-count">x${s.count}</span>
            `:null}
        </div>
        <span class="label">${r}</span>
        ${o?w`
            <span class="price">${pe(o)}</span>
          `:null}
      </label>

      ${s.popup??null}
    </span>
  `}jn=[ae("belt-checkout")];class U extends(Fn=at,Ln=[K({type:String})],On=[K({type:String})],Vn=[K({type:String})],Rn=[K({type:String})],Dn=[K({type:String})],zn=[K({type:String})],Pn=[K({type:Array})],In=[K({type:Array})],Tn=[z()],Cn=[z()],En=[z()],An=[z()],Fn){constructor(){super(...arguments);y(this,"base",h(x,8,this)),h(x,11,this);y(this,"buckle",h(x,12,this)),h(x,15,this);y(this,"tip",h(x,16,this)),h(x,19,this);y(this,"baseVariantId",h(x,20,this)),h(x,23,this);y(this,"buckleVariantId",h(x,24,this)),h(x,27,this);y(this,"tipVariantId",h(x,28,this)),h(x,31,this);y(this,"loopsVariantIds",h(x,32,this,[])),h(x,35,this);y(this,"conchosVariantIds",h(x,36,this,[])),h(x,39,this);y(this,"beltData",h(x,40,this,[])),h(x,43,this);y(this,"loops",h(x,44,this,[])),h(x,47,this);y(this,"conchos",h(x,48,this,[])),h(x,51,this);y(this,"isCheckingOut",h(x,52,this,!1)),h(x,55,this)}render(){const[t,n,r,o,s]=this.beltData,a=t.find(A=>A.id===this.base),l=n.find(A=>A.id===this.buckle),c=dn(this.loops),d=dn(this.conchos),p=A=>((A==null?void 0:A.tags)??[]).some(M=>M.toLowerCase()==="set"),u=(A,M,Ft,Vr)=>{const Or=p(A);return pn(A.id,I(A,0),M,A.id,A.title,A.priceRange.minVariantPrice,{class:["summary",`kind-${M}`,Or?"set":""].filter(Boolean).join(" "),onClick:()=>this.gotoStep(Ft),count:Vr})},g=Array.from(c.values()).map(({product:A,count:M})=>u(A,"loop",3,M)),$=Array.from(d.values()).map(({product:A,count:M})=>u(A,"concho",4,M)),v=s.find(A=>A.id===this.tip)??null,D=v?ue(v,this.tipVariantId):null,C=a?ue(a,this.baseVariantId):null,_=l?ue(l,this.buckleVariantId):null;if(!C||!_)return;const Y=C?Qt(C.price.amount):0,X=_?Qt(_.price.amount):0,it=D?Qt(D.price.amount):0,L=wr(this.beltData),tt=Kt(this.loopsVariantIds).reduce((A,{variantId:M,count:Ft})=>A+(L.get(M)??0)*Ft,0),gt=Kt(this.conchosVariantIds).reduce((A,{variantId:M,count:Ft})=>A+(L.get(M)??0)*Ft,0),bt=(Y+X+it+tt+gt).toFixed(2),mt=(C==null?void 0:C.price.currencyCode)??(a==null?void 0:a.priceRange.minVariantPrice.currencyCode)??"en-US";return w`
      <div class="row wrap gap-medium">
        ${a?u(a,"base",0):null}
        ${l?u(l,"buckle",2):null}
        ${g}
        ${$}
        ${v?u(v,"beltTip",5):null}
      </div>
      <div id="checkoutTotal">
        Total: <span class="price">${pe({amount:bt,currencyCode:mt})}</span>
      </div>
      <button
        class="btn primary"
        ?disabled=${this.isCheckingOut}
        @click=${()=>this.checkoutNow()}
      >
        ${this.isCheckingOut?"Sending to checkout...":"Checkout"}
      </button>
    `}gotoStep(t){this.dispatchEvent(new CustomEvent("step-change",{detail:t,bubbles:!1,composed:!0}))}async checkoutNow(){if(!this.isCheckingOut){this.isCheckingOut=!0;try{if(!this.baseVariantId)throw new Error("Missing baseVariantId");if(!this.buckleVariantId)throw new Error("Missing buckleVariantId");const t=(this.loopsVariantIds??[]).filter(Boolean),n=(this.conchosVariantIds??[]).filter(Boolean),r=[Ot(this.baseVariantId,1),Ot(this.buckleVariantId,1),...this.tipVariantId?[Ot(this.tipVariantId,1)]:[],...Kt(t).map(({variantId:s,count:a})=>Ot(s,a)),...Kt(n).map(({variantId:s,count:a})=>Ot(s,a))],o=await gr(r);self.location.assign(o)}finally{this.isCheckingOut=!1}}}}x=ee(Fn),S(x,5,"base",Ln,U),S(x,5,"buckle",On,U),S(x,5,"tip",Vn,U),S(x,5,"baseVariantId",Rn,U),S(x,5,"buckleVariantId",Dn,U),S(x,5,"tipVariantId",zn,U),S(x,5,"loopsVariantIds",Pn,U),S(x,5,"conchosVariantIds",In,U),S(x,5,"beltData",Tn,U),S(x,5,"loops",Cn,U),S(x,5,"conchos",En,U),S(x,5,"isCheckingOut",An,U),U=S(x,0,"BeltCheckout",jn,U),y(U,"styles",N`
    ${cn}
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--gap-small);
    }
    img {
      max-width: 100%;
      max-height: 200px;
    }`),h(x,1,U);function dn(i){const e=new Map;for(const t of i){const n=e.get(t.id);n?n.count+=1:e.set(t.id,{product:t,count:1})}return e}function Qt(i){const e=Number.parseFloat(i);if(Number.isNaN(e))throw new Error(`Invalid money amount: ${i}`);return e}function ue(i,e){return e?i.variants.find(t=>t.id===e)??null:null}function Kt(i){const e=new Map;for(const t of i)e.set(t,(e.get(t)??0)+1);return Array.from(e.entries()).map(([t,n])=>({variantId:t,count:n}))}function wr(i){const e=new Map;for(const t of i)for(const n of t)for(const r of n.variants)e.set(r.id,Qt(r.price.amount));return e}async function vr(i,e,t){const n=typeof OffscreenCanvas<"u"?new OffscreenCanvas(e,t):Object.assign(document.createElement("canvas"),{width:e,height:t}),r=n.getContext("2d");xt(r,"Could not create a canvas context!");const o=i instanceof ImageBitmap?i:await createImageBitmap(i);r.clearRect(0,0,e,t),r.drawImage(o,0,0);const s=r.getImageData(0,0,e,t);let a=t,l=e,c=-1,d=-1;const p=s.data;for(let $=0;$<t;$++)for(let v=0;v<e;v++)p[($*e+v)*4+3]!==0&&(v<l&&(l=v),v>c&&(c=v),$<a&&(a=$),$>d&&(d=$));if(c<l||d<a)return o;const u=c-l+1,g=d-a+1;return await createImageBitmap(n,l,a,u,g)}qn=[ae("belt-preview")];class et extends(Hn=at,Gn=[K({type:String})],Mn=[K({type:String})],Un=[K({type:String})],Nn=[z()],Bn=[z()],Hn){constructor(){super(...arguments);y(this,"base",h(B,8,this,null)),h(B,11,this);y(this,"buckle",h(B,12,this,null)),h(B,15,this);y(this,"tip",h(B,16,this,null)),h(B,19,this);y(this,"loops",h(B,20,this,[])),h(B,23,this);y(this,"conchos",h(B,24,this,[])),h(B,27,this);Se(this,$t,null);y(this,"draggingLoopIndex",null);y(this,"draggingConchoIndex",null)}updated(t){t.has("base")&&this.renderBeltBase()}willUpdate(t){t.has("base")&&this.base&&hn(this.base)}render(){return w`
      <canvas
        id="base"
        aria-hidden="true"
        ${Vt(t=>{t&&(Di(t,HTMLCanvasElement),yt(this,$t,t),queueMicrotask(()=>this.renderBeltBase()))})}
      ></canvas>
      <img id="buckle" class="center-vertically" src=${this.buckle??""} aria-hidden="true" />
      <div id="loops" class="center-vertically">
        ${this.loops.map((t,n)=>w`
            <div
              class="loop-item"
              draggable="true"
              data-index=${n}
              @dragstart=${this.onLoopDragStart}
              @dragover=${this.onLoopDragOver}
              @drop=${this.onLoopDrop}
              @dragend=${this.onLoopDragEnd}
            >
              <button
                type="button"
                class="remove-badge"
                @click=${r=>this.handleRemoveClick("loop",n,r)}
                aria-label="Remove loop"
              ></button>
              <img class="loop" src=${t} aria-hidden="true" />
            </div>
          `)}
      </div>
      <div id="conchosList" class="center-vertically">
        ${this.conchos.map((t,n)=>w`
            <div
              class="concho-wrapper"
              draggable="true"
              data-index=${n}
              @dragstart=${this.onConchoDragStart}
              @dragover=${this.onConchoDragOver}
              @drop=${this.onConchoDrop}
              @dragend=${this.onConchoDragEnd}
            >
              <button
                type="button"
                class="remove-badge"
                @click=${r=>this.handleRemoveClick("concho",n,r)}
                aria-label="Remove concho"
              ></button>
              <img class="concho" src=${t} aria-hidden="true" />
            </div>
          `)}
      </div>
      <img
        id="tip"
        class="center-vertically"
        src=${this.tip??""}
        aria-hidden="true"
      />
    `}async renderBeltBase(){console.debug("renderBeltBase()",{hasCanvas:!!R(this,$t),base:this.base});const t=R(this,$t);if(!(!t||!this.base))try{const n=await hn(this.base),r=await vr(n,n.naturalWidth,n.naturalHeight),o=r.height/r.width;await new Promise(requestAnimationFrame);const s=Math.floor(t.getBoundingClientRect().width)||1,a=Math.max(1,Math.round(s*o)),l=self.devicePixelRatio||1;t.width=Math.round(s*l),t.height=Math.round(a*l);const c=t.getContext("2d");xt(c,"Could not acquire 2D canvas context!"),c.clearRect(0,0,s,a),c.drawImage(r,0,0,s*l,a*l)}catch(n){console.error("renderBeltBase failed:",n)}}onLoopDragStart(t){const n=t.currentTarget;!n||!t.dataTransfer||(this.draggingLoopIndex=Number(n.dataset.index),t.dataTransfer.setData("text/plain","loop"),t.dataTransfer.effectAllowed="move",n.classList.add("dragging"),this.createDragImageFrom(n,t))}onLoopDragOver(t){t.preventDefault()}onLoopDrop(t){t.preventDefault();const n=t.currentTarget;if(!n)return;const r=this.draggingLoopIndex,o=Number(n.dataset.index);if(r==null||r===o)return;const s=[...this.loops],[a]=s.splice(r,1);s.splice(o,0,a),this.loops=s,this.dispatchEvent(new CustomEvent("reorder-loops",{detail:{fromIndex:r,toIndex:o},bubbles:!0,composed:!0})),this.draggingLoopIndex=null}onLoopDragEnd(t){const n=t.currentTarget;n&&n.classList.remove("dragging"),this.draggingLoopIndex=null}onConchoDragStart(t){const n=t.currentTarget;!n||!t.dataTransfer||(this.draggingConchoIndex=Number(n.dataset.index),t.dataTransfer.setData("text/plain","concho"),t.dataTransfer.effectAllowed="move",n.classList.add("dragging"),this.createDragImageFrom(n,t))}onConchoDragOver(t){t.preventDefault()}onConchoDrop(t){t.preventDefault();const n=t.currentTarget;if(!n)return;const r=this.draggingConchoIndex,o=Number(n.dataset.index);if(r==null||r===o)return;const s=[...this.conchos],[a]=s.splice(r,1);s.splice(o,0,a),this.conchos=s,this.dispatchEvent(new CustomEvent("reorder-conchos",{detail:{fromIndex:r,toIndex:o},bubbles:!0,composed:!0})),this.draggingConchoIndex=null}onConchoDragEnd(t){const n=t.currentTarget;n&&n.classList.remove("dragging"),this.draggingConchoIndex=null}createDragImageFrom(t,n){if(!n.dataTransfer)return;const r=t.querySelector("img");if(!r)return;const o=r.getBoundingClientRect(),s=1.2,a=r.cloneNode(!0);a.style.opacity="0.85",a.style.pointerEvents="none",a.style.position="absolute",a.style.top="-9999px",a.style.left="-9999px";const l=o.width*s,c=o.height*s;a.style.width=`${l}px`,a.style.height=`${c}px`,document.body.appendChild(a),n.dataTransfer.setDragImage(a,l/2,c/2),requestAnimationFrame(()=>{a.parentNode&&a.parentNode.removeChild(a)})}handleRemoveClick(t,n,r){r.preventDefault(),r.stopPropagation(),this.dispatchEvent(new CustomEvent(`remove-${t}`,{detail:{index:n},bubbles:!0,composed:!0}))}}B=ee(Hn),$t=new WeakMap,S(B,5,"base",Gn,et),S(B,5,"buckle",Mn,et),S(B,5,"tip",Un,et),S(B,5,"loops",Nn,et),S(B,5,"conchos",Bn,et),et=S(B,0,"BeltPreview",qn,et),y(et,"styles",N`
    ${cn}

    :host {
      position: relative;
      display: block;
      width: 100%;
      min-height: 250px;
      pointer-events: auto;
    }

    .center-vertically {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }

    #base {
      position: relative;
      display: block;
      width: 90vw;       /* visual size */
      max-width: 100%;
      pointer-events: none;
    }

    .selection-indicator-wrapper {
      width: 160px;
      height: 160px;
    }
    #buckle,
    #tip {
      max-height: 100%;
      z-index: 1;
      pointer-events: auto;
    }
    #buckle {
      left: -5.8%;
      z-index:-1;
    }
    #tip {
      right: -5%;
    }

    #loops {
      left: 2.6%;
      height: 100%;
      gap: 15px;
      z-index: 10;
      pointer-events: auto !important;
      cursor: grab;
      display: flex;
    }

    .loop-item {
      position: relative;
      height: 100%;
      width: 40px;
      max-width: 40px;
      margin-right: -20px;
      overflow: hidden;
      cursor: grab;
      pointer-events: auto !important;
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
    }

    .loop-item:active {
      cursor: grabbing;
    }

    .loop {
      max-height: 100%;
      cursor: grab;
      pointer-events: auto !important;
    }

    #conchosList {
      left: 18%;
      width: 50%;
      height: 100%;
      z-index: 10;
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      pointer-events: auto !important;
    }

    .concho-wrapper {
      position: relative;
      max-height: 200px;
      max-width: 50px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      cursor: grab;
      pointer-events: auto !important;
    }

    .concho-wrapper:active {
      cursor: grabbing;
    }

    .concho {
      display: block;
      max-height: 200px;
      margin: 0 auto;
      clip-path: inset(0 30% 0 30%);
      cursor: grab;
      pointer-events: auto !important;
    }

    .concho img{
      scale: 5;
    }

    .loop-item,
    .concho-wrapper {
      cursor: grab;
      pointer-events: auto !important;
    }

    .loop-item:active,
    .concho-wrapper:active {
      cursor: grabbing;
    }

    /* While dragging, fade the original */
    .loop-item.dragging .loop,
    .concho-wrapper.dragging .concho {
      opacity: 0.55;
    }


    .remove-badge {
      position: absolute;
      left: 50%;
      transform: translateX(-50%) translateY(-10px);
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: none;
      padding: 0;
      background: rgba(220, 220, 220, 0.95);
      background-image: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2210%22%20height%3D%2210%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M5%205%20L19%2019%20M19%205%20L5%2019%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: center;
      background-size: 8px 8px;
      opacity: 0;
      pointer-events: none;
      cursor: pointer;
      transition: opacity 0.15s ease, transform 0.15s ease;
      z-index: 20;
    }

    .loop-item:hover .remove-badge,
    .concho-wrapper:hover .remove-badge {
      opacity: 1;
      transform: translateX(-50%) translateY(-30px);
      pointer-events: auto;
    }
  `),h(B,1,et);const fe={};async function hn(i){return Object.keys(fe).includes(i)?await fe[i]:fe[i]=new Promise((e,t)=>{const n=new Image;n.crossOrigin="anonymous",n.src=i,n.decode().then(()=>e(n)).catch(t)})}var ge=function(i,e){return ge=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,n){t.__proto__=n}||function(t,n){for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r])},ge(i,e)};function Lt(i,e){if(typeof e!="function"&&e!==null)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");ge(i,e);function t(){this.constructor=i}i.prototype=e===null?Object.create(e):(t.prototype=e.prototype,new t)}function be(i){var e=typeof Symbol=="function"&&Symbol.iterator,t=e&&i[e],n=0;if(t)return t.call(i);if(i&&typeof i.length=="number")return{next:function(){return i&&n>=i.length&&(i=void 0),{value:i&&i[n++],done:!i}}};throw new TypeError(e?"Object is not iterable.":"Symbol.iterator is not defined.")}function me(i,e){var t=typeof Symbol=="function"&&i[Symbol.iterator];if(!t)return i;var n=t.call(i),r,o=[],s;try{for(;(e===void 0||e-- >0)&&!(r=n.next()).done;)o.push(r.value)}catch(a){s={error:a}}finally{try{r&&!r.done&&(t=n.return)&&t.call(n)}finally{if(s)throw s.error}}return o}function ye(i,e,t){if(t||arguments.length===2)for(var n=0,r=e.length,o;n<r;n++)(o||!(n in e))&&(o||(o=Array.prototype.slice.call(e,0,n)),o[n]=e[n]);return i.concat(o||Array.prototype.slice.call(e))}typeof SuppressedError=="function"&&SuppressedError;function nt(i){return typeof i=="function"}function un(i){var e=function(n){Error.call(n),n.stack=new Error().stack},t=i(e);return t.prototype=Object.create(Error.prototype),t.prototype.constructor=t,t}var we=un(function(i){return function(t){i(this),this.message=t?t.length+` errors occurred during unsubscription:
`+t.map(function(n,r){return r+1+") "+n.toString()}).join(`
  `):"",this.name="UnsubscriptionError",this.errors=t}});function ve(i,e){if(i){var t=i.indexOf(e);0<=t&&i.splice(t,1)}}var Jt=(function(){function i(e){this.initialTeardown=e,this.closed=!1,this._parentage=null,this._finalizers=null}return i.prototype.unsubscribe=function(){var e,t,n,r,o;if(!this.closed){this.closed=!0;var s=this._parentage;if(s)if(this._parentage=null,Array.isArray(s))try{for(var a=be(s),l=a.next();!l.done;l=a.next()){var c=l.value;c.remove(this)}}catch(v){e={error:v}}finally{try{l&&!l.done&&(t=a.return)&&t.call(a)}finally{if(e)throw e.error}}else s.remove(this);var d=this.initialTeardown;if(nt(d))try{d()}catch(v){o=v instanceof we?v.errors:[v]}var p=this._finalizers;if(p){this._finalizers=null;try{for(var u=be(p),g=u.next();!g.done;g=u.next()){var $=g.value;try{bn($)}catch(v){o=o??[],v instanceof we?o=ye(ye([],me(o)),me(v.errors)):o.push(v)}}}catch(v){n={error:v}}finally{try{g&&!g.done&&(r=u.return)&&r.call(u)}finally{if(n)throw n.error}}}if(o)throw new we(o)}},i.prototype.add=function(e){var t;if(e&&e!==this)if(this.closed)bn(e);else{if(e instanceof i){if(e.closed||e._hasParent(this))return;e._addParent(this)}(this._finalizers=(t=this._finalizers)!==null&&t!==void 0?t:[]).push(e)}},i.prototype._hasParent=function(e){var t=this._parentage;return t===e||Array.isArray(t)&&t.includes(e)},i.prototype._addParent=function(e){var t=this._parentage;this._parentage=Array.isArray(t)?(t.push(e),t):t?[t,e]:e},i.prototype._removeParent=function(e){var t=this._parentage;t===e?this._parentage=null:Array.isArray(t)&&ve(t,e)},i.prototype.remove=function(e){var t=this._finalizers;t&&ve(t,e),e instanceof i&&e._removeParent(this)},i.EMPTY=(function(){var e=new i;return e.closed=!0,e})(),i})(),fn=Jt.EMPTY;function gn(i){return i instanceof Jt||i&&"closed"in i&&nt(i.remove)&&nt(i.add)&&nt(i.unsubscribe)}function bn(i){nt(i)?i():i.unsubscribe()}var xr={Promise:void 0},kr={setTimeout:function(i,e){for(var t=[],n=2;n<arguments.length;n++)t[n-2]=arguments[n];return setTimeout.apply(void 0,ye([i,e],me(t)))},clearTimeout:function(i){return clearTimeout(i)},delegate:void 0};function $r(i){kr.setTimeout(function(){throw i})}function mn(){}function Zt(i){i()}var yn=(function(i){Lt(e,i);function e(t){var n=i.call(this)||this;return n.isStopped=!1,t?(n.destination=t,gn(t)&&t.add(n)):n.destination=Ar,n}return e.create=function(t,n,r){return new xe(t,n,r)},e.prototype.next=function(t){this.isStopped||this._next(t)},e.prototype.error=function(t){this.isStopped||(this.isStopped=!0,this._error(t))},e.prototype.complete=function(){this.isStopped||(this.isStopped=!0,this._complete())},e.prototype.unsubscribe=function(){this.closed||(this.isStopped=!0,i.prototype.unsubscribe.call(this),this.destination=null)},e.prototype._next=function(t){this.destination.next(t)},e.prototype._error=function(t){try{this.destination.error(t)}finally{this.unsubscribe()}},e.prototype._complete=function(){try{this.destination.complete()}finally{this.unsubscribe()}},e})(Jt),Sr=(function(){function i(e){this.partialObserver=e}return i.prototype.next=function(e){var t=this.partialObserver;if(t.next)try{t.next(e)}catch(n){te(n)}},i.prototype.error=function(e){var t=this.partialObserver;if(t.error)try{t.error(e)}catch(n){te(n)}else te(e)},i.prototype.complete=function(){var e=this.partialObserver;if(e.complete)try{e.complete()}catch(t){te(t)}},i})(),xe=(function(i){Lt(e,i);function e(t,n,r){var o=i.call(this)||this,s;return nt(t)||!t?s={next:t??void 0,error:n??void 0,complete:r??void 0}:s=t,o.destination=new Sr(s),o}return e})(yn);function te(i){$r(i)}function _r(i){throw i}var Ar={closed:!0,next:mn,error:_r,complete:mn},Er=(function(){return typeof Symbol=="function"&&Symbol.observable||"@@observable"})();function Cr(i){return i}function Tr(i){return i.length===0?Cr:i.length===1?i[0]:function(t){return i.reduce(function(n,r){return r(n)},t)}}var wn=(function(){function i(e){e&&(this._subscribe=e)}return i.prototype.lift=function(e){var t=new i;return t.source=this,t.operator=e,t},i.prototype.subscribe=function(e,t,n){var r=this,o=Pr(e)?e:new xe(e,t,n);return Zt(function(){var s=r,a=s.operator,l=s.source;o.add(a?a.call(o,l):l?r._subscribe(o):r._trySubscribe(o))}),o},i.prototype._trySubscribe=function(e){try{return this._subscribe(e)}catch(t){e.error(t)}},i.prototype.forEach=function(e,t){var n=this;return t=vn(t),new t(function(r,o){var s=new xe({next:function(a){try{e(a)}catch(l){o(l),s.unsubscribe()}},error:o,complete:r});n.subscribe(s)})},i.prototype._subscribe=function(e){var t;return(t=this.source)===null||t===void 0?void 0:t.subscribe(e)},i.prototype[Er]=function(){return this},i.prototype.pipe=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];return Tr(e)(this)},i.prototype.toPromise=function(e){var t=this;return e=vn(e),new e(function(n,r){var o;t.subscribe(function(s){return o=s},function(s){return r(s)},function(){return n(o)})})},i.create=function(e){return new i(e)},i})();function vn(i){var e;return(e=i??xr.Promise)!==null&&e!==void 0?e:Promise}function Ir(i){return i&&nt(i.next)&&nt(i.error)&&nt(i.complete)}function Pr(i){return i&&i instanceof yn||Ir(i)&&gn(i)}var zr=un(function(i){return function(){i(this),this.name="ObjectUnsubscribedError",this.message="object unsubscribed"}}),xn=(function(i){Lt(e,i);function e(){var t=i.call(this)||this;return t.closed=!1,t.currentObservers=null,t.observers=[],t.isStopped=!1,t.hasError=!1,t.thrownError=null,t}return e.prototype.lift=function(t){var n=new kn(this,this);return n.operator=t,n},e.prototype._throwIfClosed=function(){if(this.closed)throw new zr},e.prototype.next=function(t){var n=this;Zt(function(){var r,o;if(n._throwIfClosed(),!n.isStopped){n.currentObservers||(n.currentObservers=Array.from(n.observers));try{for(var s=be(n.currentObservers),a=s.next();!a.done;a=s.next()){var l=a.value;l.next(t)}}catch(c){r={error:c}}finally{try{a&&!a.done&&(o=s.return)&&o.call(s)}finally{if(r)throw r.error}}}})},e.prototype.error=function(t){var n=this;Zt(function(){if(n._throwIfClosed(),!n.isStopped){n.hasError=n.isStopped=!0,n.thrownError=t;for(var r=n.observers;r.length;)r.shift().error(t)}})},e.prototype.complete=function(){var t=this;Zt(function(){if(t._throwIfClosed(),!t.isStopped){t.isStopped=!0;for(var n=t.observers;n.length;)n.shift().complete()}})},e.prototype.unsubscribe=function(){this.isStopped=this.closed=!0,this.observers=this.currentObservers=null},Object.defineProperty(e.prototype,"observed",{get:function(){var t;return((t=this.observers)===null||t===void 0?void 0:t.length)>0},enumerable:!1,configurable:!0}),e.prototype._trySubscribe=function(t){return this._throwIfClosed(),i.prototype._trySubscribe.call(this,t)},e.prototype._subscribe=function(t){return this._throwIfClosed(),this._checkFinalizedStatuses(t),this._innerSubscribe(t)},e.prototype._innerSubscribe=function(t){var n=this,r=this,o=r.hasError,s=r.isStopped,a=r.observers;return o||s?fn:(this.currentObservers=null,a.push(t),new Jt(function(){n.currentObservers=null,ve(a,t)}))},e.prototype._checkFinalizedStatuses=function(t){var n=this,r=n.hasError,o=n.thrownError,s=n.isStopped;r?t.error(o):s&&t.complete()},e.prototype.asObservable=function(){var t=new wn;return t.source=this,t},e.create=function(t,n){return new kn(t,n)},e})(wn),kn=(function(i){Lt(e,i);function e(t,n){var r=i.call(this)||this;return r.destination=t,r.source=n,r}return e.prototype.next=function(t){var n,r;(r=(n=this.destination)===null||n===void 0?void 0:n.next)===null||r===void 0||r.call(n,t)},e.prototype.error=function(t){var n,r;(r=(n=this.destination)===null||n===void 0?void 0:n.error)===null||r===void 0||r.call(n,t)},e.prototype.complete=function(){var t,n;(n=(t=this.destination)===null||t===void 0?void 0:t.complete)===null||n===void 0||n.call(t)},e.prototype._subscribe=function(t){var n,r;return(r=(n=this.source)===null||n===void 0?void 0:n.subscribe(t))!==null&&r!==void 0?r:fn},e})(xn),Dr=(function(i){Lt(e,i);function e(t){var n=i.call(this)||this;return n._value=t,n}return Object.defineProperty(e.prototype,"value",{get:function(){return this.getValue()},enumerable:!1,configurable:!0}),e.prototype._subscribe=function(t){var n=i.prototype._subscribe.call(this,t);return!n.closed&&t.next(this._value),n},e.prototype.getValue=function(){var t=this,n=t.hasError,r=t.thrownError,o=t._value;if(n)throw r;return this._throwIfClosed(),o},e.prototype.next=function(t){i.prototype.next.call(this,this._value=t)},e})(xn);function $n(i){return i instanceof at?w`
      ${i}
    `:typeof i=="function"?i():i}class Rr{constructor(e=[]){Se(this,O,0);y(this,"changed",new Dr(R(this,O)));this.steps=e}get stepIndex(){return R(this,O)}get hasNextStep(){return R(this,O)<this.steps.length-1}get hasPreviousStep(){return R(this,O)>0}get length(){return this.steps.length}get currentStep(){return this.steps[R(this,O)]}get previousStep(){if(!this.hasPreviousStep)throw new Error("Cannot access step before the first!");return this.steps[R(this,O)-1]}get nextStep(){if(!this.hasNextStep)throw new Error("Cannot access step after the last!");return this.steps[R(this,O)+1]}get currentView(){return $n(this.steps[R(this,O)].view)}next(){xt(R(this,O)<this.steps.length-1,"Cannot advance past the last step!"),yt(this,O,R(this,O)+1),this.changed.next(R(this,O))}previous(){xt(R(this,O)>0,"Cannot go back past the first step!"),yt(this,O,R(this,O)-1),this.changed.next(R(this,O))}goTo(e){xt(e<=this.steps.length-1,"Cannot advance past the last step!"),xt(e>=0,"Cannot go back past the first step!"),yt(this,O,e),this.changed.next(R(this,O)),typeof window<"u"&&typeof window.scrollTo=="function"&&window.scrollTo({top:0,left:0,behavior:"smooth"})}find(e){return this.steps.find(t=>t.id===e)}}O=new WeakMap;const Sn=i=>new Promise(e=>setTimeout(e,i));ci=[ae("belt-wizard")];class j extends(li=at,ai=[z()],si=[z()],oi=[z()],ri=[z()],ii=[z()],ni=[z()],ei=[z()],ti=[z()],Zn=[z()],Jn=[z()],Kn=[z()],Qn=[z()],Wn=[z()],Xn=[z()],Yn=[Ai({once:!0})],li){constructor(){super();h(m,5,this);y(this,"selection",null);y(this,"form",qt());y(this,"preview",qt());y(this,"checkout",qt());y(this,"filterWrap",qt());y(this,"shouldAdvance",!1);y(this,"loading",h(m,8,this,!1)),h(m,11,this);y(this,"beltBase",h(m,12,this,null)),h(m,15,this);y(this,"beltBuckle",h(m,16,this,null)),h(m,19,this);y(this,"beltLoops",h(m,20,this,[])),h(m,23,this);y(this,"beltConchos",h(m,24,this,[])),h(m,27,this);y(this,"beltTip",h(m,28,this,null)),h(m,31,this);y(this,"buckleChoices",h(m,32,this,[])),h(m,35,this);y(this,"buckleVariantImage",h(m,36,this,null)),h(m,39,this);y(this,"firstBaseSelected",h(m,40,this,!1)),h(m,43,this);y(this,"activeVariantKey",h(m,44,this,null)),h(m,47,this);y(this,"showBuckleSets",h(m,48,this,!0)),h(m,51,this);y(this,"showCollectionFilter",h(m,52,this,!1)),h(m,55,this);y(this,"collectionFilters",h(m,56,this,{})),h(m,59,this);y(this,"variantSelection",new Map);y(this,"onGlobalPointerDown",t=>{if(!this.showCollectionFilter)return;const n=this.filterWrap.value,r=t.target;n&&r&&!n.contains(r)&&(this.showCollectionFilter=!1)});y(this,"onGlobalKeyDown",t=>{this.showCollectionFilter&&t.key==="Escape"&&(this.showCollectionFilter=!1)});y(this,"wizard",h(m,60,this,new Rr([{id:"base",title:"Select a Belt Base",shortcut:()=>{var t;return this.multiSelectShortcut("Select a Belt Base",((t=this.selection)==null?void 0:t.has("base"))??!1)},view:w`
        <div class="row wrap gap-medium"></div>
      `},{id:"size",title:"What is your waist size?",subtitle:"We will add 3” to meet your perfect fit belt size",view:w`
        <div class="row wrap gap-medium"></div>
        <img
          id="sizingChart"
          src="/assets/belts/sizing-chart.png"
          alt="Perfect belt sizing chart"
        />
      `,background:{image:"url(/assets/belts/looped-belt.png)",size:{default:"50vw",desktop:"33vw"}}},{id:"buckle",title:"Choose a Belt Buckle",view:w`
        <div class="row wrap gap-medium"></div>
      `},{id:"loops",title:"Add Belt Loops",shortcut:()=>{var t;return this.multiSelectShortcut("No Belt Loops",((t=this.selection)==null?void 0:t.has("loop"))||!1)},view:w`
        <div class="row wrap gap-medium"></div>
      `},{id:"conchos",title:"Add Conchos",subtitle:"Drag and drop conchos to style your belt",shortcut:()=>{var t;return this.multiSelectShortcut("No Conchos",((t=this.selection)==null?void 0:t.has("concho"))||!1)},view:w`
        <div class="row wrap gap-medium"></div>
      `},{id:"tip",title:"Choose a Belt Tip",shortcut:()=>{var t;return this.multiSelectShortcut("No Belt Tip",((t=this.selection)==null?void 0:t.has("tip"))||!1)},view:w`
        <div class="row wrap gap-medium"></div>
      `},{id:"summary",title:"Your Belt",subtitle:"Here's your chosen belt.",shortcut:()=>w`
          <button type="button" class="btn primary" @click="${()=>this.triggerCheckoutFromShortcut()}">
            Checkout
          </button>
        `,view:()=>{var r,o,s;const t=[];this.beltBase||t.push({label:"Belt base",stepId:0}),this.beltBuckle||t.push({label:"Buckle",stepId:2}),this.beltLoops.length===0&&!this.hasSetSelected()&&t.push({label:"Belt loop",stepId:3});const n=t.length>0;return w`
          <div class="summary-header">
            <h2 class="heading-5">Selections</h2>

            ${n?w`
                <div class="summary-warning">
                  <p>Your belt is missing:</p>
                  <ul>
                    ${t.map(a=>w`
                          <li>
                            <button
                              type="button"
                              class="summary-missing-link"
                              @click="${()=>this.wizard.goTo(a.stepId)}"
                            >
                              Add ${a.label}
                            </button>
                          </li>
                        `)}
                  </ul>
                </div>
              `:""}
          </div>

          <belt-checkout
            ${Vt(this.checkout)}
            base="${(r=this.beltBase)==null?void 0:r.id}"
            buckle="${(o=this.beltBuckle)==null?void 0:o.id}"
            tip="${(s=this.beltTip)==null?void 0:s.id}"
            @step-change="${({detail:a})=>this.wizard.goTo(a)}"
          >
          </belt-checkout>
        `}}]))),h(m,63,this);y(this,"beltData",[]);this.wizard.changed.subscribe(()=>this.requestUpdate()),this.updateProducts()}getVariantKey(t,n){return`${t}:${n}`}isSetProduct(t){var n;return!!((n=t==null?void 0:t.tags)!=null&&n.some(r=>r.toLowerCase()==="set"))}hasSetSelected(){return this.isSetProduct(this.beltBuckle)}shouldShowCollectionFilter(t){return t==="buckle"||t==="loops"||t==="conchos"||t==="tip"}getFilterStepKey(t){return t==="buckle"?"buckle":t==="loops"?"loops":t==="conchos"?"conchos":t==="tip"?"tip":null}getProductsForStep(t){const[n,r,o,s,a]=this.beltData;if(t==="buckle"){let l=this.buckleChoices??[];return this.showBuckleSets||(l=l.filter(c=>!this.isSetProduct(c))),l}return t==="loops"?o??[]:t==="conchos"?s??[]:t==="tip"?a??[]:[]}getAllCollectionsForStep(t){var o;const n=this.getProductsForStep(t),r=new Set;for(const s of n)((o=s.collections)!=null&&o.length?s.collections.map(l=>l.title):["Other"]).forEach(l=>r.add(l));return Array.from(r).sort((s,a)=>s.localeCompare(a))}getSelectedCollectionsForStep(t){const n=this.getFilterStepKey(t);return n?this.collectionFilters[n]??[]:[]}toggleCollectionFilter(t,n){const r=this.getFilterStepKey(t);if(!r)return;const o=new Set(this.collectionFilters[r]??[]);o.has(n)?o.delete(n):o.add(n),this.collectionFilters={...this.collectionFilters,[r]:Array.from(o)}}filterProductsBySelectedCollections(t,n){const r=this.getSelectedCollectionsForStep(t);if(!r.length)return n;const o=new Set(r);return n.filter(s=>{var l;return((l=s.collections)!=null&&l.length?s.collections.map(c=>c.title):["Other"]).some(c=>o.has(c))})}rebuildStepForFilter(t){if(t==="buckle"){this.buildSingleSelectStep("buckle",this.buckleChoices);return}if(t==="loops"){this.buildMultiSelectStep("loop",this.beltData[2]??[],2);return}if(t==="conchos"){this.buildMultiSelectStep("concho",this.beltData[3]??[],9);return}if(t==="tip"){this.buildSingleSelectStep("tip",this.beltData[4]??[]);return}}advanceWizard(){const t=this.hasSetSelected(),n=this.wizard.steps;let r=this.wizard.stepIndex+1;for(;r<n.length;){const o=n[r].id;if(t&&(o==="loops"||o==="tip")){r++;continue}break}r<n.length&&this.wizard.goTo(r)}reorderArray(t,n,r){const o=[...t],[s]=o.splice(n,1);return o.splice(r,0,s),o}groupProductsByCollection(t,n){var o,s;const r=new Map;for(const a of t){if(n!=null&&n.hideSets&&((o=a.tags)!=null&&o.some(c=>c.toLowerCase()==="set")))continue;const l=(s=a.collections)!=null&&s.length?a.collections.map(c=>c.title):["Other"];for(const c of l)r.has(c)||r.set(c,[]),r.get(c).push(a)}return r}handleReorder(t,n,r){n!==r&&(t==="loop"?(this.beltLoops=this.reorderArray(this.beltLoops,n,r),this.reorderFormDataMulti("loop",n,r)):(this.beltConchos=this.reorderArray(this.beltConchos,n,r),this.reorderFormDataMulti("concho",n,r)),this.applySelectionToPreview())}reorderFormDataMulti(t,n,r){if(!this.selection)return;const o=this.selection.getAll(t),s=this.selection.getAll(`${t}Variant`);if(n<0||n>=o.length||r<0||r>=o.length)return;for(;s.length<o.length;)s.push("");const a=this.reorderArray(o,n,r),l=this.reorderArray(s,n,r);this.selection.delete(t),this.selection.delete(`${t}Variant`),a.forEach(c=>this.selection.append(t,c)),l.forEach(c=>{c&&this.selection.append(`${t}Variant`,c)})}multiSelectShortcut(t,n){var d;const r=this.wizard.currentStep.id,o=r==="loops",s=r==="conchos",a=r==="tip";let l,c;return o?(l=(((d=this.selection)==null?void 0:d.getAll("loop").length)??0)>=1,c=l?"Continue":"1 loop required"):s||a?(l=!0,c=n?"Continue":t):(l=n,c=n?"Continue":t),w`
      <button class="btn primary" ?disabled="${!l}" @click="${()=>this.submitStep()}">
        ${c}
      </button>
    `}removeItem(t,n){if(!this.selection)return;const r=this.selection.getAll(t),o=`${t}Variant`,s=this.selection.getAll(o);n<0||n>=r.length||(r.splice(n,1),s.length>n&&s.splice(n,1),this.selection.delete(t),r.forEach(a=>this.selection.append(t,a)),this.selection.delete(o),s.forEach(a=>this.selection.append(o,a)),this.applySelectionToPreview())}createRenderRoot(){return this}updated(t){if(this.checkout.value){const n=this.checkout.value;n.beltData=this.beltData,n.loops=this.beltLoops,n.conchos=this.beltConchos,n.baseVariantId=this.getSelectedSingleVariantId("base",this.beltBase),n.buckleVariantId=this.getSelectedSingleVariantId("buckle",this.beltBuckle),n.tipVariantId=this.hasSetSelected()?void 0:this.getSelectedSingleVariantId("tip",this.beltTip),n.loopsVariantIds=this.hasSetSelected()?[]:this.getSelectedMultiVariantIds("loop",2),n.conchosVariantIds=this.getSelectedMultiVariantIds("concho",9)}t.has("showCollectionFilter")&&(this.showCollectionFilter?(self.addEventListener("pointerdown",this.onGlobalPointerDown),self.addEventListener("keydown",this.onGlobalKeyDown)):(self.removeEventListener("pointerdown",this.onGlobalPointerDown),self.removeEventListener("keydown",this.onGlobalKeyDown)))}getSelectedSingleVariantId(t,n){var s,a,l;if(!n)return;const r=((s=this.selection)==null?void 0:s.get(`${t}Variant`))??null;if(r&&n.variants.some(c=>c.id===r))return r;const o=(l=(a=n.variants)==null?void 0:a[0])==null?void 0:l.id;if(!o)throw new Error(`${t} product ${n.id} has no variants`);return o}getSelectedMultiVariantIds(t,n){var s;const r=t==="loop"?this.beltLoops:this.beltConchos,o=((s=this.selection)==null?void 0:s.getAll(`${t}Variant`))??[];return r.slice(0,n).map((a,l)=>{var p,u;const c=o[l];if(c&&a.variants.some(g=>g.id===c))return c;const d=(u=(p=a.variants)==null?void 0:p[0])==null?void 0:u.id;if(!d)throw new Error(`${t} product ${a.id} has no variants`);return d})}render(){if(this.loading)return w`
        <div>Loading...</div>
      `;const t=this.wizard.currentStep,n=this.buckleVariantImage??(this.beltBuckle?I(this.beltBuckle,0):void 0),r=this.beltBase?w`
        <section id="preview" class="${le({"preview-enter":this.firstBaseSelected})}">
          <belt-preview
            class="step-${this.wizard.stepIndex}"
            ${Vt(this.preview)}
            base="${I(this.beltBase,1)??I(this.beltBase,0)??""}"
            buckle="${n??""}"
            tip="${this.beltTip?I(this.beltTip,0):void 0}"
            @reorder-loops="${s=>this.handleReorder("loop",s.detail.fromIndex,s.detail.toIndex)}"
            @reorder-conchos="${s=>this.handleReorder("concho",s.detail.fromIndex,s.detail.toIndex)}"
            @remove-loop="${s=>this.removeItem("loop",s.detail.index)}"
            @remove-concho="${s=>this.removeItem("concho",s.detail.index)}"
          >
          </belt-preview>
        </section>
      `:null,o=this.shouldShowCollectionFilter(t.id)?this.renderFilterTools(t.id):null;return w`
      <header>
        <section id="stepper">
          ${this.wizard.steps.map((s,a)=>w`
                <button
                  class="step"
                  ?disabled="${this.wizard.stepIndex===a}"
                  title="${`Step ${a+1} of ${this.wizard.steps.length}: ${this.wizard.steps[a].title}`}"
                  @click="${()=>this.wizard.goTo(a)}"
                >
                </button>
              `)}
        </section>
        <section id="stepHeading" class="row">
          <div id="stepTitle" class="step-title step-enter-${this.wizard.stepIndex}">
            <h2 class="heading-4">${t.title}</h2>
            ${t.subtitle?w`
                <p class="subtitle">${t.subtitle}</p>
              `:null}
          </div>

          ${t.shortcut&&w`
            <div id="stepShortcut">${$n(t.shortcut)}</div>
          `}
        </section>

        ${r} ${o}
      </header>

      <section id="${t.id}" class="${le({step:!0,"step-shifted":this.firstBaseSelected})}">
        <div class="step-content step-enter-${this.wizard.stepIndex}">
          <form
            ${Vt(this.form)}
            @submit="${async s=>{s.preventDefault(),await Sn(0),new FormData(this.form.value)}}"
            @formdata="${async({formData:s})=>{this.updateWizardSelection(s),this.shouldAdvance&&(this.shouldAdvance=!1,await Sn(500),this.advanceWizard())}}"
          >
            ${this.wizard.currentView}
          </form>
        </div>
      </section>
    `}async submitStep(){var t,n,r;if(this.shouldAdvance=!0,(t=this.form.value)==null||t.requestSubmit(),this.wizard.currentStep.id==="base"){const o=(r=(n=this.beltBase)==null?void 0:n.tags)==null?void 0:r.find(p=>p.endsWith("mm")),s=o?` AND tag:${o}`:"",[a,l,c,d]=await Promise.all([Z(`tag:buckle${s}`),Z(`tag:set${s}`),Z(`tag:Loop${s}`),Z(`tag:tip${s}`)]);this.beltData[1]=this.buckleChoices=[...l,...a],this.beltData[2]=c,this.beltData[4]=d,this.beltData[6]=l,console.debug("Rebuilt buckle, set, loop, and tip steps based on base width:",o),this.buildSingleSelectStep("buckle",this.buckleChoices),this.buildMultiSelectStep("loop",c,2),this.buildSingleSelectStep("tip",d)}}triggerCheckoutFromShortcut(){var o;const t=this.checkout.value;if(!t)return;const n=t;if(typeof n.checkoutNow=="function"){n.checkoutNow();return}const r=(o=t.shadowRoot)==null?void 0:o.querySelector("button.btn.primary");r==null||r.click()}renderFilterTools(t){if(!this.getFilterStepKey(t))return null;const r=new Set(this.getSelectedCollectionsForStep(t)),o=this.getAllCollectionsForStep(t).map(a=>{const l=r.has(a);return w`
        <button
          type="button"
          class="${le({"filter-item":!0,"is-selected":l})}"
          aria-pressed="${l?"true":"false"}"
          @click="${()=>{this.toggleCollectionFilter(t,a),this.rebuildStepForFilter(t),this.requestUpdate()}}"
        >
          <span class="filter-item-title">${a}</span>
        </button>
      `}),s=o.length===0?w`
        <div>No collections found for this step.</div>
      `:w`
        <div class="filter-list" role="listbox" aria-multiselectable="true">
          ${o}
        </div>
      `;return w`
      <div class="step-tools">
        ${t==="buckle"?w`
            <label class="switch">
              <input
                type="checkbox"
                .checked="${this.showBuckleSets}"
                @change="${a=>{this.showBuckleSets=a.target.checked,this.buildSingleSelectStep("buckle",this.buckleChoices),this.requestUpdate()}}"
              />
              <span class="switch-track" aria-hidden="true">
                <span class="switch-thumb" aria-hidden="true"></span>
              </span>
              <span class="switch-label">Show Sets</span>
            </label>
          `:null}

        <div class="filter-wrap" ${Vt(this.filterWrap)}>
          <button
            type="button"
            class="filter-btn"
            title="Toggle Collection Filters"
            aria-haspopup="dialog"
            aria-expanded="${this.showCollectionFilter?"true":"false"}"
            @click="${a=>{a.stopPropagation(),this.showCollectionFilter=!this.showCollectionFilter}}"
          >
            <span class="filter-icon" aria-hidden="true">
              <span class="bar bar-1"></span>
              <span class="bar bar-2"></span>
              <span class="bar bar-3"></span>
            </span>
          </button>

          <div
            class="filter-popover"
            role="dialog"
            aria-modal="false"
            ?hidden="${!this.showCollectionFilter}"
            @click="${a=>a.stopPropagation()}"
          >
            <div class="filter-popover-header">
              <div class="filter-popover-title">Filter</div>
              <button
                type="button"
                class="filter-popover-close"
                @click="${()=>this.showCollectionFilter=!1}"
                title="Close"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div class="filter-popover-body">
              ${s}
            </div>
          </div>
        </div>
      </div>
    `}buildSingleSelectStep(t,n){const r=this.wizard.find(t.toString());r.view=()=>{const o=t==="buckle"?"buckle":t,s=t==="buckle"&&!this.showBuckleSets,a=this.filterProductsBySelectedCollections(o,s?n.filter(c=>!this.isSetProduct(c)):n),l=this.groupProductsByCollection(a);return w`
        ${Array.from(l.entries()).map(([c,d])=>w`
              <div>
                <h3 class="collection-title">${c}</h3>
                <div class="row wrap gap-medium">
                  ${d.map(p=>{var C,_;const u=Array.isArray(p.variants)&&p.variants.length>1,g=this.renderVariantPopup(t,p),$=((C=this.selection)==null?void 0:C.get(t))===p.id,v=I(p,0),D=t==="base"?I(p,2,{fallbackToFirst:!1})??I(p,1):null;return w`
                      <span
                        class="option thumbnail ${$?"selected":""}"
                        data-kind="${t}"
                        data-is-set="${t==="buckle"&&this.isSetProduct(p)?"true":"false"}"
                        @click="${this.handleCardClick(t,p,u,()=>{var Y;if(this.ensureSelection(),t==="base"){const X=this.getBaseWidthTag(this.beltBase),it=this.getBaseWidthTag(p);!!this.beltBase&&this.beltBase.id!==p.id&&X!==it&&this.resetSelectionsForBaseWidthChange()}t==="tip"&&this.hasSetSelected()&&this.resetBuckleLoopsAndTip(),this.selection.set(t,p.id),this.applySelectionToPreview(),t!=="base"?this.submitStep():(this.shouldAdvance=!1,(Y=this.form.value)==null||Y.requestSubmit())})}"
                      >
                        <input
                          id="${p.id}"
                          class="sr-only"
                          type="radio"
                          name="${t}"
                          value="${p.id}"
                        />
                        <label for="${p.id}">
                          <div class="selection-indicator-wrapper ${$?"selected":""}">
                            <img
                              class="thumbnail selection-indicator"
                              src="${v}"
                              alt="${p.title}"
                              width="160"
                              height="160"
                            />
                            ${D?w`
                                <img
                                  class="hover-image"
                                  src="${D}"
                                  alt="${p.title}"
                                  width="160"
                                  height="160"
                                />
                              `:null}
                          </div>
                          <span class="label">${p.title}</span>
                          ${(_=p.priceRange)!=null&&_.minVariantPrice?w`
                              <span class="price">${pe(p.priceRange.minVariantPrice)}</span>
                            `:null}
                        </label>

                        ${g??null}
                      </span>
                    `})}
                </div>
              </div>
            `)}
      `}}buildMultiSelectStep(t,n,r){const o=this.wizard.find(t+"s");o.view=()=>{const s=t==="loop"?"loops":t==="concho"?"conchos":`${t}s`,a=this.filterProductsBySelectedCollections(s,n),l=this.groupProductsByCollection(a);return w`
        ${Array.from(l.entries()).map(([c,d])=>w`
              <div>
                <h3 class="collection-title">${c}</h3>
                <div class="row wrap gap-medium">
                  ${d.map(p=>{var C;const u=(C=this.selection)==null?void 0:C.getAll(t),g=u?u.filter(_=>_===p.id).length:0,$=g>0,v=Array.isArray(p.variants)&&p.variants.length>1,D=this.renderVariantPopup(t,p);return pn(p.id,I(p,0),t,p.id,p.title,p.priceRange.minVariantPrice,{onClick:this.handleCardClick(t,p,v,_=>{_.preventDefault(),this.toggleSelection(t,p.id,r),this.requestUpdate()}),selected:$,count:g,popup:D})})}
                </div>
              </div>
            `)}
      `}}async updateProducts(){this.loading=!0;const[t,n,r,o,s,a,l]=this.beltData=await Promise.all([Z("tag:Belt Strap"),Z("tag:buckle"),Z("tag:Loop"),Z("tag:concho"),Z("tag:tip"),Z("tag:size"),Z("tag:Set")]);this.beltData[1]=this.buckleChoices,this.buildSingleSelectStep("base",t),this.buildSingleSelectStep("buckle",this.buckleChoices=[...l,...n]),this.buildMultiSelectStep("loop",r,2),this.buildMultiSelectStep("concho",o,9),this.buildSingleSelectStep("tip",s);const c=this.wizard.find("size"),d=a[0]??null,p=(d==null?void 0:d.variants)??[];c.view=()=>w`
        <div class="size-step-wrapper">
          <div class="row wrap gap-medium">
            ${p.length===0?w`
                <p>No sizes found. Check the "Size" product variants.</p>
              `:p.map(u=>{const g=u.title.trim(),$=u.price??null,v=`${g}"`;return yr(`size-${u.id}`,"size",u.id,v,$,{onClick:this.submitStep})})}
          </div>
          <img
            id="sizingChart"
            src="/assets/belts/sizing-chart.png"
            alt="Perfect belt sizing chart"
          />
        </div>
      `,this.loading=!1}ensureSelection(){this.selection||(this.selection=new FormData)}applySelectionToPreview(){var p,u,g,$,v,D,C;const[t,n,r,o,s,a,l]=this.beltData,c=!!this.beltBase;this.beltBase=t.find(_=>_.id===this.selection.get("base"))??null;const d=!!this.beltBase;if(!c&&d&&(this.firstBaseSelected=!0),(p=this.selection)!=null&&p.has("buckle")){const _=this.selection.get("buckle");this.beltBuckle=this.buckleChoices.find(Y=>Y.id===_)??null}else this.beltBuckle=null;if(this.beltBuckle)if(this.isSetProduct(this.beltBuckle))this.buckleVariantImage=I(this.beltBuckle,1,{fallbackToFirst:!1})??I(this.beltBuckle,0);else if((u=this.selection)!=null&&u.has("buckleVariant")){const _=this.selection.get("buckleVariant"),X=(this.beltBuckle.variants??[]).find(it=>it.id===_);this.buckleVariantImage=((g=X==null?void 0:X.image)==null?void 0:g.url)??I(this.beltBuckle,0)}else this.buckleVariantImage=I(this.beltBuckle,0);else this.buckleVariantImage=null;if(($=this.selection)!=null&&$.has("loop")){const _=this.selection.getAll("loop"),Y=this.selection.getAll("loopVariant")??[],X=_.slice(0,2),it=Y.slice(0,X.length);this.beltLoops=X.map(L=>r.find(tt=>tt.id===L)).filter(Boolean),this.preview.value&&(this.preview.value.loops=this.beltLoops.map((L,tt)=>{var mt,A;const gt=it[tt],bt=L.variants??[];return gt&&Array.isArray(bt)?(A=(mt=bt.find(M=>M.id===gt))==null?void 0:mt.image)==null?void 0:A.url:I(L,0)}).filter(L=>L!=null))}else this.beltLoops=[],this.preview.value&&(this.preview.value.loops=[]);if((v=this.selection)!=null&&v.has("concho")){const _=this.selection.getAll("concho"),Y=this.selection.getAll("conchoVariant")??[],X=_.slice(0,9),it=Y.slice(0,X.length);this.beltConchos=X.map(L=>o.find(tt=>tt.id===L)).filter(Boolean),this.preview.value&&(this.preview.value.conchos=this.beltConchos.map((L,tt)=>{var mt,A;const gt=it[tt],bt=L.variants??[];return gt&&Array.isArray(bt)?(A=(mt=bt.find(M=>M.id===gt))==null?void 0:mt.image)==null?void 0:A.url:I(L,0)}).filter(L=>L!=null))}else this.beltConchos=[],this.preview.value&&(this.preview.value.conchos=[]);if(this.beltTip=s.find(_=>_.id===this.selection.get("tip"))??null,this.beltBuckle&&this.isSetProduct(this.beltBuckle)&&this.preview.value){const _=I(this.beltBuckle,2,{fallbackToFirst:!1}),Y=I(this.beltBuckle,3,{fallbackToFirst:!1});(D=this.selection)!=null&&D.has("loop")||(this.preview.value.loops=_?[_]:[]),(C=this.selection)!=null&&C.has("tip")||(this.preview.value.tip=Y??null)}this.requestUpdate()}renderVariantPopup(t,n){const r=this.getVariantKey(t,n.id);if(this.activeVariantKey!==r)return null;const o=Array.isArray(n.variants)?n.variants:[];if(o.length<=1)return null;const s=t==="loop"||t==="concho",a=s?this.getVariantCountsForProduct(t,n.id):{},l=!s&&this.selection?this.selection.get(`${t}Variant`):null;return w`
      <div
        class="variant-popup"
        data-kind="${t}"
        @click="${c=>c.stopPropagation()}"
      >
        <div class="variant-popup-grid">
          ${o.map(c=>{var v,D;const d=c.id,p=s?a[d]??0:0,u=s?p>0:l===d,g=s&&p>0,$=((v=c.image)==null?void 0:v.url)??((D=c.image)==null?void 0:D.url)??I(n,0);return w`
              <button
                type="button"
                class="variant-swatch ${u?"is-selected":""}"
                @click="${C=>{C.preventDefault(),C.stopPropagation(),this.handleVariantSelect(t,n,c)}}"
              >
                <img src="${$}" alt="${c.title}" />
                ${g?w`
                    <span class="option-count">x${p}</span>
                  `:null}
              </button>
            `})}
        </div>
      </div>
    `}handleCardClick(t,n,r,o){return s=>{if(r){s.preventDefault(),s.stopPropagation();const a=this.getVariantKey(t,n.id);this.activeVariantKey=this.activeVariantKey===a?null:a,this.requestUpdate();return}o==null||o(s)}}handleVariantSelect(t,n,r){var a,l,c,d;this.ensureSelection();const o=this.getVariantKey(t,n.id);this.variantSelection.set(o,r.id),t==="loop"||t==="concho"?this.selection.append(`${t}Variant`,r.id):this.selection.set(`${t}Variant`,r.id);const s=((a=r.image)==null?void 0:a.url)??((l=r.image)==null?void 0:l.url)??I(n,0);switch(t){case"base":{if(this.selection.set("base",n.id),this.beltBase=n,this.preview.value){const p=((c=r.image)==null?void 0:c.url)??((d=r.image)==null?void 0:d.url)??I(n,1)??I(n,0);this.preview.value.base=p}break}case"buckle":{this.selection.set("buckle",n.id),this.beltBuckle=n,this.preview.value&&(this.preview.value.buckle=s);break}case"tip":{this.hasSetSelected()&&this.resetBuckleLoopsAndTip(),this.selection.set("tip",n.id),this.beltTip=n,this.preview.value&&(this.preview.value.tip=s);break}case"loop":{if(this.hasSetSelected()&&this.resetBuckleLoopsAndTip(),this.getMultiTotal("loop")>=2)break;if(this.selection.append("loop",n.id),this.applySelectionToPreview(),this.preview.value){const u=this.selection.getAll("loop");this.preview.value.loops=u.map(()=>s).filter(g=>g!==null)}break}case"concho":{if(this.getMultiTotal("concho")>=9)break;this.selection.append("concho",n.id),this.applySelectionToPreview();break}}this.activeVariantKey=null,this.requestUpdate(),!(t!=="buckle"&&t!=="tip"&&t!=="base")&&this.submitStep()}getMultiTotal(t){return this.selection?this.selection.getAll(t).length:0}getVariantCountsForProduct(t,n){const r={};if(!this.selection)return r;const o=this.selection.getAll(t),s=this.selection.getAll(`${t}Variant`);return o.forEach((a,l)=>{if(a!==n)return;const c=s[l];c&&(r[c]=(r[c]??0)+1)}),r}toggleSelection(t,n,r){this.ensureSelection(),t==="loop"&&this.hasSetSelected()&&this.resetBuckleLoopsAndTip();let o=this.selection.getAll(t)??[];o=o.filter(a=>a===n).length>=r?o.filter(a=>a!==n):[...o,n],o.length>r&&(o=o.slice(0,r)),this.selection.delete(t),o.forEach(a=>this.selection.append(t,a)),this.applySelectionToPreview()}resetBuckleLoopsAndTip(){if(!this.selection)return;const t=["buckle","buckleVariant","loop","loopVariant","tip","tipVariant"];for(const n of t)this.selection.delete(n);this.beltBuckle=null,this.buckleVariantImage=null,this.beltLoops=[],this.beltTip=null,this.preview.value&&(this.preview.value.buckle="",this.preview.value.loops=[],this.preview.value.tip=null)}getBaseWidthTag(t){var r;return(r=t==null?void 0:t.tags)!=null&&r.length?t.tags.find(o=>o.toLowerCase().endsWith("mm"))??null:null}resetSelectionsForBaseWidthChange(){if(!this.selection)return;const t=["buckle","buckleVariant","loop","loopVariant","concho","conchoVariant","tip","tipVariant"];for(const n of t)this.selection.delete(n);this.beltBuckle=null,this.buckleVariantImage=null,this.beltLoops=[],this.beltConchos=[],this.beltTip=null,this.showCollectionFilter=!1,this.collectionFilters={},this.activeVariantKey=null,this.variantSelection.clear(),this.preview.value&&(this.preview.value.buckle=null,this.preview.value.loops=[],this.preview.value.conchos=[],this.preview.value.tip=null)}updateWizardSelection(t){this.ensureSelection();const n=new Set(["loop","concho"]),r=[...t.entries()];for(const[o]of r)n.has(o)&&this.selection.delete(o);for(const[o,s]of r)n.has(o)?this.selection.append(o,s):this.selection.set(o,s);this.applySelectionToPreview()}}m=ee(li),S(m,1,"submitStep",Yn,j),S(m,5,"loading",ai,j),S(m,5,"beltBase",si,j),S(m,5,"beltBuckle",oi,j),S(m,5,"beltLoops",ri,j),S(m,5,"beltConchos",ii,j),S(m,5,"beltTip",ni,j),S(m,5,"buckleChoices",ei,j),S(m,5,"buckleVariantImage",ti,j),S(m,5,"firstBaseSelected",Zn,j),S(m,5,"activeVariantKey",Jn,j),S(m,5,"showBuckleSets",Kn,j),S(m,5,"showCollectionFilter",Qn,j),S(m,5,"collectionFilters",Wn,j),S(m,5,"wizard",Xn,j),j=S(m,0,"CustomBeltWizard",ci,j),h(m,1,j),document.addEventListener("DOMContentLoaded",()=>{const i=document.querySelector("#getStarted");i==null||i.addEventListener("click",()=>{var e,t;(e=i.parentElement)==null||e.setAttribute("hidden",""),(t=document.querySelector("belt-wizard"))==null||t.removeAttribute("hidden")})})})();
//# sourceMappingURL=belt-wizard-iKVrN01X.js.map
