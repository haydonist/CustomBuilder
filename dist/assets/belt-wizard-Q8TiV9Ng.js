var Ns=Object.create;var Se=Object.defineProperty;var Ls=Object.getOwnPropertyDescriptor;var di=(f,v)=>(v=Symbol[f])?v:Symbol.for("Symbol."+f),St=f=>{throw TypeError(f)};var ui=(f,v,k)=>v in f?Se(f,v,{enumerable:!0,configurable:!0,writable:!0,value:k}):f[v]=k;var pi=(f,v)=>Se(f,"name",{value:v,configurable:!0});var ee=f=>[,,,Ns((f==null?void 0:f[di("metadata")])??null)],fi=["class","method","getter","setter","accessor","field","value","get","set"],Bt=f=>f!==void 0&&typeof f!="function"?St("Function expected"):f,Bs=(f,v,k,Y,T)=>({kind:fi[f],name:v,metadata:Y,addInitializer:z=>k._?St("Already initialized"):T.push(Bt(z||null))}),Fs=(f,v)=>ui(v,di("metadata"),f[3]),d=(f,v,k,Y)=>{for(var T=0,z=f[v>>1],Q=z&&z.length;T<Q;T++)v&1?z[T].call(k):Y=z[T].call(k,Y);return Y},$=(f,v,k,Y,T,z)=>{var Q,q,kt,nt,rt,E=v&7,vt=!!(v&8),K=!!(v&16),_t=E>3?f.length+1:E?vt?1:2:0,Ft=fi[E+5],Ut=E>3&&(f[_t-1]=[]),ne=f[_t]||(f[_t]=[]),W=E&&(!K&&!vt&&(T=T.prototype),E<5&&(E>3||!K)&&Ls(E<4?T:{get[k](){return R(this,z)},set[k](U){return mt(this,z,U)}},k));E?K&&E<4&&pi(z,(E>2?"set ":E>1?"get ":"")+k):pi(T,k);for(var J=Y.length-1;J>=0;J--)nt=Bs(E,k,kt={},f[3],ne),E&&(nt.static=vt,nt.private=K,rt=nt.access={has:K?U=>Us(T,U):U=>k in U},E^3&&(rt.get=K?U=>(E^1?R:Ms)(U,T,E^4?z:W.get):U=>U[k]),E>2&&(rt.set=K?(U,At)=>mt(U,T,At,E^4?z:W.set):(U,At)=>U[k]=At)),q=(0,Y[J])(E?E<4?K?z:W[Ft]:E>4?void 0:{get:W.get,set:W.set}:T,nt),kt._=1,E^4||q===void 0?Bt(q)&&(E>4?Ut.unshift(q):E?K?z=q:W[Ft]=q:T=q):typeof q!="object"||q===null?St("Object expected"):(Bt(Q=q.get)&&(W.get=Q),Bt(Q=q.set)&&(W.set=Q),Bt(Q=q.init)&&Ut.unshift(Q));return E||Fs(f,T),W&&Se(T,k,W),K?E^4?z:W:T},m=(f,v,k)=>ui(f,typeof v!="symbol"?v+"":v,k),ke=(f,v,k)=>v.has(f)||St("Cannot "+k),Us=(f,v)=>Object(v)!==v?St('Cannot use the "in" operator on this value'):f.has(v),R=(f,v,k)=>(ke(f,v,"read from private field"),k?k.call(f):v.get(f)),_e=(f,v,k)=>v.has(f)?St("Cannot add the same private member more than once"):v instanceof WeakSet?v.add(f):v.set(f,k),mt=(f,v,k,Y)=>(ke(f,v,"write to private field"),Y?Y.call(f,k):v.set(f,k),k),Ms=(f,v,k)=>(ke(f,v,"access private method"),k);(function(){"use strict";var _n,An,En,Cn,Tn,Pn,In,Dn,On,Vn,Rn,zn,Nn,Ln,Bn,x,Fn,Un,Mn,jn,Hn,qn,Gn,B,$t,L,Yn,Xn,Wn,Qn,Kn,Jn,Zn,ti,ei,ni,ii,si,ri,oi,ai,li,ci,hi,g;function f(i){const e=Number.parseFloat(i.amount);return Number.isNaN(e)?`${i.currencyCode} ${i.amount}`:new Intl.NumberFormat("en-US",{style:"currency",currency:i.currencyCode,minimumFractionDigits:2,maximumFractionDigits:2}).format(e)}function v(i,e){if(!i)throw new Error(e??"Assertion failed")}function k(i,e,t){if(!(i instanceof e))throw new Error(`Expected value to be instance of ${e.name}`)}const Y=i=>new Promise(e=>setTimeout(e,i));/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const T=globalThis,z=T.ShadowRoot&&(T.ShadyCSS===void 0||T.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Q=Symbol(),q=new WeakMap;let kt=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==Q)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(z&&e===void 0){const n=t!==void 0&&t.length===1;n&&(e=q.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&q.set(t,e))}return e}toString(){return this.cssText}};const nt=i=>new kt(typeof i=="string"?i:i+"",void 0,Q),rt=(i,...e)=>{const t=i.length===1?i[0]:e.reduce((n,s,r)=>n+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+i[r+1],i[0]);return new kt(t,i,Q)},E=(i,e)=>{if(z)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const n=document.createElement("style"),s=T.litNonce;s!==void 0&&n.setAttribute("nonce",s),n.textContent=t.cssText,i.appendChild(n)}},vt=z?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(const n of e.cssRules)t+=n.cssText;return nt(t)})(i):i;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:K,defineProperty:_t,getOwnPropertyDescriptor:Ft,getOwnPropertyNames:Ut,getOwnPropertySymbols:ne,getPrototypeOf:W}=Object,J=globalThis,U=J.trustedTypes,At=U?U.emptyScript:"",ie=J.reactiveElementPolyfillSupport,Et=(i,e)=>i,Mt={toAttribute(i,e){switch(e){case Boolean:i=i?At:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},se=(i,e)=>!K(i,e),Ae={attribute:!0,type:String,converter:Mt,reflect:!1,useDefault:!1,hasChanged:se};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),J.litPropertyMetadata??(J.litPropertyMetadata=new WeakMap);let yt=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Ae){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const n=Symbol(),s=this.getPropertyDescriptor(e,n,t);s!==void 0&&_t(this.prototype,e,s)}}static getPropertyDescriptor(e,t,n){const{get:s,set:r}=Ft(this.prototype,e)??{get(){return this[t]},set(o){this[t]=o}};return{get:s,set(o){const a=s==null?void 0:s.call(this);r==null||r.call(this,o),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Ae}static _$Ei(){if(this.hasOwnProperty(Et("elementProperties")))return;const e=W(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(Et("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Et("properties"))){const t=this.properties,n=[...Ut(t),...ne(t)];for(const s of n)this.createProperty(s,t[s])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[n,s]of t)this.elementProperties.set(n,s)}this._$Eh=new Map;for(const[t,n]of this.elementProperties){const s=this._$Eu(t,n);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const s of n)t.unshift(vt(s))}else e!==void 0&&t.push(vt(e));return t}static _$Eu(e,t){const n=t.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var e;this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),(e=this.constructor.l)==null||e.forEach(t=>t(this))}addController(e){var t;(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&((t=e.hostConnected)==null||t.call(e))}removeController(e){var t;(t=this._$EO)==null||t.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return E(e,this.constructor.elementStyles),e}connectedCallback(){var e;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$EO)==null||e.forEach(t=>{var n;return(n=t.hostConnected)==null?void 0:n.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$EO)==null||e.forEach(t=>{var n;return(n=t.hostDisconnected)==null?void 0:n.call(t)})}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){var r;const n=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,n);if(s!==void 0&&n.reflect===!0){const o=(((r=n.converter)==null?void 0:r.toAttribute)!==void 0?n.converter:Mt).toAttribute(t,n.type);this._$Em=e,o==null?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(e,t){var r,o;const n=this.constructor,s=n._$Eh.get(e);if(s!==void 0&&this._$Em!==s){const a=n.getPropertyOptions(s),l=typeof a.converter=="function"?{fromAttribute:a.converter}:((r=a.converter)==null?void 0:r.fromAttribute)!==void 0?a.converter:Mt;this._$Em=s;const c=l.fromAttribute(t,a.type);this[s]=c??((o=this._$Ej)==null?void 0:o.get(s))??c,this._$Em=null}}requestUpdate(e,t,n,s=!1,r){var o;if(e!==void 0){const a=this.constructor;if(s===!1&&(r=this[e]),n??(n=a.getPropertyOptions(e)),!((n.hasChanged??se)(r,t)||n.useDefault&&n.reflect&&r===((o=this._$Ej)==null?void 0:o.get(e))&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:s,wrapped:r},o){n&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,o??t??this[e]),r!==!0||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var n;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[r,o]of this._$Ep)this[r]=o;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[r,o]of s){const{wrapped:a}=o,l=this[r];a!==!0||this._$AL.has(r)||l===void 0||this.C(r,void 0,o,l)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),(n=this._$EO)==null||n.forEach(s=>{var r;return(r=s.hostUpdate)==null?void 0:r.call(s)}),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){var t;(t=this._$EO)==null||t.forEach(n=>{var s;return(s=n.hostUpdated)==null?void 0:s.call(n)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(t=>this._$ET(t,this[t]))),this._$EM()}updated(e){}firstUpdated(e){}};yt.elementStyles=[],yt.shadowRootOptions={mode:"open"},yt[Et("elementProperties")]=new Map,yt[Et("finalized")]=new Map,ie==null||ie({ReactiveElement:yt}),(J.reactiveElementVersions??(J.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ct=globalThis,Ee=i=>i,jt=Ct.trustedTypes,Ce=jt?jt.createPolicy("lit-html",{createHTML:i=>i}):void 0,Te="$lit$",ot=`lit$${Math.random().toFixed(9).slice(2)}$`,Pe="?"+ot,gi=`<${Pe}>`,ct=document,Tt=()=>ct.createComment(""),Pt=i=>i===null||typeof i!="object"&&typeof i!="function",re=Array.isArray,bi=i=>re(i)||typeof(i==null?void 0:i[Symbol.iterator])=="function",oe=`[ 	
\f\r]`,It=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ie=/-->/g,De=/>/g,ht=RegExp(`>|${oe}(?:([^\\s"'>=/]+)(${oe}*=${oe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Oe=/'/g,Ve=/"/g,Re=/^(?:script|style|textarea|title)$/i,mi=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),y=mi(1),pt=Symbol.for("lit-noChange"),V=Symbol.for("lit-nothing"),ze=new WeakMap,dt=ct.createTreeWalker(ct,129);function Ne(i,e){if(!re(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ce!==void 0?Ce.createHTML(e):e}const vi=(i,e)=>{const t=i.length-1,n=[];let s,r=e===2?"<svg>":e===3?"<math>":"",o=It;for(let a=0;a<t;a++){const l=i[a];let c,p,h=-1,u=0;for(;u<l.length&&(o.lastIndex=u,p=o.exec(l),p!==null);)u=o.lastIndex,o===It?p[1]==="!--"?o=Ie:p[1]!==void 0?o=De:p[2]!==void 0?(Re.test(p[2])&&(s=RegExp("</"+p[2],"g")),o=ht):p[3]!==void 0&&(o=ht):o===ht?p[0]===">"?(o=s??It,h=-1):p[1]===void 0?h=-2:(h=o.lastIndex-p[2].length,c=p[1],o=p[3]===void 0?ht:p[3]==='"'?Ve:Oe):o===Ve||o===Oe?o=ht:o===Ie||o===De?o=It:(o=ht,s=void 0);const b=o===ht&&i[a+1].startsWith("/>")?" ":"";r+=o===It?l+gi:h>=0?(n.push(c),l.slice(0,h)+Te+l.slice(h)+ot+b):l+ot+(h===-2?a:b)}return[Ne(i,r+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]};class Dt{constructor({strings:e,_$litType$:t},n){let s;this.parts=[];let r=0,o=0;const a=e.length-1,l=this.parts,[c,p]=vi(e,t);if(this.el=Dt.createElement(c,n),dt.currentNode=this.el.content,t===2||t===3){const h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(s=dt.nextNode())!==null&&l.length<a;){if(s.nodeType===1){if(s.hasAttributes())for(const h of s.getAttributeNames())if(h.endsWith(Te)){const u=p[o++],b=s.getAttribute(h).split(ot),S=/([.?@])?(.*)/.exec(u);l.push({type:1,index:r,name:S[2],strings:b,ctor:S[1]==="."?wi:S[1]==="?"?xi:S[1]==="@"?$i:Ht}),s.removeAttribute(h)}else h.startsWith(ot)&&(l.push({type:6,index:r}),s.removeAttribute(h));if(Re.test(s.tagName)){const h=s.textContent.split(ot),u=h.length-1;if(u>0){s.textContent=jt?jt.emptyScript:"";for(let b=0;b<u;b++)s.append(h[b],Tt()),dt.nextNode(),l.push({type:2,index:++r});s.append(h[u],Tt())}}}else if(s.nodeType===8)if(s.data===Pe)l.push({type:2,index:r});else{let h=-1;for(;(h=s.data.indexOf(ot,h+1))!==-1;)l.push({type:7,index:r}),h+=ot.length-1}r++}}static createElement(e,t){const n=ct.createElement("template");return n.innerHTML=e,n}}function wt(i,e,t=i,n){var o,a;if(e===pt)return e;let s=n!==void 0?(o=t._$Co)==null?void 0:o[n]:t._$Cl;const r=Pt(e)?void 0:e._$litDirective$;return(s==null?void 0:s.constructor)!==r&&((a=s==null?void 0:s._$AO)==null||a.call(s,!1),r===void 0?s=void 0:(s=new r(i),s._$AT(i,t,n)),n!==void 0?(t._$Co??(t._$Co=[]))[n]=s:t._$Cl=s),s!==void 0&&(e=wt(i,s._$AS(i,e.values),s,n)),e}class yi{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:n}=this._$AD,s=((e==null?void 0:e.creationScope)??ct).importNode(t,!0);dt.currentNode=s;let r=dt.nextNode(),o=0,a=0,l=n[0];for(;l!==void 0;){if(o===l.index){let c;l.type===2?c=new Ot(r,r.nextSibling,this,e):l.type===1?c=new l.ctor(r,l.name,l.strings,this,e):l.type===6&&(c=new Si(r,this,e)),this._$AV.push(c),l=n[++a]}o!==(l==null?void 0:l.index)&&(r=dt.nextNode(),o++)}return dt.currentNode=ct,s}p(e){let t=0;for(const n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}}class Ot{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,t,n,s){this.type=2,this._$AH=V,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=s,this._$Cv=(s==null?void 0:s.isConnected)??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=wt(this,e,t),Pt(e)?e===V||e==null||e===""?(this._$AH!==V&&this._$AR(),this._$AH=V):e!==this._$AH&&e!==pt&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):bi(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==V&&Pt(this._$AH)?this._$AA.nextSibling.data=e:this.T(ct.createTextNode(e)),this._$AH=e}$(e){var r;const{values:t,_$litType$:n}=e,s=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=Dt.createElement(Ne(n.h,n.h[0]),this.options)),n);if(((r=this._$AH)==null?void 0:r._$AD)===s)this._$AH.p(t);else{const o=new yi(s,this),a=o.u(this.options);o.p(t),this.T(a),this._$AH=o}}_$AC(e){let t=ze.get(e.strings);return t===void 0&&ze.set(e.strings,t=new Dt(e)),t}k(e){re(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let n,s=0;for(const r of e)s===t.length?t.push(n=new Ot(this.O(Tt()),this.O(Tt()),this,this.options)):n=t[s],n._$AI(r),s++;s<t.length&&(this._$AR(n&&n._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){var n;for((n=this._$AP)==null?void 0:n.call(this,!1,!0,t);e!==this._$AB;){const s=Ee(e).nextSibling;Ee(e).remove(),e=s}}setConnected(e){var t;this._$AM===void 0&&(this._$Cv=e,(t=this._$AP)==null||t.call(this,e))}}class Ht{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,s,r){this.type=1,this._$AH=V,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=V}_$AI(e,t=this,n,s){const r=this.strings;let o=!1;if(r===void 0)e=wt(this,e,t,0),o=!Pt(e)||e!==this._$AH&&e!==pt,o&&(this._$AH=e);else{const a=e;let l,c;for(e=r[0],l=0;l<r.length-1;l++)c=wt(this,a[n+l],t,l),c===pt&&(c=this._$AH[l]),o||(o=!Pt(c)||c!==this._$AH[l]),c===V?e=V:e!==V&&(e+=(c??"")+r[l+1]),this._$AH[l]=c}o&&!s&&this.j(e)}j(e){e===V?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class wi extends Ht{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===V?void 0:e}}class xi extends Ht{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==V)}}class $i extends Ht{constructor(e,t,n,s,r){super(e,t,n,s,r),this.type=5}_$AI(e,t=this){if((e=wt(this,e,t,0)??V)===pt)return;const n=this._$AH,s=e===V&&n!==V||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,r=e!==V&&(n===V||s);s&&this.element.removeEventListener(this.name,this,n),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t;typeof this._$AH=="function"?this._$AH.call(((t=this.options)==null?void 0:t.host)??this.element,e):this._$AH.handleEvent(e)}}class Si{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){wt(this,e)}}const ae=Ct.litHtmlPolyfillSupport;ae==null||ae(Dt,Ot),(Ct.litHtmlVersions??(Ct.litHtmlVersions=[])).push("3.3.2");const ki=(i,e,t)=>{const n=(t==null?void 0:t.renderBefore)??e;let s=n._$litPart$;if(s===void 0){const r=(t==null?void 0:t.renderBefore)??null;n._$litPart$=s=new Ot(e.insertBefore(Tt(),r),r,void 0,t??{})}return s._$AI(i),s};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ut=globalThis;let at=class extends yt{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t;const e=super.createRenderRoot();return(t=this.renderOptions).renderBefore??(t.renderBefore=e.firstChild),e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=ki(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)==null||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)==null||e.setConnected(!1)}render(){return pt}};at._$litElement$=!0,at.finalized=!0,(_n=ut.litElementHydrateSupport)==null||_n.call(ut,{LitElement:at});const le=ut.litElementPolyfillSupport;le==null||le({LitElement:at}),(ut.litElementVersions??(ut.litElementVersions=[])).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ce=i=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(i,e)}):customElements.define(i,e)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const _i={attribute:!0,type:String,converter:Mt,reflect:!1,hasChanged:se},Ai=(i=_i,e,t)=>{const{kind:n,metadata:s}=t;let r=globalThis.litPropertyMetadata.get(s);if(r===void 0&&globalThis.litPropertyMetadata.set(s,r=new Map),n==="setter"&&((i=Object.create(i)).wrapped=!0),r.set(t.name,i),n==="accessor"){const{name:o}=t;return{set(a){const l=e.get.call(this);e.set.call(this,a),this.requestUpdate(o,l,i,!0,a)},init(a){return a!==void 0&&this.C(o,void 0,i,a),a}}}if(n==="setter"){const{name:o}=t;return function(a){const l=this[o];e.call(this,a),this.requestUpdate(o,l,i,!0,a)}}throw Error("Unsupported decorator location: "+n)};function Z(i){return(e,t)=>typeof t=="object"?Ai(i,e,t):((n,s,r)=>{const o=s.hasOwnProperty(r);return s.constructor.createProperty(r,n),o?Object.getOwnPropertyDescriptor(s,r):void 0})(i,e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function I(i){return Z({...i,state:!0,attribute:!1})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Ei(i){return(e,t)=>{const n=typeof e=="function"?e:e[t];Object.assign(n,i)}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Le={ATTRIBUTE:1,CHILD:2},Be=i=>(...e)=>({_$litDirective$:i,values:e});class Fe{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const he=Be(class extends Fe{constructor(i){var e;if(super(i),i.type!==Le.ATTRIBUTE||i.name!=="class"||((e=i.strings)==null?void 0:e.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(i){return" "+Object.keys(i).filter(e=>i[e]).join(" ")+" "}update(i,[e]){var n,s;if(this.st===void 0){this.st=new Set,i.strings!==void 0&&(this.nt=new Set(i.strings.join(" ").split(/\s/).filter(r=>r!=="")));for(const r in e)e[r]&&!((n=this.nt)!=null&&n.has(r))&&this.st.add(r);return this.render(e)}const t=i.element.classList;for(const r of this.st)r in e||(t.remove(r),this.st.delete(r));for(const r in e){const o=!!e[r];o===this.st.has(r)||(s=this.nt)!=null&&s.has(r)||(o?(t.add(r),this.st.add(r)):(t.remove(r),this.st.delete(r)))}return pt}});/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ci=i=>i.strings===void 0;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Vt=(i,e)=>{var n;const t=i._$AN;if(t===void 0)return!1;for(const s of t)(n=s._$AO)==null||n.call(s,e,!1),Vt(s,e);return!0},qt=i=>{let e,t;do{if((e=i._$AM)===void 0)break;t=e._$AN,t.delete(i),i=e}while((t==null?void 0:t.size)===0)},Ue=i=>{for(let e;e=i._$AM;i=e){let t=e._$AN;if(t===void 0)e._$AN=t=new Set;else if(t.has(i))break;t.add(i),Ii(e)}};function Ti(i){this._$AN!==void 0?(qt(this),this._$AM=i,Ue(this)):this._$AM=i}function Pi(i,e=!1,t=0){const n=this._$AH,s=this._$AN;if(s!==void 0&&s.size!==0)if(e)if(Array.isArray(n))for(let r=t;r<n.length;r++)Vt(n[r],!1),qt(n[r]);else n!=null&&(Vt(n,!1),qt(n));else Vt(this,i)}const Ii=i=>{i.type==Le.CHILD&&(i._$AP??(i._$AP=Pi),i._$AQ??(i._$AQ=Ti))};class Di extends Fe{constructor(){super(...arguments),this._$AN=void 0}_$AT(e,t,n){super._$AT(e,t,n),Ue(this),this.isConnected=e._$AU}_$AO(e,t=!0){var n,s;e!==this.isConnected&&(this.isConnected=e,e?(n=this.reconnected)==null||n.call(this):(s=this.disconnected)==null||s.call(this)),t&&(Vt(this,e),qt(this))}setValue(e){if(Ci(this._$Ct))this._$Ct._$AI(e,this);else{const t=[...this._$Ct._$AH];t[this._$Ci]=e,this._$Ct._$AI(t,this,0)}}disconnected(){}reconnected(){}}/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Gt=()=>new Oi;class Oi{}const pe=new WeakMap,Rt=Be(class extends Di{render(i){return V}update(i,[e]){var n;const t=e!==this.G;return t&&this.G!==void 0&&this.rt(void 0),(t||this.lt!==this.ct)&&(this.G=e,this.ht=(n=i.options)==null?void 0:n.host,this.rt(this.ct=i.element)),V}rt(i){if(this.isConnected||(i=void 0),typeof this.G=="function"){const e=this.ht??globalThis;let t=pe.get(e);t===void 0&&(t=new WeakMap,pe.set(e,t)),t.get(this.G)!==void 0&&this.G.call(this.ht,void 0),t.set(this.G,i),i!==void 0&&this.G.call(this.ht,i)}else this.G.value=i}get lt(){var i,e;return typeof this.G=="function"?(i=pe.get(this.ht??globalThis))==null?void 0:i.get(this.G):(e=this.G)==null?void 0:e.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}}),Yt="GraphQL Client",Me=0,je=3,He="An error occurred while fetching from the API. Review 'graphQLErrors' for details.",qe="Response returned unexpected Content-Type:",Ge="An unknown error has occurred. The API did not return a data object or any errors in its response.",de={json:"application/json",multipart:"multipart/mixed"},Ye="X-SDK-Variant",Xe="X-SDK-Version",Vi="shopify-graphql-client",Ri="1.4.1",We=1e3,zi=[429,503],Qe=/@(defer)\b/i,Ke=`\r
`,Ni=/boundary="?([^=";]+)"?/i,Je=Ke+Ke;function lt(i,e=Yt){return i.startsWith(`${e}`)?i:`${e}: ${i}`}function xt(i){return i instanceof Error?i.message:JSON.stringify(i)}function Ze(i){return i instanceof Error&&i.cause?i.cause:void 0}function tn(i){return i.flatMap(({errors:e})=>e??[])}function en({client:i,retries:e}){if(e!==void 0&&(typeof e!="number"||e<Me||e>je))throw new Error(`${i}: The provided "retries" value (${e}) is invalid - it cannot be less than ${Me} or greater than ${je}`)}function X(i,e){return e&&(typeof e!="object"||Array.isArray(e)||typeof e=="object"&&Object.keys(e).length>0)?{[i]:e}:{}}function nn(i,e){if(i.length===0)return e;const n={[i.pop()]:e};return i.length===0?n:nn(i,n)}function sn(i,e){return Object.keys(e||{}).reduce((t,n)=>(typeof e[n]=="object"||Array.isArray(e[n]))&&i[n]?(t[n]=sn(i[n],e[n]),t):(t[n]=e[n],t),Array.isArray(i)?[...i]:{...i})}function rn([i,...e]){return e.reduce(sn,{...i})}function Li({clientLogger:i,customFetchApi:e=fetch,client:t=Yt,defaultRetryWaitTime:n=We,retriableCodes:s=zi}){const r=async(o,a,l)=>{const c=a+1,p=l+1;let h;try{if(h=await e(...o),i({type:"HTTP-Response",content:{requestParams:o,response:h}}),!h.ok&&s.includes(h.status)&&c<=p)throw new Error;const u=(h==null?void 0:h.headers.get("X-Shopify-API-Deprecated-Reason"))||"";return u&&i({type:"HTTP-Response-GraphQL-Deprecation-Notice",content:{requestParams:o,deprecationNotice:u}}),h}catch(u){if(c<=p){const b=h==null?void 0:h.headers.get("Retry-After");return await Bi(b?parseInt(b,10):n),i({type:"HTTP-Retry",content:{requestParams:o,lastResponse:h,retryAttempt:a,maxRetries:l}}),r(o,c,l)}throw new Error(lt(`${l>0?`Attempted maximum number of ${l} network retries. Last message - `:""}${xt(u)}`,t))}};return r}async function Bi(i){return new Promise(e=>setTimeout(e,i))}function Fi({headers:i,url:e,customFetchApi:t=fetch,retries:n=0,logger:s}){en({client:Yt,retries:n});const r={headers:i,url:e,retries:n},o=Ui(s),a=Li({customFetchApi:t,clientLogger:o,defaultRetryWaitTime:We}),l=Mi(a,r),c=ji(l),p=Qi(l);return{config:r,fetch:l,request:c,requestStream:p}}function Ui(i){return e=>{i&&i(e)}}async function on(i){const{errors:e,data:t,extensions:n}=await i.json();return{...X("data",t),...X("extensions",n),headers:i.headers,...e||!t?{errors:{networkStatusCode:i.status,message:lt(e?He:Ge),...X("graphQLErrors",e),response:i}}:{}}}function Mi(i,{url:e,headers:t,retries:n}){return async(s,r={})=>{const{variables:o,headers:a,url:l,retries:c,keepalive:p,signal:h}=r,u=JSON.stringify({query:s,variables:o});en({client:Yt,retries:c});const b=Object.entries({...t,...a}).reduce((w,[P,C])=>(w[P]=Array.isArray(C)?C.join(", "):C.toString(),w),{});return!b[Ye]&&!b[Xe]&&(b[Ye]=Vi,b[Xe]=Ri),i([l??e,{method:"POST",headers:b,body:u,signal:h,keepalive:p}],1,c??n)}}function ji(i){return async(...e)=>{if(Qe.test(e[0]))throw new Error(lt("This operation will result in a streamable response - use requestStream() instead."));let t=null;try{t=await i(...e);const{status:n,statusText:s}=t,r=t.headers.get("content-type")||"";return t.ok?r.includes(de.json)?await on(t):{errors:{networkStatusCode:n,message:lt(`${qe} ${r}`),response:t}}:{errors:{networkStatusCode:n,message:lt(s),response:t}}}catch(n){return{errors:{message:xt(n),...t==null?{}:{networkStatusCode:t.status,response:t}}}}}}async function*Hi(i){const e=new TextDecoder;if(i.body[Symbol.asyncIterator])for await(const t of i.body)yield e.decode(t);else{const t=i.body.getReader();let n;try{for(;!(n=await t.read()).done;)yield e.decode(n.value)}finally{t.cancel()}}}function qi(i,e){return{async*[Symbol.asyncIterator](){try{let t="";for await(const n of i)if(t+=n,t.indexOf(e)>-1){const s=t.lastIndexOf(e),o=t.slice(0,s).split(e).filter(a=>a.trim().length>0).map(a=>a.slice(a.indexOf(Je)+Je.length).trim());o.length>0&&(yield o),t=t.slice(s+e.length),t.trim()==="--"&&(t="")}}catch(t){throw new Error(`Error occured while processing stream payload - ${xt(t)}`)}}}}function Gi(i){return{async*[Symbol.asyncIterator](){yield{...await on(i),hasNext:!1}}}}function Yi(i){return i.map(e=>{try{return JSON.parse(e)}catch(t){throw new Error(`Error in parsing multipart response - ${xt(t)}`)}}).map(e=>{const{data:t,incremental:n,hasNext:s,extensions:r,errors:o}=e;if(!n)return{data:t||{},...X("errors",o),...X("extensions",r),hasNext:s};const a=n.map(({data:l,path:c,errors:p})=>({data:l&&c?nn(c,l):{},...X("errors",p)}));return{data:a.length===1?a[0].data:rn([...a.map(({data:l})=>l)]),...X("errors",tn(a)),hasNext:s}})}function Xi(i,e){if(i.length>0)throw new Error(He,{cause:{graphQLErrors:i}});if(Object.keys(e).length===0)throw new Error(Ge)}function Wi(i,e){var a,l;const t=(e??"").match(Ni),n=`--${t?t[1]:"-"}`;if(!((a=i.body)!=null&&a.getReader)&&!((l=i.body)!=null&&l[Symbol.asyncIterator]))throw new Error("API multipart response did not return an iterable body",{cause:i});const s=Hi(i);let r={},o;return{async*[Symbol.asyncIterator](){var c;try{let p=!0;for await(const h of qi(s,n)){const u=Yi(h);o=((c=u.find(S=>S.extensions))==null?void 0:c.extensions)??o;const b=tn(u);r=rn([r,...u.map(({data:S})=>S)]),p=u.slice(-1)[0].hasNext,Xi(b,r),yield{...X("data",r),...X("extensions",o),hasNext:p}}if(p)throw new Error("Response stream terminated unexpectedly")}catch(p){const h=Ze(p);yield{...X("data",r),...X("extensions",o),errors:{message:lt(xt(p)),networkStatusCode:i.status,...X("graphQLErrors",h==null?void 0:h.graphQLErrors),response:i},hasNext:!1}}}}}function Qi(i){return async(...e)=>{if(!Qe.test(e[0]))throw new Error(lt("This operation does not result in a streamable response - use request() instead."));try{const t=await i(...e),{statusText:n}=t;if(!t.ok)throw new Error(n,{cause:t});const s=t.headers.get("content-type")||"";switch(!0){case s.includes(de.json):return Gi(t);case s.includes(de.multipart):return Wi(t,s);default:throw new Error(`${qe} ${s}`,{cause:t})}}catch(t){return{async*[Symbol.asyncIterator](){const n=Ze(t);yield{errors:{message:lt(xt(t)),...X("networkStatusCode",n==null?void 0:n.status),...X("response",n)},hasNext:!1}}}}}}function Ki({client:i,storeDomain:e}){try{const t=e.trim(),n=t.match(/^https?:/)?t:`https://${t}`,s=new URL(n);return s.protocol="https",s.origin}catch(t){throw new Error(`${i}: a valid store domain ("${e}") must be provided`,{cause:t})}}function an({client:i,currentSupportedApiVersions:e,apiVersion:t,logger:n}){const s=`${i}: the provided apiVersion ("${t}")`,r=`Currently supported API versions: ${e.join(", ")}`;if(!t||typeof t!="string")throw new Error(`${s} is invalid. ${r}`);const o=t.trim();e.includes(o)||(n?n({type:"Unsupported_Api_Version",content:{apiVersion:t,supportedApiVersions:e}}):console.warn(`${s} is likely deprecated or not supported. ${r}`))}function Xt(i){const e=i*3-2;return e===10?e:`0${e}`}function ue(i,e,t){const n=e-t;return n<=0?`${i-1}-${Xt(n+4)}`:`${i}-${Xt(n)}`}function Ji(){const i=new Date,e=i.getUTCMonth(),t=i.getUTCFullYear(),n=Math.floor(e/3+1);return{year:t,quarter:n,version:`${t}-${Xt(n)}`}}function Zi(){const{year:i,quarter:e,version:t}=Ji(),n=e===4?`${i+1}-01`:`${i}-${Xt(e+1)}`;return[ue(i,e,3),ue(i,e,2),ue(i,e,1),t,n,"unstable"]}function ts(i){return e=>({...e??{},...i.headers})}function es({getHeaders:i,getApiUrl:e}){return(t,n)=>{const s=[t];if(n&&Object.keys(n).length>0){const{variables:r,apiVersion:o,headers:a,retries:l,signal:c}=n;s.push({...r?{variables:r}:{},...a?{headers:i(a)}:{},...o?{url:e(o)}:{},...l?{retries:l}:{},...c?{signal:c}:{}})}return s}}const ln="application/json",ns="storefront-api-client",is="1.0.9",ss="X-Shopify-Storefront-Access-Token",rs="X-SDK-Variant",os="X-SDK-Version",as="X-SDK-Variant-Source",Wt="Storefront API Client";function ls(i){if(i&&typeof window<"u")throw new Error(`${Wt}: private access tokens and headers should only be used in a server-to-server implementation. Use the public API access token in nonserver environments.`)}function cs(i,e){if(e)throw new Error(`${Wt}: only provide either a public or private access token`)}function hs({storeDomain:i,apiVersion:e,publicAccessToken:t,privateAccessToken:n,clientName:s,retries:r=0,customFetchApi:o,logger:a}){const l=Zi(),c=Ki({client:Wt,storeDomain:i}),p={client:Wt,currentSupportedApiVersions:l,logger:a};an({...p,apiVersion:e}),cs(t,n),ls(n);const h=ps(c,e,p),u={storeDomain:c,apiVersion:e,publicAccessToken:t,headers:{"Content-Type":ln,Accept:ln,[rs]:ns,[os]:is,...s?{[as]:s}:{},[ss]:t},apiUrl:h(),clientName:s},b=Fi({headers:u.headers,url:u.apiUrl,retries:r,customFetchApi:o,logger:a}),S=ts(u),w=ds(u,h),P=es({getHeaders:S,getApiUrl:w});return Object.freeze({config:u,getHeaders:S,getApiUrl:w,fetch:(..._)=>b.fetch(...P(..._)),request:(..._)=>b.request(...P(..._)),requestStream:(..._)=>b.requestStream(...P(..._))})}function ps(i,e,t){return n=>{n&&an({...t,apiVersion:n});const s=(n??e).trim();return`${i}/api/${s}/graphql.json`}}function ds(i,e){return t=>t?e(t):i.apiUrl}const cn=hs({storeDomain:"https://belt-master-belts.myshopify.com",apiVersion:"2025-10",publicAccessToken:"150be8d747708199c1f1b33ab7ab43bb",retries:2}),us=`
  query ProductQuery($query: String!, $after: String) {
    products(first: 20, query: $query, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
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
`;async function M(i,{after:e,prefetchImages:t}={prefetchImages:!0}){const n=await cn.request(us,{variables:{query:i,after:e??null}});if(n.errors)throw new Error(JSON.stringify(n.errors));if(t){const o=n.data.products.edges.flatMap(({node:a})=>a.images.edges.map(({node:l})=>l));await Promise.all(o.map(async a=>{const l=new Image;l.src=a.url;try{await l.decode()}catch(c){console.debug(c,a.url)}}))}const s=n.data.products.pageInfo,r=n.data.products.edges.map(({node:o})=>{var a;return{id:o.id,title:o.title,tags:o.tags,collections:(((a=o.collections)==null?void 0:a.edges)??[]).map(({node:l})=>({id:l.id,title:l.title,handle:l.handle})),images:o.images.edges.map(({node:l})=>l),priceRange:o.priceRange,variants:o.variants.edges.map(({node:l})=>({id:l.id,title:l.title,sku:l.sku,image:l.image,price:l.price,compareAtPrice:l.compareAtPrice,selectedOptions:l.selectedOptions,availableForSale:l.availableForSale,quantityAvailable:l.quantityAvailable}))}});return{page:s,products:r}}function D(i,e,{fallbackToFirst:t=!0}={}){const n=i.images??[];if(!n.length)return null;const s=n[e]??(t?n[0]:null);return(s==null?void 0:s.url)??null}const fs=`
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
`;function zt(i,e){if(!i)throw new Error("Missing variantId for cart line.");return{merchandiseId:i,quantity:e}}async function gs(i){var r,o;const e=await cn.request(fs,{variables:{input:{lines:i}}});if(e.errors)throw new Error(`Storefront API errors: ${JSON.stringify(e.errors)}`);const t=(r=e.data)==null?void 0:r.cartCreate,n=(t==null?void 0:t.userErrors)??[];if(n.length)throw new Error(`cartCreate userErrors: ${JSON.stringify(n)}`);const s=(o=t==null?void 0:t.cart)==null?void 0:o.checkoutUrl;if(!s)throw new Error("cartCreate returned no checkoutUrl.");return s}const bs=`/* Application-specific styles. */
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
`,ms=`/** BeltMaster theme styles for common elements and components. */
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
`;rt`${nt(bs)}`;const hn=rt`${nt(ms)}`;function vs(i,e,t,n,s,r){return y`
    <div>
      <div class="option text-only ${(r==null?void 0:r.class)??""}" @click="${r==null?void 0:r.onClick}">
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
  `}function pn(i,e,t,n,s,r,o){o||(o={});const a=o.class??"",l=o.selected?" selected":"";o.class=`${a} ${l}`.trim();const c=!!o.count&&o.count>0;return y`
    <span
      class="option thumbnail ${o.class??""}"
      data-kind="${t}"
      data-is-set="${o.isSet?"true":"false"}"
      @click="${o.onClick}"
    >
      <input
        id="${i}"
        class="sr-only"
        type="${o.type??"radio"}"
        name="${t}"
        value="${n}"
      />
      <label for="${i}">
        <div class="selection-indicator-wrapper ${o.class??""}">
          <img
            class="thumbnail selection-indicator"
            src="${e}"
            alt="${s}"
            width="160"
            height="160"
          />
          ${c?y`
              <span class="option-count">x${o.count}</span>
            `:null}
        </div>
        <span class="label">${s}</span>
        ${r?y`
            <span class="price">${f(r)}</span>
          `:null}
      </label>

      ${o.popup??null}
    </span>
  `}Bn=[ce("belt-checkout")];class j extends(Ln=at,Nn=[Z({type:String})],zn=[Z({type:String})],Rn=[Z({type:String})],Vn=[Z({type:String})],On=[Z({type:String})],Dn=[Z({type:String})],In=[Z({type:Array})],Pn=[Z({type:Array})],Tn=[I()],Cn=[I()],En=[I()],An=[I()],Ln){constructor(){super(...arguments);m(this,"base",d(x,8,this)),d(x,11,this);m(this,"buckle",d(x,12,this)),d(x,15,this);m(this,"tip",d(x,16,this)),d(x,19,this);m(this,"baseVariantId",d(x,20,this)),d(x,23,this);m(this,"buckleVariantId",d(x,24,this)),d(x,27,this);m(this,"tipVariantId",d(x,28,this)),d(x,31,this);m(this,"loopsVariantIds",d(x,32,this,[])),d(x,35,this);m(this,"conchosVariantIds",d(x,36,this,[])),d(x,39,this);m(this,"beltData",d(x,40,this,[])),d(x,43,this);m(this,"loops",d(x,44,this,[])),d(x,47,this);m(this,"conchos",d(x,48,this,[])),d(x,51,this);m(this,"isCheckingOut",d(x,52,this,!1)),d(x,55,this)}render(){const[t,n,s,r,o]=this.beltData,a=t.find(A=>A.id===this.base),l=n.find(A=>A.id===this.buckle),c=dn(this.loops),p=dn(this.conchos),h=A=>((A==null?void 0:A.tags)??[]).some(H=>H.toLowerCase()==="set"),u=(A,H,Lt,Rs)=>{const zs=h(A);return pn(A.id,D(A,0),H,A.id,A.title,A.priceRange.minVariantPrice,{class:["summary",`kind-${H}`,zs?"set":""].filter(Boolean).join(" "),onClick:()=>this.gotoStep(Lt),count:Rs})},b=Array.from(c.values()).map(({product:A,count:H})=>u(A,"loop",3,H)),S=Array.from(p.values()).map(({product:A,count:H})=>u(A,"concho",4,H)),w=o.find(A=>A.id===this.tip)??null,P=w?fe(w,this.tipVariantId):null,C=a?fe(a,this.baseVariantId):null,_=l?fe(l,this.buckleVariantId):null;if(!C||!_)return;const F=C?Qt(C.price.amount):0,G=_?Qt(_.price.amount):0,tt=P?Qt(P.price.amount):0,O=ys(this.beltData),et=Kt(this.loopsVariantIds).reduce((A,{variantId:H,count:Lt})=>A+(O.get(H)??0)*Lt,0),ft=Kt(this.conchosVariantIds).reduce((A,{variantId:H,count:Lt})=>A+(O.get(H)??0)*Lt,0),gt=(F+G+tt+et+ft).toFixed(2),bt=(C==null?void 0:C.price.currencyCode)??(a==null?void 0:a.priceRange.minVariantPrice.currencyCode)??"en-US";return y`
      <div class="row wrap gap-medium">
        ${a?u(a,"base",0):null}
        ${l?u(l,"buckle",2):null}
        ${b}
        ${S}
        ${w?u(w,"beltTip",5):null}
      </div>
      <div id="checkoutTotal">
        Total: <span class="price">${f({amount:gt,currencyCode:bt})}</span>
      </div>
      <button
        class="btn primary"
        ?disabled=${this.isCheckingOut}
        @click=${()=>this.checkoutNow()}
      >
        ${this.isCheckingOut?"Sending to checkout...":"Checkout"}
      </button>
    `}gotoStep(t){this.dispatchEvent(new CustomEvent("step-change",{detail:t,bubbles:!1,composed:!0}))}async checkoutNow(){if(!this.isCheckingOut){this.isCheckingOut=!0;try{if(!this.baseVariantId)throw new Error("Missing baseVariantId");if(!this.buckleVariantId)throw new Error("Missing buckleVariantId");const t=(this.loopsVariantIds??[]).filter(Boolean),n=(this.conchosVariantIds??[]).filter(Boolean),s=[zt(this.baseVariantId,1),zt(this.buckleVariantId,1),...this.tipVariantId?[zt(this.tipVariantId,1)]:[],...Kt(t).map(({variantId:o,count:a})=>zt(o,a)),...Kt(n).map(({variantId:o,count:a})=>zt(o,a))],r=await gs(s);self.location.assign(r)}finally{this.isCheckingOut=!1}}}}x=ee(Ln),$(x,5,"base",Nn,j),$(x,5,"buckle",zn,j),$(x,5,"tip",Rn,j),$(x,5,"baseVariantId",Vn,j),$(x,5,"buckleVariantId",On,j),$(x,5,"tipVariantId",Dn,j),$(x,5,"loopsVariantIds",In,j),$(x,5,"conchosVariantIds",Pn,j),$(x,5,"beltData",Tn,j),$(x,5,"loops",Cn,j),$(x,5,"conchos",En,j),$(x,5,"isCheckingOut",An,j),j=$(x,0,"BeltCheckout",Bn,j),m(j,"styles",rt`
    ${hn}
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--gap-small);
    }
    img {
      max-width: 100%;
      max-height: 200px;
    }`),d(x,1,j);function dn(i){const e=new Map;for(const t of i){const n=e.get(t.id);n?n.count+=1:e.set(t.id,{product:t,count:1})}return e}function Qt(i){const e=Number.parseFloat(i);if(Number.isNaN(e))throw new Error(`Invalid money amount: ${i}`);return e}function fe(i,e){return e?i.variants.find(t=>t.id===e)??null:null}function Kt(i){const e=new Map;for(const t of i)e.set(t,(e.get(t)??0)+1);return Array.from(e.entries()).map(([t,n])=>({variantId:t,count:n}))}function ys(i){const e=new Map;for(const t of i)for(const n of t)for(const s of n.variants)e.set(s.id,Qt(s.price.amount));return e}async function ws(i,e,t){const n=typeof OffscreenCanvas<"u"?new OffscreenCanvas(e,t):Object.assign(document.createElement("canvas"),{width:e,height:t}),s=n.getContext("2d");v(s,"Could not create a canvas context!");const r=i instanceof ImageBitmap?i:await createImageBitmap(i);s.clearRect(0,0,e,t),s.drawImage(r,0,0);const o=s.getImageData(0,0,e,t);let a=t,l=e,c=-1,p=-1;const h=o.data;for(let S=0;S<t;S++)for(let w=0;w<e;w++)h[(S*e+w)*4+3]!==0&&(w<l&&(l=w),w>c&&(c=w),S<a&&(a=S),S>p&&(p=S));if(c<l||p<a)return r;const u=c-l+1,b=p-a+1;return await createImageBitmap(n,l,a,u,b)}Gn=[ce("belt-preview")];class it extends(qn=at,Hn=[Z({type:String})],jn=[Z({type:String})],Mn=[Z({type:String})],Un=[I()],Fn=[I()],qn){constructor(){super(...arguments);m(this,"base",d(B,8,this,null)),d(B,11,this);m(this,"buckle",d(B,12,this,null)),d(B,15,this);m(this,"tip",d(B,16,this,null)),d(B,19,this);m(this,"loops",d(B,20,this,[])),d(B,23,this);m(this,"conchos",d(B,24,this,[])),d(B,27,this);_e(this,$t,null);m(this,"draggingLoopIndex",null);m(this,"draggingConchoIndex",null)}updated(t){t.has("base")&&this.renderBeltBase()}willUpdate(t){t.has("base")&&this.base&&un(this.base)}render(){return y`
      <canvas
        id="base"
        aria-hidden="true"
        ${Rt(t=>{t&&(k(t,HTMLCanvasElement),mt(this,$t,t),queueMicrotask(()=>this.renderBeltBase()))})}
      ></canvas>
      <img id="buckle" class="center-vertically" src=${this.buckle??""} aria-hidden="true" />
      <div id="loops" class="center-vertically">
        ${this.loops.map((t,n)=>y`
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
                @click=${s=>this.handleRemoveClick("loop",n,s)}
                aria-label="Remove loop"
              ></button>
              <img class="loop" src=${t} aria-hidden="true" />
            </div>
          `)}
      </div>
      <div id="conchosList" class="center-vertically">
        ${this.conchos.map((t,n)=>y`
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
                @click=${s=>this.handleRemoveClick("concho",n,s)}
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
    `}async renderBeltBase(){console.debug("renderBeltBase()",{hasCanvas:!!R(this,$t),base:this.base});const t=R(this,$t);if(!(!t||!this.base))try{const n=await un(this.base),s=await ws(n,n.naturalWidth,n.naturalHeight),r=s.height/s.width;await new Promise(requestAnimationFrame);const o=Math.floor(t.getBoundingClientRect().width)||1,a=Math.max(1,Math.round(o*r)),l=self.devicePixelRatio||1;t.width=Math.round(o*l),t.height=Math.round(a*l);const c=t.getContext("2d");v(c,"Could not acquire 2D canvas context!"),c.clearRect(0,0,o,a),c.drawImage(s,0,0,o*l,a*l)}catch(n){console.error("renderBeltBase failed:",n)}}onLoopDragStart(t){const n=t.currentTarget;!n||!t.dataTransfer||(this.draggingLoopIndex=Number(n.dataset.index),t.dataTransfer.setData("text/plain","loop"),t.dataTransfer.effectAllowed="move",n.classList.add("dragging"),this.createDragImageFrom(n,t))}onLoopDragOver(t){t.preventDefault()}onLoopDrop(t){t.preventDefault();const n=t.currentTarget;if(!n)return;const s=this.draggingLoopIndex,r=Number(n.dataset.index);if(s==null||s===r)return;const o=[...this.loops],[a]=o.splice(s,1);o.splice(r,0,a),this.loops=o,this.dispatchEvent(new CustomEvent("reorder-loops",{detail:{fromIndex:s,toIndex:r},bubbles:!0,composed:!0})),this.draggingLoopIndex=null}onLoopDragEnd(t){const n=t.currentTarget;n&&n.classList.remove("dragging"),this.draggingLoopIndex=null}onConchoDragStart(t){const n=t.currentTarget;!n||!t.dataTransfer||(this.draggingConchoIndex=Number(n.dataset.index),t.dataTransfer.setData("text/plain","concho"),t.dataTransfer.effectAllowed="move",n.classList.add("dragging"),this.createDragImageFrom(n,t))}onConchoDragOver(t){t.preventDefault()}onConchoDrop(t){t.preventDefault();const n=t.currentTarget;if(!n)return;const s=this.draggingConchoIndex,r=Number(n.dataset.index);if(s==null||s===r)return;const o=[...this.conchos],[a]=o.splice(s,1);o.splice(r,0,a),this.conchos=o,this.dispatchEvent(new CustomEvent("reorder-conchos",{detail:{fromIndex:s,toIndex:r},bubbles:!0,composed:!0})),this.draggingConchoIndex=null}onConchoDragEnd(t){const n=t.currentTarget;n&&n.classList.remove("dragging"),this.draggingConchoIndex=null}createDragImageFrom(t,n){if(!n.dataTransfer)return;const s=t.querySelector("img");if(!s)return;const r=s.getBoundingClientRect(),o=1.2,a=s.cloneNode(!0);a.style.opacity="0.85",a.style.pointerEvents="none",a.style.position="absolute",a.style.top="-9999px",a.style.left="-9999px";const l=r.width*o,c=r.height*o;a.style.width=`${l}px`,a.style.height=`${c}px`,document.body.appendChild(a),n.dataTransfer.setDragImage(a,l/2,c/2),requestAnimationFrame(()=>{a.parentNode&&a.parentNode.removeChild(a)})}handleRemoveClick(t,n,s){s.preventDefault(),s.stopPropagation(),this.dispatchEvent(new CustomEvent(`remove-${t}`,{detail:{index:n},bubbles:!0,composed:!0}))}}B=ee(qn),$t=new WeakMap,$(B,5,"base",Hn,it),$(B,5,"buckle",jn,it),$(B,5,"tip",Mn,it),$(B,5,"loops",Un,it),$(B,5,"conchos",Fn,it),it=$(B,0,"BeltPreview",Gn,it),m(it,"styles",rt`
    ${hn}

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
  `),d(B,1,it);const ge={};async function un(i){return Object.keys(ge).includes(i)?await ge[i]:ge[i]=new Promise((e,t)=>{const n=new Image;n.crossOrigin="anonymous",n.src=i,n.decode().then(()=>e(n)).catch(t)})}var be=function(i,e){return be=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,n){t.__proto__=n}||function(t,n){for(var s in n)Object.prototype.hasOwnProperty.call(n,s)&&(t[s]=n[s])},be(i,e)};function Nt(i,e){if(typeof e!="function"&&e!==null)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");be(i,e);function t(){this.constructor=i}i.prototype=e===null?Object.create(e):(t.prototype=e.prototype,new t)}function me(i){var e=typeof Symbol=="function"&&Symbol.iterator,t=e&&i[e],n=0;if(t)return t.call(i);if(i&&typeof i.length=="number")return{next:function(){return i&&n>=i.length&&(i=void 0),{value:i&&i[n++],done:!i}}};throw new TypeError(e?"Object is not iterable.":"Symbol.iterator is not defined.")}function ve(i,e){var t=typeof Symbol=="function"&&i[Symbol.iterator];if(!t)return i;var n=t.call(i),s,r=[],o;try{for(;(e===void 0||e-- >0)&&!(s=n.next()).done;)r.push(s.value)}catch(a){o={error:a}}finally{try{s&&!s.done&&(t=n.return)&&t.call(n)}finally{if(o)throw o.error}}return r}function ye(i,e,t){if(t||arguments.length===2)for(var n=0,s=e.length,r;n<s;n++)(r||!(n in e))&&(r||(r=Array.prototype.slice.call(e,0,n)),r[n]=e[n]);return i.concat(r||Array.prototype.slice.call(e))}typeof SuppressedError=="function"&&SuppressedError;function st(i){return typeof i=="function"}function fn(i){var e=function(n){Error.call(n),n.stack=new Error().stack},t=i(e);return t.prototype=Object.create(Error.prototype),t.prototype.constructor=t,t}var we=fn(function(i){return function(t){i(this),this.message=t?t.length+` errors occurred during unsubscription:
`+t.map(function(n,s){return s+1+") "+n.toString()}).join(`
  `):"",this.name="UnsubscriptionError",this.errors=t}});function xe(i,e){if(i){var t=i.indexOf(e);0<=t&&i.splice(t,1)}}var Jt=(function(){function i(e){this.initialTeardown=e,this.closed=!1,this._parentage=null,this._finalizers=null}return i.prototype.unsubscribe=function(){var e,t,n,s,r;if(!this.closed){this.closed=!0;var o=this._parentage;if(o)if(this._parentage=null,Array.isArray(o))try{for(var a=me(o),l=a.next();!l.done;l=a.next()){var c=l.value;c.remove(this)}}catch(w){e={error:w}}finally{try{l&&!l.done&&(t=a.return)&&t.call(a)}finally{if(e)throw e.error}}else o.remove(this);var p=this.initialTeardown;if(st(p))try{p()}catch(w){r=w instanceof we?w.errors:[w]}var h=this._finalizers;if(h){this._finalizers=null;try{for(var u=me(h),b=u.next();!b.done;b=u.next()){var S=b.value;try{mn(S)}catch(w){r=r??[],w instanceof we?r=ye(ye([],ve(r)),ve(w.errors)):r.push(w)}}}catch(w){n={error:w}}finally{try{b&&!b.done&&(s=u.return)&&s.call(u)}finally{if(n)throw n.error}}}if(r)throw new we(r)}},i.prototype.add=function(e){var t;if(e&&e!==this)if(this.closed)mn(e);else{if(e instanceof i){if(e.closed||e._hasParent(this))return;e._addParent(this)}(this._finalizers=(t=this._finalizers)!==null&&t!==void 0?t:[]).push(e)}},i.prototype._hasParent=function(e){var t=this._parentage;return t===e||Array.isArray(t)&&t.includes(e)},i.prototype._addParent=function(e){var t=this._parentage;this._parentage=Array.isArray(t)?(t.push(e),t):t?[t,e]:e},i.prototype._removeParent=function(e){var t=this._parentage;t===e?this._parentage=null:Array.isArray(t)&&xe(t,e)},i.prototype.remove=function(e){var t=this._finalizers;t&&xe(t,e),e instanceof i&&e._removeParent(this)},i.EMPTY=(function(){var e=new i;return e.closed=!0,e})(),i})(),gn=Jt.EMPTY;function bn(i){return i instanceof Jt||i&&"closed"in i&&st(i.remove)&&st(i.add)&&st(i.unsubscribe)}function mn(i){st(i)?i():i.unsubscribe()}var xs={Promise:void 0},$s={setTimeout:function(i,e){for(var t=[],n=2;n<arguments.length;n++)t[n-2]=arguments[n];return setTimeout.apply(void 0,ye([i,e],ve(t)))},clearTimeout:function(i){return clearTimeout(i)},delegate:void 0};function Ss(i){$s.setTimeout(function(){throw i})}function vn(){}function Zt(i){i()}var yn=(function(i){Nt(e,i);function e(t){var n=i.call(this)||this;return n.isStopped=!1,t?(n.destination=t,bn(t)&&t.add(n)):n.destination=As,n}return e.create=function(t,n,s){return new $e(t,n,s)},e.prototype.next=function(t){this.isStopped||this._next(t)},e.prototype.error=function(t){this.isStopped||(this.isStopped=!0,this._error(t))},e.prototype.complete=function(){this.isStopped||(this.isStopped=!0,this._complete())},e.prototype.unsubscribe=function(){this.closed||(this.isStopped=!0,i.prototype.unsubscribe.call(this),this.destination=null)},e.prototype._next=function(t){this.destination.next(t)},e.prototype._error=function(t){try{this.destination.error(t)}finally{this.unsubscribe()}},e.prototype._complete=function(){try{this.destination.complete()}finally{this.unsubscribe()}},e})(Jt),ks=(function(){function i(e){this.partialObserver=e}return i.prototype.next=function(e){var t=this.partialObserver;if(t.next)try{t.next(e)}catch(n){te(n)}},i.prototype.error=function(e){var t=this.partialObserver;if(t.error)try{t.error(e)}catch(n){te(n)}else te(e)},i.prototype.complete=function(){var e=this.partialObserver;if(e.complete)try{e.complete()}catch(t){te(t)}},i})(),$e=(function(i){Nt(e,i);function e(t,n,s){var r=i.call(this)||this,o;return st(t)||!t?o={next:t??void 0,error:n??void 0,complete:s??void 0}:o=t,r.destination=new ks(o),r}return e})(yn);function te(i){Ss(i)}function _s(i){throw i}var As={closed:!0,next:vn,error:_s,complete:vn},Es=(function(){return typeof Symbol=="function"&&Symbol.observable||"@@observable"})();function Cs(i){return i}function Ts(i){return i.length===0?Cs:i.length===1?i[0]:function(t){return i.reduce(function(n,s){return s(n)},t)}}var wn=(function(){function i(e){e&&(this._subscribe=e)}return i.prototype.lift=function(e){var t=new i;return t.source=this,t.operator=e,t},i.prototype.subscribe=function(e,t,n){var s=this,r=Is(e)?e:new $e(e,t,n);return Zt(function(){var o=s,a=o.operator,l=o.source;r.add(a?a.call(r,l):l?s._subscribe(r):s._trySubscribe(r))}),r},i.prototype._trySubscribe=function(e){try{return this._subscribe(e)}catch(t){e.error(t)}},i.prototype.forEach=function(e,t){var n=this;return t=xn(t),new t(function(s,r){var o=new $e({next:function(a){try{e(a)}catch(l){r(l),o.unsubscribe()}},error:r,complete:s});n.subscribe(o)})},i.prototype._subscribe=function(e){var t;return(t=this.source)===null||t===void 0?void 0:t.subscribe(e)},i.prototype[Es]=function(){return this},i.prototype.pipe=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];return Ts(e)(this)},i.prototype.toPromise=function(e){var t=this;return e=xn(e),new e(function(n,s){var r;t.subscribe(function(o){return r=o},function(o){return s(o)},function(){return n(r)})})},i.create=function(e){return new i(e)},i})();function xn(i){var e;return(e=i??xs.Promise)!==null&&e!==void 0?e:Promise}function Ps(i){return i&&st(i.next)&&st(i.error)&&st(i.complete)}function Is(i){return i&&i instanceof yn||Ps(i)&&bn(i)}var Ds=fn(function(i){return function(){i(this),this.name="ObjectUnsubscribedError",this.message="object unsubscribed"}}),$n=(function(i){Nt(e,i);function e(){var t=i.call(this)||this;return t.closed=!1,t.currentObservers=null,t.observers=[],t.isStopped=!1,t.hasError=!1,t.thrownError=null,t}return e.prototype.lift=function(t){var n=new Sn(this,this);return n.operator=t,n},e.prototype._throwIfClosed=function(){if(this.closed)throw new Ds},e.prototype.next=function(t){var n=this;Zt(function(){var s,r;if(n._throwIfClosed(),!n.isStopped){n.currentObservers||(n.currentObservers=Array.from(n.observers));try{for(var o=me(n.currentObservers),a=o.next();!a.done;a=o.next()){var l=a.value;l.next(t)}}catch(c){s={error:c}}finally{try{a&&!a.done&&(r=o.return)&&r.call(o)}finally{if(s)throw s.error}}}})},e.prototype.error=function(t){var n=this;Zt(function(){if(n._throwIfClosed(),!n.isStopped){n.hasError=n.isStopped=!0,n.thrownError=t;for(var s=n.observers;s.length;)s.shift().error(t)}})},e.prototype.complete=function(){var t=this;Zt(function(){if(t._throwIfClosed(),!t.isStopped){t.isStopped=!0;for(var n=t.observers;n.length;)n.shift().complete()}})},e.prototype.unsubscribe=function(){this.isStopped=this.closed=!0,this.observers=this.currentObservers=null},Object.defineProperty(e.prototype,"observed",{get:function(){var t;return((t=this.observers)===null||t===void 0?void 0:t.length)>0},enumerable:!1,configurable:!0}),e.prototype._trySubscribe=function(t){return this._throwIfClosed(),i.prototype._trySubscribe.call(this,t)},e.prototype._subscribe=function(t){return this._throwIfClosed(),this._checkFinalizedStatuses(t),this._innerSubscribe(t)},e.prototype._innerSubscribe=function(t){var n=this,s=this,r=s.hasError,o=s.isStopped,a=s.observers;return r||o?gn:(this.currentObservers=null,a.push(t),new Jt(function(){n.currentObservers=null,xe(a,t)}))},e.prototype._checkFinalizedStatuses=function(t){var n=this,s=n.hasError,r=n.thrownError,o=n.isStopped;s?t.error(r):o&&t.complete()},e.prototype.asObservable=function(){var t=new wn;return t.source=this,t},e.create=function(t,n){return new Sn(t,n)},e})(wn),Sn=(function(i){Nt(e,i);function e(t,n){var s=i.call(this)||this;return s.destination=t,s.source=n,s}return e.prototype.next=function(t){var n,s;(s=(n=this.destination)===null||n===void 0?void 0:n.next)===null||s===void 0||s.call(n,t)},e.prototype.error=function(t){var n,s;(s=(n=this.destination)===null||n===void 0?void 0:n.error)===null||s===void 0||s.call(n,t)},e.prototype.complete=function(){var t,n;(n=(t=this.destination)===null||t===void 0?void 0:t.complete)===null||n===void 0||n.call(t)},e.prototype._subscribe=function(t){var n,s;return(s=(n=this.source)===null||n===void 0?void 0:n.subscribe(t))!==null&&s!==void 0?s:gn},e})($n),Os=(function(i){Nt(e,i);function e(t){var n=i.call(this)||this;return n._value=t,n}return Object.defineProperty(e.prototype,"value",{get:function(){return this.getValue()},enumerable:!1,configurable:!0}),e.prototype._subscribe=function(t){var n=i.prototype._subscribe.call(this,t);return!n.closed&&t.next(this._value),n},e.prototype.getValue=function(){var t=this,n=t.hasError,s=t.thrownError,r=t._value;if(n)throw s;return this._throwIfClosed(),r},e.prototype.next=function(t){i.prototype.next.call(this,this._value=t)},e})($n);function kn(i){return i instanceof at?y`
      ${i}
    `:typeof i=="function"?i():i}class Vs{constructor(e=[]){_e(this,L,0);m(this,"changed",new Os(R(this,L)));this.steps=e}get stepIndex(){return R(this,L)}get hasNextStep(){return R(this,L)<this.steps.length-1}get hasPreviousStep(){return R(this,L)>0}get length(){return this.steps.length}get currentStep(){return this.steps[R(this,L)]}get previousStep(){if(!this.hasPreviousStep)throw new Error("Cannot access step before the first!");return this.steps[R(this,L)-1]}get nextStep(){if(!this.hasNextStep)throw new Error("Cannot access step after the last!");return this.steps[R(this,L)+1]}get currentView(){return kn(this.steps[R(this,L)].view)}next(){v(R(this,L)<this.steps.length-1,"Cannot advance past the last step!"),mt(this,L,R(this,L)+1),this.changed.next(R(this,L))}previous(){v(R(this,L)>0,"Cannot go back past the first step!"),mt(this,L,R(this,L)-1),this.changed.next(R(this,L))}goTo(e){v(e<=this.steps.length-1,"Cannot advance past the last step!"),v(e>=0,"Cannot go back past the first step!"),mt(this,L,e),this.changed.next(R(this,L)),typeof window<"u"&&typeof window.scrollTo=="function"&&window.scrollTo({top:0,left:0,behavior:"smooth"})}find(e){return this.steps.find(t=>t.id===e)}}L=new WeakMap,hi=[ce("belt-wizard")];class N extends(ci=at,li=[I()],ai=[I()],oi=[I()],ri=[I()],si=[I()],ii=[I()],ni=[I()],ei=[I()],ti=[I()],Zn=[I()],Jn=[I()],Kn=[I()],Qn=[I()],Wn=[I()],Xn=[I()],Yn=[Ei({once:!0})],ci){constructor(){super();d(g,5,this);m(this,"selection",null);m(this,"form",Gt());m(this,"preview",Gt());m(this,"checkout",Gt());m(this,"filterWrap",Gt());m(this,"shouldAdvance",!1);m(this,"pages",[]);m(this,"beltData",[]);m(this,"loading",d(g,8,this,!1)),d(g,11,this);m(this,"loadingPage",d(g,12,this,!1)),d(g,15,this);m(this,"beltBase",d(g,16,this,null)),d(g,19,this);m(this,"beltBuckle",d(g,20,this,null)),d(g,23,this);m(this,"beltLoops",d(g,24,this,[])),d(g,27,this);m(this,"beltConchos",d(g,28,this,[])),d(g,31,this);m(this,"beltTip",d(g,32,this,null)),d(g,35,this);m(this,"buckleChoices",d(g,36,this,[])),d(g,39,this);m(this,"buckleVariantImage",d(g,40,this,null)),d(g,43,this);m(this,"firstBaseSelected",d(g,44,this,!1)),d(g,47,this);m(this,"activeVariantKey",d(g,48,this,null)),d(g,51,this);m(this,"showBuckleSets",d(g,52,this,!0)),d(g,55,this);m(this,"showCollectionFilter",d(g,56,this,!1)),d(g,59,this);m(this,"collectionFilters",d(g,60,this,{})),d(g,63,this);m(this,"variantSelection",new Map);m(this,"infiniteScrollObserver",new IntersectionObserver(t=>{var s;(((s=document.querySelector("belt-wizard"))==null?void 0:s.hasAttribute("hidden"))??!0)||t.some(r=>r.isIntersecting)&&!this.loadingPage&&this.loadNextPage()}));m(this,"onGlobalPointerDown",t=>{if(!this.showCollectionFilter)return;const n=this.filterWrap.value,s=t.target;n&&s&&!n.contains(s)&&(this.showCollectionFilter=!1)});m(this,"onGlobalKeyDown",t=>{this.showCollectionFilter&&t.key==="Escape"&&(this.showCollectionFilter=!1)});m(this,"wizard",d(g,64,this,new Vs([{id:"base",title:"Select a Belt Base",shortcut:()=>{var t;return this.multiSelectShortcut("Select a Belt Base",((t=this.selection)==null?void 0:t.has("base"))??!1)},view:y`
        <div class="row wrap gap-medium"></div>
      `},{id:"size",title:"What is your waist size?",subtitle:"We will add 3” to meet your perfect fit belt size",view:y`
        <div class="row wrap gap-medium"></div>
        <img
          id="sizingChart"
          src="/assets/belts/sizing-chart.png"
          alt="Perfect belt sizing chart"
        />
      `,background:{image:"url(/assets/belts/looped-belt.png)",size:{default:"50vw",desktop:"33vw"}}},{id:"buckle",title:"Choose a Belt Buckle",view:y`
        <div class="row wrap gap-medium"></div>
      `},{id:"loops",title:"Add Belt Loops",shortcut:()=>{var t;return this.multiSelectShortcut("No Belt Loops",((t=this.selection)==null?void 0:t.has("loop"))||!1)},view:y`
        <div class="row wrap gap-medium"></div>
      `},{id:"conchos",title:"Add Conchos",subtitle:"Drag and drop conchos to style your belt",shortcut:()=>{var t;return this.multiSelectShortcut("No Conchos",((t=this.selection)==null?void 0:t.has("concho"))||!1)},view:y`
        <div class="row wrap gap-medium"></div>
      `},{id:"tip",title:"Choose a Belt Tip",shortcut:()=>{var t;return this.multiSelectShortcut("No Belt Tip",((t=this.selection)==null?void 0:t.has("tip"))||!1)},view:y`
        <div class="row wrap gap-medium"></div>
      `},{id:"summary",title:"Your Belt",subtitle:"Here's your chosen belt.",shortcut:()=>y`
          <button type="button" class="btn primary" @click="${()=>this.triggerCheckoutFromShortcut()}">
            Checkout
          </button>
        `,view:()=>{var s,r,o;const t=[];this.beltBase||t.push({label:"Belt base",stepId:0}),this.beltBuckle||t.push({label:"Buckle",stepId:2}),this.beltLoops.length===0&&!this.hasSetSelected()&&t.push({label:"Belt loop",stepId:3});const n=t.length>0;return y`
          <div class="summary-header">
            <h2 class="heading-5">Selections</h2>

            ${n?y`
                <div class="summary-warning">
                  <p>Your belt is missing:</p>
                  <ul>
                    ${t.map(a=>y`
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
            ${Rt(this.checkout)}
            base="${(s=this.beltBase)==null?void 0:s.id}"
            buckle="${(r=this.beltBuckle)==null?void 0:r.id}"
            tip="${(o=this.beltTip)==null?void 0:o.id}"
            @step-change="${({detail:a})=>this.wizard.goTo(a)}"
          >
          </belt-checkout>
        `}}]))),d(g,67,this);this.wizard.changed.subscribe(()=>this.requestUpdate()),this.updateProducts()}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),this.infiniteScrollObserver.observe(document.getElementById("scrollToken"))}disconnectedCallback(){super.disconnectedCallback(),this.infiniteScrollObserver.disconnect()}getVariantKey(t,n){return`${t}:${n}`}isSetProduct(t){var n;return!!((n=t==null?void 0:t.tags)!=null&&n.some(s=>s.toLowerCase()==="set"))}hasSetSelected(){return this.isSetProduct(this.beltBuckle)}shouldShowCollectionFilter(t){return t==="buckle"||t==="loops"||t==="conchos"||t==="tip"}getFilterStepKey(t){return t==="buckle"?"buckle":t==="loops"?"loops":t==="conchos"?"conchos":t==="tip"?"tip":null}getProductsForStep(t){const[n,s,r,o,a]=this.beltData;if(t==="buckle"){let l=this.buckleChoices??[];return this.showBuckleSets||(l=l.filter(c=>!this.isSetProduct(c))),l}return t==="loops"?r??[]:t==="conchos"?o??[]:t==="tip"?a??[]:[]}getAllCollectionsForStep(t){var r;const n=this.getProductsForStep(t),s=new Set;for(const o of n)((r=o.collections)!=null&&r.length?o.collections.map(l=>l.title):["Other"]).forEach(l=>s.add(l));return Array.from(s).sort((o,a)=>o.localeCompare(a))}getSelectedCollectionsForStep(t){const n=this.getFilterStepKey(t);return n?this.collectionFilters[n]??[]:[]}toggleCollectionFilter(t,n){const s=this.getFilterStepKey(t);if(!s)return;const r=new Set(this.collectionFilters[s]??[]);r.has(n)?r.delete(n):r.add(n),this.collectionFilters={...this.collectionFilters,[s]:Array.from(r)}}filterProductsBySelectedCollections(t,n){const s=this.getSelectedCollectionsForStep(t);if(!s.length)return n;const r=new Set(s);return n.filter(o=>{var l;return((l=o.collections)!=null&&l.length?o.collections.map(c=>c.title):["Other"]).some(c=>r.has(c))})}rebuildStepForFilter(t){if(t==="buckle"){this.buildSingleSelectStep("buckle",this.buckleChoices);return}if(t==="loops"){this.buildMultiSelectStep("loop",this.beltData[2]??[],2);return}if(t==="conchos"){this.buildMultiSelectStep("concho",this.beltData[3]??[],9);return}if(t==="tip"){this.buildSingleSelectStep("tip",this.beltData[4]??[]);return}}advanceWizard(){const t=this.hasSetSelected(),n=this.wizard.steps;let s=this.wizard.stepIndex+1;for(;s<n.length;){const r=n[s].id;if(t&&(r==="loops"||r==="tip")){s++;continue}break}s<n.length&&this.wizard.goTo(s)}reorderArray(t,n,s){const r=[...t],[o]=r.splice(n,1);return r.splice(s,0,o),r}groupProductsByCollection(t,n){var r,o;const s=new Map;for(const a of t){if(n!=null&&n.hideSets&&((r=a.tags)!=null&&r.some(c=>c.toLowerCase()==="set")))continue;const l=(o=a.collections)!=null&&o.length?a.collections.map(c=>c.title):["Other"];for(const c of l)s.has(c)||s.set(c,[]),s.get(c).push(a)}return s}handleScroll(){document.documentElement.scrollHeight,document.body.scrollTop}handleReorder(t,n,s){n!==s&&(t==="loop"?(this.beltLoops=this.reorderArray(this.beltLoops,n,s),this.reorderFormDataMulti("loop",n,s)):(this.beltConchos=this.reorderArray(this.beltConchos,n,s),this.reorderFormDataMulti("concho",n,s)),this.applySelectionToPreview())}reorderFormDataMulti(t,n,s){if(!this.selection)return;const r=this.selection.getAll(t),o=this.selection.getAll(`${t}Variant`);if(n<0||n>=r.length||s<0||s>=r.length)return;for(;o.length<r.length;)o.push("");const a=this.reorderArray(r,n,s),l=this.reorderArray(o,n,s);this.selection.delete(t),this.selection.delete(`${t}Variant`),a.forEach(c=>this.selection.append(t,c)),l.forEach(c=>{c&&this.selection.append(`${t}Variant`,c)})}multiSelectShortcut(t,n){var p;const s=this.wizard.currentStep.id,r=s==="loops",o=s==="conchos",a=s==="tip";let l,c;return r?(l=(((p=this.selection)==null?void 0:p.getAll("loop").length)??0)>=1,c=l?"Continue":"1 loop required"):o||a?(l=!0,c=n?"Continue":t):(l=n,c=n?"Continue":t),y`
      <button class="btn primary" ?disabled="${!l}" @click="${()=>this.submitStep()}">
        ${c}
      </button>
    `}removeItem(t,n){if(!this.selection)return;const s=this.selection.getAll(t),r=`${t}Variant`,o=this.selection.getAll(r);n<0||n>=s.length||(s.splice(n,1),o.length>n&&o.splice(n,1),this.selection.delete(t),s.forEach(a=>this.selection.append(t,a)),this.selection.delete(r),o.forEach(a=>this.selection.append(r,a)),this.applySelectionToPreview())}updated(t){if(this.checkout.value){const n=this.checkout.value;n.beltData=this.beltData,n.loops=this.beltLoops,n.conchos=this.beltConchos,n.baseVariantId=this.getSelectedSingleVariantId("base",this.beltBase),n.buckleVariantId=this.getSelectedSingleVariantId("buckle",this.beltBuckle),n.tipVariantId=this.hasSetSelected()?void 0:this.getSelectedSingleVariantId("tip",this.beltTip),n.loopsVariantIds=this.hasSetSelected()?[]:this.getSelectedMultiVariantIds("loop",2),n.conchosVariantIds=this.getSelectedMultiVariantIds("concho",9)}t.has("showCollectionFilter")&&(this.showCollectionFilter?(self.addEventListener("pointerdown",this.onGlobalPointerDown),self.addEventListener("keydown",this.onGlobalKeyDown)):(self.removeEventListener("pointerdown",this.onGlobalPointerDown),self.removeEventListener("keydown",this.onGlobalKeyDown)))}getSelectedSingleVariantId(t,n){var o,a,l;if(!n)return;const s=((o=this.selection)==null?void 0:o.get(`${t}Variant`))??null;if(s&&n.variants.some(c=>c.id===s))return s;const r=(l=(a=n.variants)==null?void 0:a[0])==null?void 0:l.id;if(!r)throw new Error(`${t} product ${n.id} has no variants`);return r}getSelectedMultiVariantIds(t,n){var o;const s=t==="loop"?this.beltLoops:this.beltConchos,r=((o=this.selection)==null?void 0:o.getAll(`${t}Variant`))??[];return s.slice(0,n).map((a,l)=>{var h,u;const c=r[l];if(c&&a.variants.some(b=>b.id===c))return c;const p=(u=(h=a.variants)==null?void 0:h[0])==null?void 0:u.id;if(!p)throw new Error(`${t} product ${a.id} has no variants`);return p})}render(){if(this.loading)return y`<div>Loading...</div>`;const t=this.wizard.currentStep,n=this.buckleVariantImage??(this.beltBuckle?D(this.beltBuckle,0):void 0),s=this.beltBase?y`
        <section id="preview" class="${he({"preview-enter":this.firstBaseSelected})}">
          <belt-preview
            class="step-${this.wizard.stepIndex}"
            ${Rt(this.preview)}
            base="${D(this.beltBase,1)??D(this.beltBase,0)??""}"
            buckle="${n??""}"
            tip="${this.beltTip?D(this.beltTip,0):void 0}"
            @reorder-loops="${o=>this.handleReorder("loop",o.detail.fromIndex,o.detail.toIndex)}"
            @reorder-conchos="${o=>this.handleReorder("concho",o.detail.fromIndex,o.detail.toIndex)}"
            @remove-loop="${o=>this.removeItem("loop",o.detail.index)}"
            @remove-concho="${o=>this.removeItem("concho",o.detail.index)}"
          >
          </belt-preview>
        </section>
      `:null,r=this.shouldShowCollectionFilter(t.id)?this.renderFilterTools(t.id):null;return y`
      <header>
        <section id="stepper">
          ${this.wizard.steps.map((o,a)=>y`
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
            ${t.subtitle?y`
                <p class="subtitle">${t.subtitle}</p>
              `:null}
          </div>

          ${t.shortcut&&y`
            <div id="stepShortcut">${kn(t.shortcut)}</div>
          `}
        </section>

        ${s} ${r}
      </header>

      <section id="${t.id}" class="${he({step:!0,"step-shifted":this.firstBaseSelected})}">
        <div class="step-content step-enter-${this.wizard.stepIndex}">
          <form
            ${Rt(this.form)}
            @submit="${async o=>{o.preventDefault(),await Y(0),new FormData(this.form.value)}}"
            @formdata="${async({formData:o})=>{this.updateWizardSelection(o),this.shouldAdvance&&(this.shouldAdvance=!1,await Y(500),this.advanceWizard())}}"
          >
            ${this.wizard.currentView}
          </form>
        </div>
      </section>
    `}async submitStep(){var t,n,s;if(this.shouldAdvance=!0,(t=this.form.value)==null||t.requestSubmit(),this.wizard.currentStep.id==="base"){const r=(s=(n=this.beltBase)==null?void 0:n.tags)==null?void 0:s.find(h=>h.endsWith("mm")),o=r?` AND tag:${r}`:"",[{products:a},{products:l},{products:c},{products:p}]=await Promise.all([M(`tag:buckle${o}`),M(`tag:set${o}`),M(`tag:Loop${o}`),M(`tag:tip${o}`)]);this.beltData[1]=this.buckleChoices=[...l,...a],this.beltData[2]=c,this.beltData[4]=p,this.beltData[6]=l,console.debug("Rebuilt buckle, set, loop, and tip steps based on base width:",r),this.buildSingleSelectStep("buckle",this.buckleChoices),this.buildMultiSelectStep("loop",c,2),this.buildSingleSelectStep("tip",p)}}triggerCheckoutFromShortcut(){var r;const t=this.checkout.value;if(!t)return;const n=t;if(typeof n.checkoutNow=="function"){n.checkoutNow();return}const s=(r=t.shadowRoot)==null?void 0:r.querySelector("button.btn.primary");s==null||s.click()}renderFilterTools(t){if(!this.getFilterStepKey(t))return null;const s=new Set(this.getSelectedCollectionsForStep(t)),r=this.getAllCollectionsForStep(t).map(a=>{const l=s.has(a);return y`
        <button
          type="button"
          class="${he({"filter-item":!0,"is-selected":l})}"
          aria-pressed="${l?"true":"false"}"
          @click="${()=>{this.toggleCollectionFilter(t,a),this.rebuildStepForFilter(t),this.requestUpdate()}}"
        >
          <span class="filter-item-title">${a}</span>
        </button>
      `}),o=r.length===0?y`
        <div>No collections found for this step.</div>
      `:y`
        <div class="filter-list" role="listbox" aria-multiselectable="true">
          ${r}
        </div>
      `;return y`
      <div class="step-tools">
        ${t==="buckle"?y`
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

        <div class="filter-wrap" ${Rt(this.filterWrap)}>
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
              ${o}
            </div>
          </div>
        </div>
      </div>
    `}buildSingleSelectStep(t,n){const s=this.wizard.find(t.toString());s.view=()=>{const r=t==="buckle"?"buckle":t,o=t==="buckle"&&!this.showBuckleSets,a=this.filterProductsBySelectedCollections(r,o?n.filter(c=>!this.isSetProduct(c)):n),l=this.groupProductsByCollection(a);return y`
        ${Array.from(l.entries()).map(([c,p])=>y`
              <div>
                <h3 class="collection-title">${c}</h3>
                <div class="row wrap gap-medium">
                  ${p.map(h=>{var C,_;const u=Array.isArray(h.variants)&&h.variants.length>1,b=this.renderVariantPopup(t,h),S=((C=this.selection)==null?void 0:C.get(t))===h.id,w=D(h,0),P=t==="base"?D(h,2,{fallbackToFirst:!1})??D(h,1):null;return y`
                      <span
                        class="option thumbnail ${S?"selected":""}"
                        data-kind="${t}"
                        data-is-set="${t==="buckle"&&this.isSetProduct(h)?"true":"false"}"
                        @click="${this.handleCardClick(t,h,u,()=>{var F;if(this.ensureSelection(),t==="base"){const G=this.getBaseWidthTag(this.beltBase),tt=this.getBaseWidthTag(h);!!this.beltBase&&this.beltBase.id!==h.id&&G!==tt&&this.resetSelectionsForBaseWidthChange()}t==="tip"&&this.hasSetSelected()&&this.resetBuckleLoopsAndTip(),this.selection.set(t,h.id),this.applySelectionToPreview(),t!=="base"?this.submitStep():(this.shouldAdvance=!1,(F=this.form.value)==null||F.requestSubmit())})}"
                      >
                        <input
                          id="${h.id}"
                          class="sr-only"
                          type="radio"
                          name="${t}"
                          value="${h.id}"
                        />
                        <label for="${h.id}">
                          <div class="selection-indicator-wrapper ${S?"selected":""}">
                            <img
                              class="thumbnail selection-indicator"
                              src="${w}"
                              alt="${h.title}"
                              width="160"
                              height="160"
                            />
                            ${P?y`
                                <img
                                  class="hover-image"
                                  src="${P}"
                                  alt="${h.title}"
                                  width="160"
                                  height="160"
                                />
                              `:null}
                          </div>
                          <span class="label">${h.title}</span>
                          ${(_=h.priceRange)!=null&&_.minVariantPrice?y`
                              <span class="price">${f(h.priceRange.minVariantPrice)}</span>
                            `:null}
                        </label>

                        ${b??null}
                      </span>
                    `})}
                </div>
              </div>
            `)}
      `}}buildMultiSelectStep(t,n,s){const r=this.wizard.find(t+"s");r.view=()=>{const o=t==="loop"?"loops":t==="concho"?"conchos":`${t}s`,a=this.filterProductsBySelectedCollections(o,n),l=this.groupProductsByCollection(a);return y`
        ${Array.from(l.entries()).map(([c,p])=>y`
              <div>
                <h3 class="collection-title">${c}</h3>
                <div class="row wrap gap-medium">
                  ${p.map(h=>{var C;const u=(C=this.selection)==null?void 0:C.getAll(t),b=u?u.filter(_=>_===h.id).length:0,S=b>0,w=Array.isArray(h.variants)&&h.variants.length>1,P=this.renderVariantPopup(t,h);return pn(h.id,D(h,0),t,h.id,h.title,h.priceRange.minVariantPrice,{onClick:this.handleCardClick(t,h,w,_=>{_.preventDefault(),this.toggleSelection(t,h.id,s),this.requestUpdate()}),selected:S,count:b,popup:P})})}
                </div>
              </div>
            `)}
      `}}async updateProducts(){this.loading=!0;const[{page:t,products:n},{page:s,products:r},{page:o,products:a},{page:l,products:c},{page:p,products:h},{page:u,products:b},{page:S,products:w}]=await Promise.all([M("tag:Belt Strap"),M("tag:buckle"),M("tag:Loop"),M("tag:concho"),M("tag:tip"),M("tag:size"),M("tag:Set")]);this.pages=[t,s,o,l,p,u,S],this.beltData=[n,r,a,c,h,b,w],this.beltData[1]=this.buckleChoices,this.buildSingleSelectStep("base",n),this.buildSingleSelectStep("buckle",this.buckleChoices=[...w,...r]),this.buildMultiSelectStep("loop",a,2),this.buildMultiSelectStep("concho",c,9),this.buildSingleSelectStep("tip",h);const P=this.wizard.find("size"),C=b[0]??null,_=(C==null?void 0:C.variants)??[];P.view=()=>y`
        <div class="size-step-wrapper">
          <div class="row wrap gap-medium">
            ${_.length===0?y`
                <p>No sizes found. Check the "Size" product variants.</p>
              `:_.map(F=>{const G=F.title.trim(),tt=F.price??null,O=`${G}"`;return vs(`size-${F.id}`,"size",F.id,O,tt,{onClick:this.submitStep})})}
          </div>
          <img
            id="sizingChart"
            src="/assets/belts/sizing-chart.png"
            alt="Perfect belt sizing chart"
          />
        </div>
      `,this.loading=!1}async loadNextPage(){this.loadingPage=!0;let t;switch(console.log("New page ahoy!",this.wizard.currentStep.id),this.wizard.currentStep.id){case"base":if(t=this.pages[0],!t.hasNextPage)break;const{page:n,products:s}=await M("tag:Belt Strap",{after:t.endCursor});this.pages[0]=n,this.beltData[0]=this.beltData[0].concat(s),this.buildSingleSelectStep("base",this.beltData[0]);break;case"buckle":if(t=this.pages[1],!t.hasNextPage)break;const{page:r,products:o}=await M("tag:buckle",{after:t.endCursor});this.pages[1]=r,this.beltData[1]=this.beltData[1].concat(o),this.buildSingleSelectStep("buckle",this.buckleChoices=this.buckleChoices.concat(o));break;case"loops":if(t=this.pages[2],!t.hasNextPage)break;const{page:a,products:l}=await M("tag:Loop",{after:t.endCursor});this.pages[2]=a,this.beltData[2]=this.beltData[2].concat(l),this.buildMultiSelectStep("loop",this.beltData[2],2);break;case"conchos":if(t=this.pages[3],!t.hasNextPage)break;const{page:c,products:p}=await M("tag:concho",{after:t.endCursor});this.pages[3]=c,this.beltData[3]=this.beltData[3].concat(p),this.buildMultiSelectStep("concho",this.beltData[3],9);break;case"tip":if(t=this.pages[4],!t.hasNextPage)break;const{page:h,products:u}=await M("tag:tip",{after:t.endCursor});this.pages[4]=h,this.beltData[4]=this.beltData[4].concat(u),this.buildSingleSelectStep("tip",this.beltData[4]);break}this.loadingPage=!1}ensureSelection(){this.selection||(this.selection=new FormData)}applySelectionToPreview(){var h,u,b,S,w,P,C;const[t,n,s,r,o,a,l]=this.beltData,c=!!this.beltBase;this.beltBase=t.find(_=>_.id===this.selection.get("base"))??null;const p=!!this.beltBase;if(!c&&p&&(this.firstBaseSelected=!0),(h=this.selection)!=null&&h.has("buckle")){const _=this.selection.get("buckle");this.beltBuckle=this.buckleChoices.find(F=>F.id===_)??null}else this.beltBuckle=null;if(this.beltBuckle)if(this.isSetProduct(this.beltBuckle))this.buckleVariantImage=D(this.beltBuckle,1,{fallbackToFirst:!1})??D(this.beltBuckle,0);else if((u=this.selection)!=null&&u.has("buckleVariant")){const _=this.selection.get("buckleVariant"),G=(this.beltBuckle.variants??[]).find(tt=>tt.id===_);this.buckleVariantImage=((b=G==null?void 0:G.image)==null?void 0:b.url)??D(this.beltBuckle,0)}else this.buckleVariantImage=D(this.beltBuckle,0);else this.buckleVariantImage=null;if((S=this.selection)!=null&&S.has("loop")){const _=this.selection.getAll("loop"),F=this.selection.getAll("loopVariant")??[],G=_.slice(0,2),tt=F.slice(0,G.length);this.beltLoops=G.map(O=>s.find(et=>et.id===O)).filter(Boolean),this.preview.value&&(this.preview.value.loops=this.beltLoops.map((O,et)=>{var bt,A;const ft=tt[et],gt=O.variants??[];return ft&&Array.isArray(gt)?(A=(bt=gt.find(H=>H.id===ft))==null?void 0:bt.image)==null?void 0:A.url:D(O,0)}).filter(O=>O!=null))}else this.beltLoops=[],this.preview.value&&(this.preview.value.loops=[]);if((w=this.selection)!=null&&w.has("concho")){const _=this.selection.getAll("concho"),F=this.selection.getAll("conchoVariant")??[],G=_.slice(0,9),tt=F.slice(0,G.length);this.beltConchos=G.map(O=>r.find(et=>et.id===O)).filter(Boolean),this.preview.value&&(this.preview.value.conchos=this.beltConchos.map((O,et)=>{var bt,A;const ft=tt[et],gt=O.variants??[];return ft&&Array.isArray(gt)?(A=(bt=gt.find(H=>H.id===ft))==null?void 0:bt.image)==null?void 0:A.url:D(O,0)}).filter(O=>O!=null))}else this.beltConchos=[],this.preview.value&&(this.preview.value.conchos=[]);if(this.beltTip=o.find(_=>_.id===this.selection.get("tip"))??null,this.beltBuckle&&this.isSetProduct(this.beltBuckle)&&this.preview.value){const _=D(this.beltBuckle,2,{fallbackToFirst:!1}),F=D(this.beltBuckle,3,{fallbackToFirst:!1});(P=this.selection)!=null&&P.has("loop")||(this.preview.value.loops=_?[_]:[]),(C=this.selection)!=null&&C.has("tip")||(this.preview.value.tip=F??null)}this.requestUpdate()}renderVariantPopup(t,n){const s=this.getVariantKey(t,n.id);if(this.activeVariantKey!==s)return null;const r=Array.isArray(n.variants)?n.variants:[];if(r.length<=1)return null;const o=t==="loop"||t==="concho",a=o?this.getVariantCountsForProduct(t,n.id):{},l=!o&&this.selection?this.selection.get(`${t}Variant`):null;return y`
      <div
        class="variant-popup"
        data-kind="${t}"
        @click="${c=>c.stopPropagation()}"
      >
        <div class="variant-popup-grid">
          ${r.map(c=>{var w,P;const p=c.id,h=o?a[p]??0:0,u=o?h>0:l===p,b=o&&h>0,S=((w=c.image)==null?void 0:w.url)??((P=c.image)==null?void 0:P.url)??D(n,0);return y`
              <button
                type="button"
                class="variant-swatch ${u?"is-selected":""}"
                @click="${C=>{C.preventDefault(),C.stopPropagation(),this.handleVariantSelect(t,n,c)}}"
              >
                <img src="${S}" alt="${c.title}" />
                ${b?y`
                    <span class="option-count">x${h}</span>
                  `:null}
              </button>
            `})}
        </div>
      </div>
    `}handleCardClick(t,n,s,r){return o=>{if(s){o.preventDefault(),o.stopPropagation();const a=this.getVariantKey(t,n.id);this.activeVariantKey=this.activeVariantKey===a?null:a,this.requestUpdate();return}r==null||r(o)}}handleVariantSelect(t,n,s){var a,l,c,p;this.ensureSelection();const r=this.getVariantKey(t,n.id);this.variantSelection.set(r,s.id),t==="loop"||t==="concho"?this.selection.append(`${t}Variant`,s.id):this.selection.set(`${t}Variant`,s.id);const o=((a=s.image)==null?void 0:a.url)??((l=s.image)==null?void 0:l.url)??D(n,0);switch(t){case"base":{if(this.selection.set("base",n.id),this.beltBase=n,this.preview.value){const h=((c=s.image)==null?void 0:c.url)??((p=s.image)==null?void 0:p.url)??D(n,1)??D(n,0);this.preview.value.base=h}break}case"buckle":{this.selection.set("buckle",n.id),this.beltBuckle=n,this.preview.value&&(this.preview.value.buckle=o);break}case"tip":{this.hasSetSelected()&&this.resetBuckleLoopsAndTip(),this.selection.set("tip",n.id),this.beltTip=n,this.preview.value&&(this.preview.value.tip=o);break}case"loop":{if(this.hasSetSelected()&&this.resetBuckleLoopsAndTip(),this.getMultiTotal("loop")>=2)break;if(this.selection.append("loop",n.id),this.applySelectionToPreview(),this.preview.value){const u=this.selection.getAll("loop");this.preview.value.loops=u.map(()=>o).filter(b=>b!==null)}break}case"concho":{if(this.getMultiTotal("concho")>=9)break;this.selection.append("concho",n.id),this.applySelectionToPreview();break}}this.activeVariantKey=null,this.requestUpdate(),!(t!=="buckle"&&t!=="tip"&&t!=="base")&&this.submitStep()}getMultiTotal(t){return this.selection?this.selection.getAll(t).length:0}getVariantCountsForProduct(t,n){const s={};if(!this.selection)return s;const r=this.selection.getAll(t),o=this.selection.getAll(`${t}Variant`);return r.forEach((a,l)=>{if(a!==n)return;const c=o[l];c&&(s[c]=(s[c]??0)+1)}),s}toggleSelection(t,n,s){this.ensureSelection(),t==="loop"&&this.hasSetSelected()&&this.resetBuckleLoopsAndTip();let r=this.selection.getAll(t)??[];r=r.filter(a=>a===n).length>=s?r.filter(a=>a!==n):[...r,n],r.length>s&&(r=r.slice(0,s)),this.selection.delete(t),r.forEach(a=>this.selection.append(t,a)),this.applySelectionToPreview()}resetBuckleLoopsAndTip(){if(!this.selection)return;const t=["buckle","buckleVariant","loop","loopVariant","tip","tipVariant"];for(const n of t)this.selection.delete(n);this.beltBuckle=null,this.buckleVariantImage=null,this.beltLoops=[],this.beltTip=null,this.preview.value&&(this.preview.value.buckle="",this.preview.value.loops=[],this.preview.value.tip=null)}getBaseWidthTag(t){var s;return(s=t==null?void 0:t.tags)!=null&&s.length?t.tags.find(r=>r.toLowerCase().endsWith("mm"))??null:null}resetSelectionsForBaseWidthChange(){if(!this.selection)return;const t=["buckle","buckleVariant","loop","loopVariant","concho","conchoVariant","tip","tipVariant"];for(const n of t)this.selection.delete(n);this.beltBuckle=null,this.buckleVariantImage=null,this.beltLoops=[],this.beltConchos=[],this.beltTip=null,this.showCollectionFilter=!1,this.collectionFilters={},this.activeVariantKey=null,this.variantSelection.clear(),this.preview.value&&(this.preview.value.buckle=null,this.preview.value.loops=[],this.preview.value.conchos=[],this.preview.value.tip=null)}updateWizardSelection(t){this.ensureSelection();const n=new Set(["loop","concho"]),s=[...t.entries()];for(const[r]of s)n.has(r)&&this.selection.delete(r);for(const[r,o]of s)n.has(r)?this.selection.append(r,o):this.selection.set(r,o);this.applySelectionToPreview()}}g=ee(ci),$(g,1,"submitStep",Yn,N),$(g,5,"loading",li,N),$(g,5,"loadingPage",ai,N),$(g,5,"beltBase",oi,N),$(g,5,"beltBuckle",ri,N),$(g,5,"beltLoops",si,N),$(g,5,"beltConchos",ii,N),$(g,5,"beltTip",ni,N),$(g,5,"buckleChoices",ei,N),$(g,5,"buckleVariantImage",ti,N),$(g,5,"firstBaseSelected",Zn,N),$(g,5,"activeVariantKey",Jn,N),$(g,5,"showBuckleSets",Kn,N),$(g,5,"showCollectionFilter",Qn,N),$(g,5,"collectionFilters",Wn,N),$(g,5,"wizard",Xn,N),N=$(g,0,"CustomBeltWizard",hi,N),d(g,1,N),document.addEventListener("DOMContentLoaded",()=>{const i=document.querySelector("#getStarted");i==null||i.addEventListener("click",()=>{var e,t;(e=i.parentElement)==null||e.setAttribute("hidden",""),(t=document.querySelector("belt-wizard"))==null||t.removeAttribute("hidden")})})})();
//# sourceMappingURL=belt-wizard-Q8TiV9Ng.js.map
