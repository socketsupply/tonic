(() => {
  // ../dist/index.esm.js
  "use strict";
  var TonicTemplate = class {
    constructor(rawText, templateStrings, unsafe) {
      this.rawText = rawText;
      this.templateStrings = templateStrings;
      this.unsafe = unsafe;
      this.isTonicTemplate = true;
    }
    valueOf() {
      return this.rawText;
    }
    toString() {
      return this.rawText;
    }
  };
  var _Tonic = class extends window.HTMLElement {
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
      this._set = (target, render, content = "") => {
        for (const node of Array.from(target.querySelectorAll(_Tonic._tags))) {
          if (!node.isTonicComponent)
            continue;
          assertNodeIsTonic(node);
          const id = node.getAttribute("id");
          if (!id || !_Tonic._refIds.includes(id))
            continue;
          _Tonic._states[id] = node.state;
        }
        if (render === void 0 || render === null) {
          this._apply(target, content);
        } else if (render.constructor.name === _Tonic.AsyncFunction) {
          return render.call(this, this.html, this.props).then((content2) => this._apply(target, content2));
        } else if (render.constructor.name === _Tonic.AsyncFunctionGenerator) {
          return this._drainIterator(target, render.call(this));
        } else if (render === null) {
          this._apply(target, content);
        } else if (render instanceof Function) {
          this._apply(target, render.call(this, this.html, this.props) || "");
        }
        return;
      };
      this.scheduleReRender = (oldProps) => {
        if (this.pendingReRender)
          return this.pendingReRender;
        this.pendingReRender = new Promise((resolve) => setTimeout(() => {
          if (!this.isInDocument(this.shadowRoot || this))
            return;
          const p = this._set(this.shadowRoot || this, this.render);
          this.pendingReRender = null;
          if (p && p.then) {
            return p.then(() => {
              this.updated?.(oldProps);
              resolve();
            });
          }
          this.updated && this.updated(oldProps);
          resolve();
          return;
        }, 0));
        return this.pendingReRender;
      };
      this.reRender = (o = this.props) => {
        const oldProps = { ...this.props };
        this._props = typeof o === "function" ? o(oldProps) : o;
        return this.scheduleReRender(oldProps);
      };
      this.handleEvent = (e) => {
        const handler = this[e.type];
        handler?.(e);
      };
      const state = _Tonic._states[super.id];
      delete _Tonic._states[super.id];
      this._state = state || {};
      this.preventRenderOnReconnect = false;
      this.elements = [...Array.from(this.children)];
      this.elements.__children__ = true;
      this.nodes = [...Array.from(this.childNodes)];
      this.nodes.__children__ = true;
      this._events();
    }
    static _createId() {
      return `tonic${_Tonic._index++}`;
    }
    static _splitName(s) {
      return s.match(/[A-Z][a-z0-9]*/g).join("-");
    }
    static _normalizeAttrs(o, x = {}) {
      ;
      [...o].forEach((o2) => x[o2.name] = o2.value);
      return x;
    }
    _checkId() {
      const _id = super.id;
      if (!_id) {
        const html = this.outerHTML.replace(this.innerHTML, "...");
        throw new Error(`Component: ${html} has no id`);
      }
      return _id;
    }
    _events() {
      const hp = Object.getOwnPropertyNames(window.HTMLElement.prototype);
      for (const p of this.__props) {
        if (hp.indexOf("on" + p) === -1)
          continue;
        this.addEventListener(p, this);
      }
    }
    _prop(o) {
      const id = this._id;
      const p = `__${id}__${_Tonic._createId()}__`;
      _Tonic._data[id] = _Tonic._data[id] || {};
      _Tonic._data[id][p] = o;
      return p;
    }
    _placehold(r) {
      const id = this._id;
      const ref = `placehold:${id}:${_Tonic._createId()}__`;
      _Tonic._children[id] = _Tonic._children[id] || {};
      _Tonic._children[id][ref] = r;
      return ref;
    }
    static match(el, s) {
      if (!el.matches)
        el = el.parentElement;
      return el.matches(s) ? el : el.closest(s);
    }
    static getPropertyNames(proto) {
      const props = [];
      while (proto && proto !== _Tonic.prototype) {
        props.push(...Object.getOwnPropertyNames(proto));
        proto = Object.getPrototypeOf(proto);
      }
      return props;
    }
    static add(c, htmlName) {
      const name = c instanceof _Tonic ? c.constructor.name : c.name;
      if (!htmlName) {
        htmlName = _Tonic._splitName(name).toLowerCase();
      }
      const hasValidName = htmlName && htmlName.length > 1;
      if (!hasValidName) {
        throw Error("Mangling. https://bit.ly/2TkJ6zP");
      }
      if (!_Tonic.ssr && window.customElements.get(htmlName)) {
        console.warn(`Replacing Tonic.add(${name}, '${htmlName}')`);
      }
      if (!("isTonicTemplate" in c)) {
        const tmp = {
          [c.name]: class extends _Tonic {
          }
        }[c.name];
        tmp.prototype.render = c;
        c = tmp;
      }
      ;
      c.prototype.__props = _Tonic.getPropertyNames(c.prototype);
      _Tonic._reg[htmlName] = c;
      _Tonic._tags = Object.keys(_Tonic._reg).join();
      window.customElements.define(htmlName, c);
      if (c instanceof _Tonic && typeof c.stylesheet === "function") {
        _Tonic.registerStyles(c.stylesheet);
      }
      return c;
    }
    static registerStyles(stylesheetFn) {
      if (_Tonic._stylesheetRegistry.includes(stylesheetFn))
        return;
      _Tonic._stylesheetRegistry.push(stylesheetFn);
      const styleNode = document.createElement("style");
      if (_Tonic.nonce)
        styleNode.setAttribute("nonce", _Tonic.nonce);
      styleNode.appendChild(document.createTextNode(stylesheetFn()));
      if (document.head)
        document.head.appendChild(styleNode);
    }
    static escape(s) {
      return s.replace(_Tonic.ESC, (c) => _Tonic.MAP[c]);
    }
    static unsafeRawString(s, templateStrings) {
      return new TonicTemplate(s, templateStrings, true);
    }
    async _drainIterator(target, iterator) {
      const result = await iterator.next();
      this._set(target, void 0, result.value);
      if (result.done)
        return;
      return this._drainIterator(target, iterator);
    }
    _apply(target, content) {
      if (typeof content === "string") {
        content = _Tonic.escape(content);
      } else if (content instanceof TonicTemplate) {
        content = content.rawText;
      } else {
        target.innerHTML = "";
        target.appendChild(content.cloneNode(true));
        return;
      }
      assertContentIsString(content);
      if (this.stylesheet) {
        content = `<style nonce=${_Tonic.nonce || ""}>${this.stylesheet()}</style>${content}`;
      }
      target.innerHTML = content;
      if (this.styles) {
        const styles = this.styles();
        for (const node of Array.from(target.querySelectorAll("[styles]"))) {
          const nodeStyles = node.getAttribute("styles");
          if (!nodeStyles)
            continue;
          for (const s of nodeStyles.split(/\s+/)) {
            Object.assign(node.style, styles[s.trim()]);
          }
        }
      }
      const tChildren = _Tonic._children[this._id] || {};
      const walk = (node, fn) => {
        if (node.nodeType === 3) {
          const id = node.textContent?.trim() || "";
          if (tChildren[id])
            fn(node, tChildren[id], id);
        }
        const childNodes = node.childNodes;
        if (!childNodes)
          return;
        for (let i = 0; i < childNodes.length; i++) {
          walk(childNodes[i], fn);
        }
      };
      walk(target, (node, children, id) => {
        for (const child of children) {
          node.parentNode?.insertBefore(child, node);
        }
        delete _Tonic._children[this._id][id];
        node.parentNode?.removeChild(node);
      });
    }
    dispatch(eventName, detail = null) {
      const opts = { bubbles: true, detail };
      this.dispatchEvent(new window.CustomEvent(eventName, opts));
    }
    html(strings, ...values) {
      const refs = (o) => {
        if (o && o.__children__)
          return this._placehold(o);
        if (o && o.isTonicTemplate)
          return o.rawText;
        switch (Object.prototype.toString.call(o)) {
          case "[object HTMLCollection]":
          case "[object NodeList]":
            return this._placehold([...o]);
          case "[object Array]":
            if (o.every((x) => x.isTonicTemplate && !x.unsafe)) {
              return new TonicTemplate(o.join("\n"), null, false);
            }
            return this._prop(o);
          case "[object Object]":
          case "[object Function]":
            return this._prop(o);
          case "[object NamedNodeMap]":
            return this._prop(_Tonic._normalizeAttrs(o));
          case "[object Number]":
            return `${o}__float`;
          case "[object String]":
            return _Tonic.escape(o);
          case "[object Boolean]":
            return `${o}__boolean`;
          case "[object Null]":
            return `${o}__null`;
          case "[object HTMLElement]":
            return this._placehold([o]);
        }
        if (typeof o === "object" && o && o.nodeType === 1 && typeof o.cloneNode === "function") {
          return this._placehold([o]);
        }
        return o;
      };
      const out = [];
      for (let i = 0; i < strings.length - 1; i++) {
        out.push(strings[i], refs(values[i]));
      }
      out.push(strings[strings.length - 1]);
      const htmlStr = out.join("").replace(_Tonic.SPREAD, (_, p) => {
        const o = _Tonic._data[p.split("__")[1]][p];
        return Object.entries(o).map(([key, value]) => {
          const k = key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
          if (value === true)
            return k;
          else if (value)
            return `${k}="${_Tonic.escape(String(value))}"`;
          else
            return "";
        }).filter(Boolean).join(" ");
      });
      return new TonicTemplate(htmlStr, strings, false);
    }
    connectedCallback() {
      this.root = this.shadowRoot || this;
      if (super.id && !_Tonic._refIds.includes(super.id)) {
        _Tonic._refIds.push(super.id);
      }
      const cc = (s) => s.replace(/-(.)/g, (_, m) => m.toUpperCase());
      for (const { name: _name, value } of Array.from(this.attributes)) {
        const name = cc(_name);
        const p = value;
        this._props[name] = value;
        if (/__\w+__\w+__/.test(p)) {
          const { 1: root } = p.split("__");
          this._props[name] = _Tonic._data[root][p];
        } else if (/\d+__float/.test(p)) {
          this._props[name] = parseFloat(p);
        } else if (p === "null__null") {
          this._props[name] = null;
        } else if (/\w+__boolean/.test(p)) {
          this._props[name] = p.includes("true");
        } else if (/placehold:\w+:\w+__/.test(p)) {
          const { 1: root } = p.split(":");
          this._props[name] = _Tonic._children[root][p][0];
        }
      }
      this._props = Object.assign(this.defaults ? this.defaults() : {}, this._props);
      this._id = this._id ?? _Tonic._createId();
      this.willConnect?.();
      if (!this.isInDocument(this.root))
        return;
      if (!this.preventRenderOnReconnect) {
        if (!this._source) {
          this._source = this.innerHTML;
        } else {
          this.innerHTML = this._source;
        }
        const p = this._set(this.root, this.render);
        if (p && p.then)
          return p.then(() => this.connected?.());
      }
      this.connected && this.connected();
      return;
    }
    isInDocument(target) {
      const root = target.getRootNode();
      return root === document || root.toString() === "[object ShadowRoot]";
    }
    disconnectedCallback() {
      this.disconnected?.();
      delete _Tonic._data[this._id];
      delete _Tonic._children[this._id];
    }
    get props() {
      return this._props;
    }
    get state() {
      return this._checkId(), this._state;
    }
    set state(newState) {
      this._state = (this._checkId(), newState);
    }
  };
  var Tonic = _Tonic;
  Tonic.isTonicTemplate = true;
  Tonic._tags = "";
  Tonic._refIds = [];
  Tonic._data = {};
  Tonic._states = {};
  Tonic._children = {};
  Tonic._reg = {};
  Tonic._stylesheetRegistry = [];
  Tonic._index = 0;
  Tonic.SPREAD = /\.\.\.\s?(__\w+__\w+__)/g;
  Tonic.ESC = /["&'<>`/]/g;
  Tonic.AsyncFunctionGenerator = async function* () {
  }.constructor.name;
  Tonic.AsyncFunction = async function() {
  }.constructor.name;
  Tonic.MAP = {
    '"': "&quot;",
    "&": "&amp;",
    "'": "&#x27;",
    "<": "&lt;",
    ">": "&gt;",
    "`": "&#x60;",
    "/": "&#x2F;"
  };
  Tonic.ssr = false;
  Tonic.nonce = Math.random().toString();
  function assertContentIsString(content) {
    if (typeof content !== "string") {
      throw Error("content is not a string");
    }
  }
  function assertNodeIsTonic(node) {
    if (!node.isTonicComponent) {
      throw Error("node is not a tonic component");
    }
  }
  var src_default = Tonic;

  // src/index.ts
  var ParentComponent = class extends src_default {
    render() {
      return this.html`
      <div class="parent">
        <span>Hey now:</span>
        ${this.children} 
      </div>
    `;
    }
  };
  src_default.add(ParentComponent);
  var ChildComponent = class extends src_default {
    render() {
      return this.html`
      <div class="child">
        ${this.props.value}
      </div>
    `;
    }
  };
  src_default.add(ChildComponent);
  var TonicDialog = class extends src_default {
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
            const close = src_default.match(event.target, ".tonic--dialog--close");
            const value = src_default.match(event.target, "[value]");
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
      if (src_default.match(e.target, ".tonic--dialog--close")) {
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
  src_default.add(TonicDialog);
  var DialogInner = class extends src_default {
    async click(e) {
      return src_default.match(e.target, "tonic-button");
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
  src_default.add(DialogInner);
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
