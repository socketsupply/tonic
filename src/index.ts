// @ts-check
"use strict"

type TLike = new (...args: any[]) => void

type TContent = string | Node | TonicTemplate

interface TAttr<K extends string = any, V = any> {
  name: K
  value: V
}

interface TState {}

type TProps = Record<string, any>

type TRender<P extends TProps, K extends TNode> = (
  html?: (strings: TemplateStringsArray, values: any[]) => TNode,
  props?: P
) => K

type TNode =
  | string
  | TonicTemplate
  | Promise<TonicTemplate>
  | AsyncGenerator<TonicTemplate>

class TonicTemplate {
  isTonicTemplate = true
  __children__?: any[]

  constructor(
    public rawText: string,
    public templateStrings: TemplateStringsArray | null,
    public unsafe: boolean
  ) {}

  public valueOf() {
    return this.rawText
  }
  public toString() {
    return this.rawText
  }
}

abstract class Tonic<
  P extends TProps = {},
  S extends TState = {}
> extends window.HTMLElement {
  static isTonicTemplate = true
  static _tags = ""
  static _refIds: string[] = []
  static _data: Record<string, any> = {}
  static _states: Record<string, any> = {}
  static _children: Record<string, any> = {}
  static _reg: Record<string, CustomElementConstructor> = {}
  static _stylesheetRegistry: (() => string)[] = []
  static _index = 0
  static SPREAD = /\.\.\.\s?(__\w+__\w+__)/g
  static ESC = /["&'<>`/]/g
  static AsyncFunctionGenerator = async function* () {}.constructor.name
  static AsyncFunction = async function () {}.constructor.name
  static MAP = {
    '"': "&quot;",
    "&": "&amp;",
    "'": "&#x27;",
    "<": "&lt;",
    ">": "&gt;",
    "`": "&#x60;",
    "/": "&#x2F;",
  }
  static ssr = false
  static nonce = Math.random().toString()

  _id = ""
  _source?: string
  _state: S = {} as S
  _props: P = {} as P
  __props: TAttr[] = []
  preventRenderOnReconnect = false
  elements: Element[] = []
  nodes: ChildNode[] = []
  pendingReRender?: Promise<void> | null = null
  root?: ShadowRoot | any

  constructor() {
    super()
    const state = Tonic._states[super.id]
    delete Tonic._states[super.id]
    this._state = state || {}
    this.preventRenderOnReconnect = false
    this.elements = [...Array.from(this.children)]
    ;(this.elements as any).__children__ = true
    this.nodes = [...Array.from(this.childNodes)]
    ;(this.nodes as any).__children__ = true
    this._events()
  }

  static _createId() {
    return `tonic${Tonic._index++}`
  }

  static _splitName(s: string) {
    return s.match(/[A-Z][a-z0-9]*/g)!.join("-")
  }

  static _normalizeAttrs<T extends { name: string; value: unknown }>(
    o: T[],
    x: Record<string, unknown> = {}
  ) {
    ;[...o].forEach((o) => (x[o.name] = o.value))
    return x
  }

  private _checkId() {
    const _id = super.id
    if (!_id) {
      const html = this.outerHTML.replace(this.innerHTML, "...")
      throw new Error(`Component: ${html} has no id`)
    }
    return _id
  }

  private _events() {
    const hp = Object.getOwnPropertyNames(window.HTMLElement.prototype)
    for (const p of this.__props) {
      if (hp.indexOf("on" + p) === -1) continue
      this.addEventListener(p as any, this)
    }
  }

  private _prop(o: any) {
    const id = this._id
    const p = `__${id}__${Tonic._createId()}__`
    Tonic._data[id] = Tonic._data[id] || {}
    Tonic._data[id][p] = o
    return p
  }

  private _placehold(r: any) {
    const id = this._id
    const ref = `placehold:${id}:${Tonic._createId()}__`
    Tonic._children[id] = Tonic._children[id] || {}
    Tonic._children[id][ref] = r
    return ref
  }

  static match(el: Element | any, s: string) {
    if (!el.matches) el = el.parentElement
    return el.matches(s) ? el : el.closest(s)
  }

  static getPropertyNames(proto: any) {
    const props = []
    while (proto && proto !== Tonic.prototype) {
      props.push(...Object.getOwnPropertyNames(proto))
      proto = Object.getPrototypeOf(proto)
    }
    return props
  }

  static add(c: TLike): TLike
  static add(c: Function, htmlName: string): Function
  static add(c: TLike | Function, htmlName?: string) {
    const name = c instanceof Tonic ? c.constructor.name : c.name

    if (!htmlName) {
      htmlName = Tonic._splitName(name).toLowerCase()
    }

    const hasValidName = htmlName && htmlName.length > 1

    if (!hasValidName) {
      throw Error("Mangling. https://bit.ly/2TkJ6zP")
    }

    if (!Tonic.ssr && window.customElements.get(htmlName)) {
      console.warn(`Replacing Tonic.add(${name}, '${htmlName}')`)
    }

    if (!("isTonicTemplate" in c)) {
      const tmp = {
        [c.name]: class extends Tonic {},
      }[c.name]
      ;(tmp as any).prototype.render = c
      c = tmp
    }

    ;(c as any).prototype.__props = Tonic.getPropertyNames((c as any).prototype)

    Tonic._reg[htmlName] = c as CustomElementConstructor
    Tonic._tags = Object.keys(Tonic._reg).join()
    window.customElements.define(htmlName, c as CustomElementConstructor)

    if (c instanceof Tonic && typeof c.stylesheet === "function") {
      Tonic.registerStyles(c.stylesheet)
    }

    return c
  }

  static registerStyles(stylesheetFn: () => string) {
    if (Tonic._stylesheetRegistry.includes(stylesheetFn)) return
    Tonic._stylesheetRegistry.push(stylesheetFn)

    const styleNode = document.createElement("style")
    if (Tonic.nonce) styleNode.setAttribute("nonce", Tonic.nonce)
    styleNode.appendChild(document.createTextNode(stylesheetFn()))
    if (document.head) document.head.appendChild(styleNode)
  }

  static escape(s: string) {
    return s.replace(Tonic.ESC, (c) => Tonic.MAP[c as keyof typeof Tonic.MAP])
  }

  static unsafeRawString(s: string, templateStrings: TemplateStringsArray) {
    return new TonicTemplate(s, templateStrings, true)
  }

  private async _drainIterator(
    target: Tonic<P, S> | ShadowRoot,
    iterator: AsyncGenerator
  ): Promise<void> {
    const result = await iterator.next()
    this._set(target, undefined, result.value)
    if (result.done) return
    return this._drainIterator(target, iterator)
  }

  private _set = (
    target: Tonic<P, S> | ShadowRoot,
    render: undefined | typeof this["render"],
    content: string = ""
  ) => {
    for (const node of Array.from(target.querySelectorAll(Tonic._tags))) {
      if (!(node as any).isTonicComponent) continue

      assertNodeIsTonic(node)

      const id = node.getAttribute("id")
      if (!id || !Tonic._refIds.includes(id)) continue
      Tonic._states[id] = node.state
    }

    if (render === undefined || render === null) {
      this._apply(target, content)
    } else if (render.constructor.name === Tonic.AsyncFunction) {
      return (render as TRender<P, Promise<TonicTemplate>>)
        .call(this, this.html, this.props)
        .then((content: TContent) => this._apply(target, content))
    } else if (render.constructor.name === Tonic.AsyncFunctionGenerator) {
      return this._drainIterator(
        target,
        (render as TRender<P, AsyncGenerator<TonicTemplate>>).call(this)
      )
    } else if (render === null) {
      this._apply(target, content)
    } else if (render instanceof Function) {
      this._apply(
        target,
        (render as TRender<P, TonicTemplate>).call(
          this,
          this.html,
          this.props
        ) || ""
      )
    }

    return
  }

  private _apply(target: ShadowRoot | Tonic<P, S>, content: TContent) {
    if (typeof content === "string") {
      content = Tonic.escape(content)
    } else if (content instanceof TonicTemplate) {
      content = content.rawText
    } else {
      target.innerHTML = ""
      target.appendChild(content.cloneNode(true))
      return
    }

    assertContentIsString(content)

    if (this.stylesheet) {
      content = `<style nonce=${
        Tonic.nonce || ""
      }>${this.stylesheet()}</style>${content}`
    }

    target.innerHTML = content

    if (this.styles) {
      const styles = this.styles()
      for (const node of Array.from(target.querySelectorAll("[styles]"))) {
        const nodeStyles = node.getAttribute("styles")
        if (!nodeStyles) continue
        for (const s of nodeStyles.split(/\s+/)) {
          Object.assign((node as HTMLElement).style, styles[s.trim()])
        }
      }
    }

    const tChildren = Tonic._children[this._id] || {}

    const walk = (
      node: Node,
      fn: (node: Node, children: any, id: string) => void
    ) => {
      if (node.nodeType === 3) {
        const id = node.textContent?.trim() || ""
        if (tChildren[id]) fn(node, tChildren[id], id)
      }

      const childNodes = node.childNodes
      if (!childNodes) return

      for (let i = 0; i < childNodes.length; i++) {
        walk(childNodes[i], fn)
      }
    }

    walk(target, (node, children, id) => {
      for (const child of children) {
        node.parentNode?.insertBefore(child, node)
      }
      delete Tonic._children[this._id][id]
      node.parentNode?.removeChild(node)
    })
  }

  protected dispatch(eventName: string, detail = null) {
    const opts = { bubbles: true, detail }
    this.dispatchEvent(new window.CustomEvent(eventName, opts))
  }

  protected html(strings: TemplateStringsArray, ...values: any[]): TNode {
    const refs = (o: any | any[]) => {
      if (o && o.__children__) return this._placehold(o)
      if (o && o.isTonicTemplate) return o.rawText
      switch (Object.prototype.toString.call(o)) {
        case "[object HTMLCollection]":
        case "[object NodeList]":
          return this._placehold([...o])
        case "[object Array]":
          if ((o as any[]).every((x) => x.isTonicTemplate && !x.unsafe)) {
            return new TonicTemplate(o.join("\n"), null, false)
          }
          return this._prop(o)
        case "[object Object]":
        case "[object Function]":
          return this._prop(o)
        case "[object NamedNodeMap]":
          return this._prop(Tonic._normalizeAttrs(o))
        case "[object Number]":
          return `${o}__float`
        case "[object String]":
          return Tonic.escape(o)
        case "[object Boolean]":
          return `${o}__boolean`
        case "[object Null]":
          return `${o}__null`
        case "[object HTMLElement]":
          return this._placehold([o])
      }
      if (
        typeof o === "object" &&
        o &&
        o.nodeType === 1 &&
        typeof o.cloneNode === "function"
      ) {
        return this._placehold([o])
      }
      return o
    }

    const out = []
    for (let i = 0; i < strings.length - 1; i++) {
      out.push(strings[i], refs(values[i]))
    }
    out.push(strings[strings.length - 1])

    const htmlStr = out.join("").replace(Tonic.SPREAD, (_, p) => {
      const o = Tonic._data[p.split("__")[1]][p]
      return Object.entries(o)
        .map(([key, value]) => {
          const k = key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
          if (value === true) return k
          else if (value) return `${k}="${Tonic.escape(String(value))}"`
          else return ""
        })
        .filter(Boolean)
        .join(" ")
    })
    return new TonicTemplate(htmlStr, strings, false)
  }

  protected connectedCallback() {
    this.root = this.shadowRoot || this // here for back compat

    if (super.id && !Tonic._refIds.includes(super.id)) {
      Tonic._refIds.push(super.id)
    }

    const cc = (s: string) => s.replace(/-(.)/g, (_, m) => m.toUpperCase())

    for (const { name: _name, value } of Array.from(this.attributes)) {
      const name = cc(_name) as keyof P
      const p = value

      this._props[name] = value as P[keyof P]

      if (/__\w+__\w+__/.test(p)) {
        const { 1: root } = p.split("__")
        this._props[name] = Tonic._data[root][p]
      } else if (/\d+__float/.test(p)) {
        this._props[name] = parseFloat(p) as P[keyof P]
      } else if (p === "null__null") {
        this._props[name] = null as P[keyof P]
      } else if (/\w+__boolean/.test(p)) {
        this._props[name] = p.includes("true") as P[keyof P]
      } else if (/placehold:\w+:\w+__/.test(p)) {
        const { 1: root } = p.split(":")
        this._props[name] = Tonic._children[root][p][0]
      }
    }

    this._props = Object.assign(
      this.defaults ? this.defaults() : {},
      this._props
    )

    this._id = this._id ?? Tonic._createId()

    this.willConnect?.()

    if (!this.isInDocument(this.root)) return

    if (!this.preventRenderOnReconnect) {
      if (!this._source) {
        this._source = this.innerHTML
      } else {
        this.innerHTML = this._source
      }

      const p = this._set(this.root, this.render)
      if (p && p.then) return p.then(() => this.connected?.())
    }

    this.connected && this.connected()
    return
  }

  protected isInDocument(target: ShadowRoot | Tonic<P, S>) {
    const root = target.getRootNode()
    return root === document || root.toString() === "[object ShadowRoot]"
  }

  protected disconnectedCallback() {
    this.disconnected?.()
    delete Tonic._data[this._id]
    delete Tonic._children[this._id]
  }

  protected scheduleReRender = (oldProps: P) => {
    if (this.pendingReRender) return this.pendingReRender

    this.pendingReRender = new Promise<void>((resolve) =>
      setTimeout(() => {
        if (!this.isInDocument(this.shadowRoot || this)) return
        const p = this._set(this.shadowRoot || this, this.render)
        this.pendingReRender = null

        if (p && p.then) {
          return p.then(() => {
            this.updated?.(oldProps)
            resolve()
          })
        }

        this.updated && this.updated(oldProps)
        resolve()
        return
      }, 0)
    )

    return this.pendingReRender
  }

  protected reRender = (o: P | ((oldProps: P) => P) = this.props) => {
    const oldProps = { ...this.props }
    this._props = typeof o === "function" ? o(oldProps) : o
    return this.scheduleReRender(oldProps)
  }

  // Part of HTMLElement interface
  handleEvent = (e: Event) => {
    const handler = (this as any)[e.type] as (e: Event) => void
    handler?.(e)
  }

  public defaults?(): Partial<P>

  public styles?(): Record<string, any>

  public connected?(): void

  public disconnected?(): void

  public willConnect?(): void

  public stylesheet?(): string

  public updated?(oldProps: P): void

  public render?<P extends TProps>(
    html?: (
      strings: TemplateStringsArray,
      values: TProps[keyof TProps][]
    ) => any,
    props?: P
  ): TNode

  public get props() {
    return this._props
  }

  public get state() {
    return this._checkId(), this._state
  }

  public set state(newState: S) {
    this._state = (this._checkId(), newState)
  }
}

// Tonic.prototype.isTonicComponent = true

// Object.assign(Tonic, {
//   _tags: "",
//   _refIds: [],
//   _data: {},
//   _states: {},
//   _children: {},
//   _reg: {},
//   _stylesheetRegistry: [],
//   _index: 0,
//   version: typeof require !== "undefined" ? require("./package").version : null,
//   SPREAD: /\.\.\.\s?(__\w+__\w+__)/g,
//   ESC: /["&'<>`/]/g,
//   AsyncFunctionGenerator: async function* () {}.constructor,
//   AsyncFunction: async function () {}.constructor,
//   MAP: {
//     '"': "&quot;",
//     "&": "&amp;",
//     "'": "&#x27;",
//     "<": "&lt;",
//     ">": "&gt;",
//     "`": "&#x60;",
//     "/": "&#x2F;",
//   },
// })

function assertContentIsString(content: TContent): asserts content is string {
  if (typeof content !== "string") {
    throw Error("content is not a string")
  }
}

function assertNodeIsTonic(node: Element | Tonic): asserts node is Tonic {
  if (!(node as any).isTonicComponent) {
    throw Error("node is not a tonic component")
  }
}

export default Tonic
