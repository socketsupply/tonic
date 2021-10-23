// src/index.ts
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
      const oldProps = {...this.props};
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
    const opts = {bubbles: true, detail};
    this.dispatchEvent(new window.CustomEvent(eventName, opts));
  }
  html(strings, ...values) {
    const refs = (o) => {
      if (o && "__children__" in o)
        return this._placehold(o);
      if (o && "isTonicTemplate" in o)
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
    for (const {name: _name, value} of Array.from(this.attributes)) {
      const name = cc(_name);
      const p = value;
      this._props[name] = value;
      if (/__\w+__\w+__/.test(p)) {
        const {1: root} = p.split("__");
        this._props[name] = _Tonic._data[root][p];
      } else if (/\d+__float/.test(p)) {
        this._props[name] = parseFloat(p);
      } else if (p === "null__null") {
        this._props[name] = null;
      } else if (/\w+__boolean/.test(p)) {
        this._props[name] = p.includes("true");
      } else if (/placehold:\w+:\w+__/.test(p)) {
        const {1: root} = p.split(":");
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
export {
  src_default as default
};
//# sourceMappingURL=index.esm.js.map
