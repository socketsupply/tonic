# API

## STATIC METHODS

| Method | Description |
| :--- | :--- |
| `add(Class, Object)` | Register a class as a new custom-tag and provide optional options for it. |
| `escape(String)` | Escapes html characters from a string (based on [he][3]). |
| `sanitize(Object)` | Escapes all the strings found in an object literal. |
| `match(Node, Selector)` | Match the given node against a selector or any matching parent of the given node. This is useful when trying to locate a node from the actual node that was interacted with. |

## INSTANCE METHODS

| Method | Description |
| :--- | :--- |
| `emit(String, Object)` | Emit a custom event on the root element of the component. A listener will receive a plain old javascript event object that contains the [`detail`][4] property. |
| `setProps(Object)` | Set the properties of a component instance. Can also take a function which will receive the current props as an argument. |
| `getProps()` | Get the properties of a component instance. |
| `setState(Object)` | Set the state of a component instance. Can also take a function which will receive the current props as an argument. |
| `getState()` | Get the state of a component instance. |
| `style()` | Returns a string of css to be inlined with the component. This will be "scoped" so that it does not affect the rest of the page. It will also persist across rerenders to save on parsing costs. |
| `render()` | Returns html to be parsed or a dom node that will overwrite. There is usually no need to call this directly, prefer `componentInstance.setProps({ ... })`. |
| html\`...\` | Tidy up an html string (use as a [tagged template][2]). |

## "LIFECYCLE" INSTANCE METHODS

The standard "[reactions][1]" (aka lifecycle methods) are available on every
component (as well as a few others) (The events are listed in the order that
they fire).

| Method | Description |
| :--- | :--- |
| `willConnect()` | Called prior to the element being inserted into the DOM. Useful for updating configuration, state and preparing for the render. |
| `constructor(props)` | An instance of the element is created or upgraded. Useful for initializing state, settings up event listeners, or creating shadow dom. See the spec for restrictions on what you can do in the constructor. A constructor must call `super(props)`. |
| `connected()` | Called every time the element is inserted into the DOM. Useful for running setup code, such as fetching resources or rendering. Generally, you should try to delay work until this time. |
| `updated(oldProps)` | Called after setProps() is called. This method is not called on the initial render. |
| `disconnected()` | Called every time the element is removed from the DOM. Useful for running clean up code. |

## EVENTS
Any method defined on your class that matches a dom method will be called when
the event is fired. Events that do not normally propagate from the shadow DOM to
the standard DOM will still call your event methods.

[1]:https://developers.google.com/web/fundamentals/web-components/customelements
[2]:https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
[3]:https://github.com/mathiasbynens/he
[4]:https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
