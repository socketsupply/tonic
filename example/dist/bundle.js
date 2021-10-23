(() => {
  // ../dist/esm/index.js
  "use strict";
  var d = class {
    constructor(t, e, i) {
      this.rawText = t;
      this.templateStrings = e;
      this.unsafe = i;
      this.isTonicTemplate = true;
    }
    valueOf() {
      return this.rawText;
    }
    toString() {
      return this.rawText;
    }
  };
  var s = class extends window.HTMLElement {
    constructor() {
      super();
      this._id = "";
      this._state = {};
      this._props = {};
      this.__props = [];
      this.preventRenderOnReconnect = false;
      this.elements = [];
      this.nodes = [];
      this.pendingReRender = null;
      this._set = (t2, e, i = "") => {
        for (let o of Array.from(t2.querySelectorAll(s._tags))) {
          if (!o.isTonicComponent)
            continue;
          _(o);
          let r = o.getAttribute("id");
          !r || !s._refIds.includes(r) || (s._states[r] = o.state);
        }
        if (e == null)
          this._apply(t2, i);
        else {
          if (e.constructor.name === s.AsyncFunction)
            return e.call(this, this.html, this.props).then((o) => this._apply(t2, o));
          if (e.constructor.name === s.AsyncFunctionGenerator)
            return this._drainIterator(t2, e.call(this));
          e === null ? this._apply(t2, i) : e instanceof Function && this._apply(t2, e.call(this, this.html, this.props) || "");
        }
      };
      this.scheduleReRender = (t2) => this.pendingReRender ? this.pendingReRender : (this.pendingReRender = new Promise((e) => setTimeout(() => {
        if (!this.isInDocument(this.shadowRoot || this))
          return;
        let i = this._set(this.shadowRoot || this, this.render);
        if (this.pendingReRender = null, i && i.then)
          return i.then(() => {
            this.updated?.(t2), e();
          });
        this.updated && this.updated(t2), e();
      }, 0)), this.pendingReRender);
      this.reRender = (t2 = this.props) => {
        let e = { ...this.props };
        return this._props = typeof t2 == "function" ? t2(e) : t2, this.scheduleReRender(e);
      };
      this.handleEvent = (t2) => {
        this[t2.type]?.(t2);
      };
      let t = s._states[super.id];
      delete s._states[super.id], this._state = t || {}, this.preventRenderOnReconnect = false, this.elements = [...Array.from(this.children)], this.elements.__children__ = true, this.nodes = [...Array.from(this.childNodes)], this.nodes.__children__ = true, this._events();
    }
    static _createId() {
      return `tonic${s._index++}`;
    }
    static _splitName(t) {
      return t.match(/[A-Z][a-z0-9]*/g).join("-");
    }
    static _normalizeAttrs(t, e = {}) {
      return [...t].forEach((i) => e[i.name] = i.value), e;
    }
    _checkId() {
      let t = super.id;
      if (!t) {
        let e = this.outerHTML.replace(this.innerHTML, "...");
        throw new Error(`Component: ${e} has no id`);
      }
      return t;
    }
    _events() {
      let t = Object.getOwnPropertyNames(window.HTMLElement.prototype);
      for (let e of this.__props)
        t.indexOf("on" + e) !== -1 && this.addEventListener(e, this);
    }
    _prop(t) {
      let e = this._id, i = `__${e}__${s._createId()}__`;
      return s._data[e] = s._data[e] || {}, s._data[e][i] = t, i;
    }
    _placehold(t) {
      let e = this._id, i = `placehold:${e}:${s._createId()}__`;
      return s._children[e] = s._children[e] || {}, s._children[e][i] = t, i;
    }
    static match(t, e) {
      return t.matches || (t = t.parentElement), t.matches(e) ? t : t.closest(e);
    }
    static getPropertyNames(t) {
      let e = [];
      for (; t && t !== s.prototype; )
        e.push(...Object.getOwnPropertyNames(t)), t = Object.getPrototypeOf(t);
      return e;
    }
    static add(t, e) {
      let i = t instanceof s ? t.constructor.name : t.name;
      if (e || (e = s._splitName(i).toLowerCase()), !(e && e.length > 1))
        throw Error("Mangling. https://bit.ly/2TkJ6zP");
      if (!s.ssr && window.customElements.get(e) && console.warn(`Replacing Tonic.add(${i}, '${e}')`), !("isTonicTemplate" in t)) {
        let r = { [t.name]: class extends s {
        } }[t.name];
        r.prototype.render = t, t = r;
      }
      return t.prototype.__props = s.getPropertyNames(t.prototype), s._reg[e] = t, s._tags = Object.keys(s._reg).join(), window.customElements.define(e, t), t instanceof s && typeof t.stylesheet == "function" && s.registerStyles(t.stylesheet), t;
    }
    static registerStyles(t) {
      if (s._stylesheetRegistry.includes(t))
        return;
      s._stylesheetRegistry.push(t);
      let e = document.createElement("style");
      s.nonce && e.setAttribute("nonce", s.nonce), e.appendChild(document.createTextNode(t())), document.head && document.head.appendChild(e);
    }
    static escape(t) {
      return t.replace(s.ESC, (e) => s.MAP[e]);
    }
    static unsafeRawString(t, e) {
      return new d(t, e, true);
    }
    async _drainIterator(t, e) {
      let i = await e.next();
      if (this._set(t, void 0, i.value), !i.done)
        return this._drainIterator(t, e);
    }
    _apply(t, e) {
      if (typeof e == "string")
        e = s.escape(e);
      else if (e instanceof d)
        e = e.rawText;
      else {
        t.innerHTML = "", t.appendChild(e.cloneNode(true));
        return;
      }
      if (y(e), this.stylesheet && (e = `<style nonce=${s.nonce || ""}>${this.stylesheet()}</style>${e}`), t.innerHTML = e, this.styles) {
        let r = this.styles();
        for (let n of Array.from(t.querySelectorAll("[styles]"))) {
          let c = n.getAttribute("styles");
          if (!!c)
            for (let l of c.split(/\s+/))
              Object.assign(n.style, r[l.trim()]);
        }
      }
      let i = s._children[this._id] || {}, o = (r, n) => {
        if (r.nodeType === 3) {
          let l = r.textContent?.trim() || "";
          i[l] && n(r, i[l], l);
        }
        let c = r.childNodes;
        if (!!c)
          for (let l = 0; l < c.length; l++)
            o(c[l], n);
      };
      o(t, (r, n, c) => {
        for (let l of n)
          r.parentNode?.insertBefore(l, r);
        delete s._children[this._id][c], r.parentNode?.removeChild(r);
      });
    }
    dispatch(t, e = null) {
      let i = { bubbles: true, detail: e };
      this.dispatchEvent(new window.CustomEvent(t, i));
    }
    html(t, ...e) {
      let i = (n) => {
        if (n && n.__children__)
          return this._placehold(n);
        if (n && n.isTonicTemplate)
          return n.rawText;
        switch (Object.prototype.toString.call(n)) {
          case "[object HTMLCollection]":
          case "[object NodeList]":
            return this._placehold([...n]);
          case "[object Array]":
            return n.every((c) => c.isTonicTemplate && !c.unsafe) ? new d(n.join(`
`), null, false) : this._prop(n);
          case "[object Object]":
          case "[object Function]":
            return this._prop(n);
          case "[object NamedNodeMap]":
            return this._prop(s._normalizeAttrs(n));
          case "[object Number]":
            return `${n}__float`;
          case "[object String]":
            return s.escape(n);
          case "[object Boolean]":
            return `${n}__boolean`;
          case "[object Null]":
            return `${n}__null`;
          case "[object HTMLElement]":
            return this._placehold([n]);
        }
        return typeof n == "object" && n && n.nodeType === 1 && typeof n.cloneNode == "function" ? this._placehold([n]) : n;
      }, o = [];
      for (let n = 0; n < t.length - 1; n++)
        o.push(t[n], i(e[n]));
      o.push(t[t.length - 1]);
      let r = o.join("").replace(s.SPREAD, (n, c) => {
        let l = s._data[c.split("__")[1]][c];
        return Object.entries(l).map(([f, h]) => {
          let u = f.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
          return h === true ? u : h ? `${u}="${s.escape(String(h))}"` : "";
        }).filter(Boolean).join(" ");
      });
      return new d(r, t, false);
    }
    connectedCallback() {
      this.root = this.shadowRoot || this, super.id && !s._refIds.includes(super.id) && s._refIds.push(super.id);
      let t = (e) => e.replace(/-(.)/g, (i, o) => o.toUpperCase());
      for (let { name: e, value: i } of Array.from(this.attributes)) {
        let o = t(e), r = i;
        if (this._props[o] = i, /__\w+__\w+__/.test(r)) {
          let { 1: n } = r.split("__");
          this._props[o] = s._data[n][r];
        } else if (/\d+__float/.test(r))
          this._props[o] = parseFloat(r);
        else if (r === "null__null")
          this._props[o] = null;
        else if (/\w+__boolean/.test(r))
          this._props[o] = r.includes("true");
        else if (/placehold:\w+:\w+__/.test(r)) {
          let { 1: n } = r.split(":");
          this._props[o] = s._children[n][r][0];
        }
      }
      if (this._props = Object.assign(this.defaults ? this.defaults() : {}, this._props), this._id = this._id ?? s._createId(), this.willConnect?.(), !!this.isInDocument(this.root)) {
        if (!this.preventRenderOnReconnect) {
          this._source ? this.innerHTML = this._source : this._source = this.innerHTML;
          let e = this._set(this.root, this.render);
          if (e && e.then)
            return e.then(() => this.connected?.());
        }
        this.connected && this.connected();
      }
    }
    isInDocument(t) {
      let e = t.getRootNode();
      return e === document || e.toString() === "[object ShadowRoot]";
    }
    disconnectedCallback() {
      this.disconnected?.(), delete s._data[this._id], delete s._children[this._id];
    }
    get props() {
      return this._props;
    }
    get state() {
      return this._checkId(), this._state;
    }
    set state(t) {
      this._state = (this._checkId(), t);
    }
  };
  var a = s;
  a.isTonicTemplate = true, a._tags = "", a._refIds = [], a._data = {}, a._states = {}, a._children = {}, a._reg = {}, a._stylesheetRegistry = [], a._index = 0, a.SPREAD = /\.\.\.\s?(__\w+__\w+__)/g, a.ESC = /["&'<>`/]/g, a.AsyncFunctionGenerator = async function* () {
  }.constructor.name, a.AsyncFunction = async function() {
  }.constructor.name, a.MAP = { '"': "&quot;", "&": "&amp;", "'": "&#x27;", "<": "&lt;", ">": "&gt;", "`": "&#x60;", "/": "&#x2F;" }, a.ssr = false, a.nonce = Math.random().toString();
  function y(p) {
    if (typeof p != "string")
      throw Error("content is not a string");
  }
  function _(p) {
    if (!p.isTonicComponent)
      throw Error("node is not a tonic component");
  }
  var m = a;

  // src/index.ts
  var ParentComponent = class extends m {
    render() {
      return this.html`
      <div class="parent">
        <span>Hey now:</span>
        ${this.children} 
      </div>
    `;
    }
  };
  m.add(ParentComponent);
  var ChildComponent = class extends m {
    render() {
      return this.html`
      <div class="child">
        ${this.props.value}
      </div>
    `;
    }
  };
  m.add(ChildComponent);
  var TonicDialog = class extends m {
    constructor() {
      super();
      this.show = () => {
        console.log("showing");
        const z = this._getZIndex();
        this.appendChild(this.closeIcon);
        this.removeAttribute("hidden");
        if (this.props.overlay !== "false") {
          const overlay = document.querySelector(".tonic--dialog--overlay");
          overlay.classList.add("tonic--show");
          overlay.style.setProperty("zIndex", z.toString());
        }
        this.style.setProperty("zIndex", (z + 100).toString());
        return new Promise((resolve) => {
          if (this.props.widthMobile && document.body.clientWidth < 500) {
            this.props.width = this.props.widthMobile;
          }
          this.style.width = this.props.width;
          this.style.height = this.props.height;
          const done = () => {
            clearTimeout(timer);
            resolve();
          };
          const timer = setTimeout(done, 512);
          this.addEventListener("animationend", done, { once: true });
          this.classList.remove("tonic--hide");
          this.classList.add("tonic--show");
          this._escapeHandler = (e) => {
            if (e.key === "Escape")
              this.hide();
          };
          document.addEventListener("keyup", this._escapeHandler);
        });
      };
      this.hide = () => {
        const overlay = document.querySelector(".tonic--dialog--overlay");
        overlay.classList.remove("tonic--show");
        overlay.style.setProperty("zIndex", "-1");
        return new Promise((resolve) => {
          this.style.setProperty("zIndex", "-1");
          document.removeEventListener("keyup", this._escapeHandler);
          const done = () => {
            clearTimeout(timer);
            this.setAttribute("hidden", "true");
            resolve();
          };
          const timer = setTimeout(done, 512);
          this.addEventListener("animationend", done, { once: true });
          this.classList.remove("tonic--show");
          this.classList.add("tonic--hide");
        });
      };
      this.classList.add("tonic--dialog");
      this.setAttribute("hidden", "true");
      if (!document.querySelector(".tonic--dialog--overlay")) {
        const div = document.createElement("div");
        div.classList.add("tonic--dialog--overlay");
        div.textContent = " ";
        document.body.appendChild(div);
      }
      this.closeIcon = document.createElement("div");
      this.closeIcon.className = "tonic--dialog--close";
      const svgns = "http://www.w3.org/2000/svg";
      const xlinkns = "http://www.w3.org/1999/xlink";
      const svg = document.createElementNS(svgns, "svg");
      const use = document.createElementNS(svgns, "use");
      this.closeIcon.appendChild(svg);
      svg.appendChild(use);
      use.setAttributeNS(xlinkns, "href", "#close");
      use.setAttributeNS(xlinkns, "xlink:href", "#close");
      const iconColor = "var(--tonic-primary, #333)";
      use.setAttribute("color", iconColor);
      use.setAttribute("fill", iconColor);
    }
    defaults() {
      return {
        width: "450px",
        height: "auto",
        overlay: "true",
        backgroundColor: "rgba(0, 0, 0, 0.5)"
      };
    }
    _getZIndex() {
      return Array.from(document.querySelectorAll("body *")).map((elt) => parseFloat(window.getComputedStyle(elt).zIndex)).reduce((z, highest = Number.MIN_SAFE_INTEGER) => isNaN(z) || z < highest ? highest : z);
    }
    static stylesheet() {
      return `
      .tonic--dialog {
        box-shadow: 0px 6px 35px 3px rgba(0, 0, 0, 0.2);
        background: var(--tonic-window);
        border: 1px solid var(--tonic-border);
        border-radius: 6px;
        position: fixed;
        overflow: hidden;
        top: 50%;
        left: 50%;
        z-index: -1;
        opacity: 0;
        transition: z-index .25s;
        transform: translate(-50%, -50%) scale(0.88);
        will-change: transform;
      }
      .tonic--dialog.tonic--show {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
        animation-duration: .25s;
        animation-name: tonic--dialog--show;
        transition-timing-function: ease;
      }
      .tonic--dialog.tonic--hide {
        transform: translate(-50%, -50%) scale(0.88);
        opacity: 0;
        animation-duration: .2s;
        animation-name: tonic--dialog--hide;
        transition-timing-function: ease;
      }
      .tonic--dialog > .tonic--dialog--close {
        width: 25px;
        height: 25px;
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;
      }
      .tonic--dialog > .tonic--dialog--close svg {
        width: inherit;
        height: inherit;
      }
      @keyframes tonic--dialog--show {
        from {
          transform: translate(-50%, -50%) scale(0.88);
          opacity: 0;
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }
      @keyframes tonic--dialog--hide {
        from {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }
        to {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.88);
        }
      }
      .tonic--dialog--overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0;
        z-index: -1;
        transition: all 0.2s;
        background: var(--tonic-overlay);
      }
      .tonic--dialog--overlay.tonic--show {
        opacity: 1;
      }
    `;
    }
    event(eventName) {
      const that = this;
      return {
        then(resolve) {
          const resolver = (e) => {
            if (e.key === "Escape")
              resolve({});
          };
          const listener = (event) => {
            const close = m.match(event.target, ".tonic--dialog--close");
            const value = m.match(event.target, "[value]");
            if (close || value) {
              that.removeEventListener(eventName, listener);
              document.removeEventListener("keyup", resolver);
            }
            if (close)
              return resolve({});
            if (value)
              resolve({
                [event.currentTarget.value]: true
              });
          };
          document.addEventListener("keyup", resolver);
          that.addEventListener(eventName, listener);
        }
      };
    }
    click(e) {
      if (m.match(e.target, ".tonic--dialog--close")) {
        this.hide();
      }
    }
    updated() {
      this.appendChild(this.closeIcon);
    }
    render() {
      return this.html`
      ${this.children}
    `;
    }
  };
  m.add(TonicDialog);
  var DialogInner = class extends m {
    async click(e) {
      return m.match(e.target, "tonic-button");
    }
    render() {
      return this.html`
      <header>Dialog</header>
      <main>
        ${this.props.message || "Ready"}
      </main>
      <footer>
        <tonic-button class="tonic--close" id="close">Close</tonic-button>
      </footer>
    `;
    }
  };
  m.add(DialogInner);
  document.getElementById("root").innerHTML = `
<div>
  <tonic-dialog id="dialog-default">
    <dialog-inner message="Hello!"></dialog-inner>
  </tonic-dialog>
  <button id="show-button">Show</button>
  <button id="hide-button">Hide</button>
</div>
`;
  var dialog = document.querySelector("#dialog-default");
  var showButton = document.querySelector("#show-button");
  showButton.addEventListener("click", dialog.show);
  var hideButton = document.querySelector("hide-button");
  hideButton.addEventListener("click", dialog.hide);
})();
//# sourceMappingURL=bundle.js.map
