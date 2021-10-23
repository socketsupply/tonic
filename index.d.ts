declare type TContent = string | Tonic | Node;
interface TAttr<K extends string = any, V = any> {
    name: K;
    value: V;
}
interface TState {
}
declare type TProps = Record<string, any>;
declare type TRenderFn = (html?: (strings: string[], values: any[]) => any, props?: any) => string;
declare type TAsyncRenderFn = (html?: (strings: string[], values: any[]) => any, props?: any) => Promise<string>;
declare type TAsyncGeneratorRenderFn = (html?: (strings: string[], values: any[]) => any, props?: any) => AsyncGenerator<Promise<string>>;
declare class TonicTemplate {
    rawText: string;
    templateStrings: string[] | null;
    unsafe: boolean;
    isTonicTemplate: boolean;
    __children__?: any[];
    constructor(rawText: string, templateStrings: string[] | null, unsafe: boolean);
    valueOf(): string;
    toString(): string;
}
declare class Tonic<P extends TProps = [], S extends TState = {}> extends window.HTMLElement {
    readonly isTonicTemplate = true;
    static _tags: string;
    static _refIds: string[];
    static _data: Record<string, any>;
    static _states: Record<string, any>;
    static _children: Record<string, any>;
    static _reg: Record<string, CustomElementConstructor>;
    static _stylesheetRegistry: (() => string)[];
    static _index: number;
    static SPREAD: RegExp;
    static ESC: RegExp;
    static AsyncFunctionGenerator: string;
    static AsyncFunction: string;
    static MAP: {
        '"': string;
        "&": string;
        "'": string;
        "<": string;
        ">": string;
        "`": string;
        "/": string;
    };
    static ssr: boolean;
    static nonce: string;
    _id: string;
    _state: S;
    _props: TAttr[];
    _source?: string;
    props: P;
    preventRenderOnReconnect: boolean;
    elements: Element[];
    nodes: ChildNode[];
    pendingReRender?: Promise<void> | null;
    root?: ShadowRoot | any;
    constructor();
    static _createId(): string;
    static _splitName(s: string): string;
    static _normalizeAttrs<T extends {
        name: string;
        value: unknown;
    }>(o: T[], x?: Record<string, unknown>): Record<string, unknown>;
    _checkId(): string;
    get state(): S;
    set state(newState: S);
    _events(): void;
    _prop(o: any): string;
    _placehold(r: any): string;
    static match(el: Element | any, s: string): any;
    static getPropertyNames(proto: any): string[];
    static add(c: Tonic | Function, htmlName: string): Function | Tonic<[], {}>;
    static registerStyles(stylesheetFn: () => string): void;
    static escape(s: string): string;
    static unsafeRawString(s: string, templateStrings: string[]): TonicTemplate;
    dispatch(eventName: string, detail?: null): void;
    html(strings: string[], ...values: any[]): TonicTemplate;
    scheduleReRender: (oldProps: P) => Promise<void>;
    reRender(o?: P | ((oldProps: P) => P)): Promise<void>;
    handleEvent(e: Event): void;
    _drainIterator(target: Tonic<P, S> | ShadowRoot, iterator: AsyncGenerator): Promise<void>;
    _set: (target: Tonic<P, S> | ShadowRoot, render: undefined | TAsyncRenderFn | TRenderFn | TAsyncGeneratorRenderFn, content?: string) => Promise<void> | undefined;
    _apply(target: ShadowRoot | Tonic<P, S>, content: TContent): void;
    connectedCallback(): Promise<void | undefined> | undefined;
    isInDocument(target: ShadowRoot | Tonic<P, S>): boolean;
    disconnectedCallback(): void;
    defaults?(): Partial<P>;
    render?: TRenderFn | TAsyncRenderFn | TAsyncGeneratorRenderFn;
    updated?(oldProps: P): void;
    connected?(): void;
    disconnected?(): void;
    willConnect?(): void;
    stylesheet?(): string;
    styles?(): Record<string, any>;
}
declare function assertContentIsString(content: TContent): asserts content is string;
declare function assertNodeIsTonic(node: Element | Tonic): asserts node is Tonic;
declare function assertRenderIsFunction(render: TRenderFn | TAsyncRenderFn | TAsyncGeneratorRenderFn): asserts render is TRenderFn;
declare function assertRenderIsAsyncFunction(render: TRenderFn | TAsyncRenderFn | TAsyncGeneratorRenderFn): asserts render is TAsyncRenderFn;
declare function assertRenderIsASyncGeneratorFunction(render: TRenderFn | TAsyncRenderFn | TAsyncGeneratorRenderFn): asserts render is TAsyncGeneratorRenderFn;
//# sourceMappingURL=index.d.ts.map