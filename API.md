# APIs

## STATIC METHODS

| Method | Description |
| :--- | :--- |
| `add(Class)` | Register a class as a new custom-tag and provide options for it. |
| `init(root?)` | Initialize all components (optionally starating at a root node in the DOM). This is called automatically when an <App></App> component is added. |
| `escape(String)` | Escapes HTML characters from a string (based on [he][3]). |
| `sanitize(Object)` | Escapes all the strings found in an object literal. |
| `match(Node, Selector)` | Match the given node against a selector or any matching parent of the given node. This is useful when trying to locate a node from the actual node that was interacted with. |

## INSTANCE METHODS

| Method | Description |
| :--- | :--- |
| <code>reRender(Object &#124; Function)</code> | Set the properties of a component instance. Can also take a function which will receive the current props as an argument. |
| `getProps()` | Get the properties of a component instance. |
| <code>setState(Object &#124; Function)</code> | Set the state of a component instance. Can also take a function which will receive the current props as an argument. |
| `stylesheet()` | Returns a string of css to be lazily added to a `style` tag in the head. |
| `styles()` | Returns an object that represents inline-styles to be applied to the component. Styles are applied by adding a keys from the object to the `styles` attribute of an html tag in the render function, for example `styles="key1 key2"`. Each object's key-value pair are added to the element's style object. |
| `render()` | Returns HTML to be parsed or a dom node that will overwrite. There is usually no need to call this directly, prefer `componentInstance.reRender({ ... })`. |
| html\`...\` | Tidy up an HTML string (use as a [tagged template][2]). |

## INSTANCE PROPERTIES

| Name | Description |
| :--- | :--- |
| <code>children</code> | An array of nodes, the original child nodes of the component. |

## "LIFECYCLE" INSTANCE METHODS

| Method | Description |
| :--- | :--- |
| `constructor(object)` | An instance of the element is created or upgraded. Useful for initializing state, setting up event listeners, or creating shadow dom. See the spec for restrictions on what you can do in the constructor. The constructor's arguments must be forwarded by calling `super(object)`. |
| `willConnect()` | Called prior to the element being inserted into the DOM. Useful for updating configuration, state and preparing for the render. |
| `connected()` | Called every time the element is inserted into the DOM. Useful for running setup code, such as fetching resources or rendering. Generally, you should try to delay work until this time. |
| `disconnected()` | Called every time the element is removed from the DOM. Useful for running clean up code. |
| `updated(oldProps)` | Called after reRender() is called. This method is not called on the initial render. |

[1]:https://developers.google.com/web/fundamentals/web-components/customelements
[2]:https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
[3]:https://github.com/mathiasbynens/he
