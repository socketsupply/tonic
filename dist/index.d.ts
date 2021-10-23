declare type TLike = new (...args: any[]) => void;
interface TAttr<K extends string = any, V = any> {
    name: K;
    value: V;
}
interface TState {
}
declare type TProps = Record<string, any>;
declare type TNode = string | TonicTemplate | Promise<TonicTemplate> | AsyncGenerator<TonicTemplate>;
declare class TonicTemplate {
    rawText: string;
    templateStrings: TemplateStringsArray | null;
    unsafe: boolean;
    isTonicTemplate: boolean;
    __children__?: any[];
    constructor(rawText: string, templateStrings: TemplateStringsArray | null, unsafe: boolean);
    valueOf(): string;
    toString(): string;
}
declare abstract class Tonic<P extends TProps = {}, S extends TState = {}> extends window.HTMLElement {
    static isTonicTemplate: boolean;
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
    _source?: string;
    _state: S;
    _props: P;
    __props: TAttr[];
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
    private _checkId;
    private _events;
    private _prop;
    private _placehold;
    static match(el: Element | Record<string, any>, s: string): any;
    static getPropertyNames(proto: Tonic | Element | Record<string, any>): string[];
    static add(c: TLike): TLike;
    static add(c: Function, htmlName: string): Function;
    static registerStyles(stylesheetFn: () => string): void;
    static escape(s: string): string;
    static unsafeRawString(s: string, templateStrings: TemplateStringsArray): TonicTemplate;
    private _drainIterator;
    private _set;
    private _apply;
    protected dispatch(eventName: string, detail?: null): void;
    protected html(strings: TemplateStringsArray, ...values: any[]): TNode;
    protected connectedCallback(): Promise<void | undefined> | undefined;
    protected isInDocument(target: ShadowRoot | Tonic<P, S>): boolean;
    protected disconnectedCallback(): void;
    protected scheduleReRender: (oldProps: P) => Promise<void>;
    protected reRender: (o?: P | ((oldProps: P) => P)) => Promise<void>;
    handleEvent: (e: Event) => void;
    defaults?(): Partial<P>;
    styles?(): Record<string, any>;
    connected?(): void;
    disconnected?(): void;
    willConnect?(): void;
    stylesheet?(): string;
    updated?(oldProps: P): void;
    render?<P extends TProps>(html?: (strings: TemplateStringsArray, values: TProps[keyof TProps][]) => any, props?: P): TNode;
    get props(): P;
    get state(): S;
    set state(newState: S);
}
export default Tonic;
