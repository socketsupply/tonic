/* global Tonic */
(function __main () {
  'use strict'

  const ROOT_URI = '#/'
  const COMPLETED_URI = '#/completed'
  const ACTIVE_URI = '#/active'

  class TodoApp extends Tonic {
    constructor (o) {
      super(o)

      this.state = {
        route: '#/',
        todos: [],
        ...this.state
      }
    }

    input (ev) {
      const elem = Tonic.match(ev.target, '[data-event]')
      if (elem && elem.dataset.event === 'new-todo') {
        const input = this.querySelector('#new-todo')
        this.state.text = input.value
      }
    }

    /**
     * TODO: clearCompleted
     * TODO: destroy
     * TODO: toggleAll
     */
    change (ev) {
      const elem = Tonic.match(ev.target, '[data-event]')
      if (elem && elem.dataset.event === 'new-todo') {
        const input = this.querySelector('#new-todo')
        if (input.value.trim() === '') return

        this.state.todos.push({
          title: input.value.trim(),
          completed: false
        })
        this.state.text = ''
        this.reRender()
      }
    }

    connected () {
      window.addEventListener('hashchange', () => {
        this.state.route = window.location.hash
        this.reRender()
      })
    }

    render () {
      return this.html`
        <section id="todoapp" class="todoapp">
          ${this.renderHeader()}
          ${this.renderMain()}
          ${this.renderStats()}
        </section>
      `
    }

    renderHeader () {
      return this.html`
        <header class="header" id="header">
          <h1>Todos</h1>
          <input
            id="new-todo"
            class="new-todo"
            data-event="new-todo"
            placeholder="What needs to be done?"
            autofocus
            value="${this.state.text}"
            name="newTodo"
          />
        </header>
      `
    }

    renderMain () {
      const route = this.state.route
      const allCompleted = this.state.todos.every((todo) => {
        return todo.completed
      })
      const visibleTodos = this.state.todos.filter((todo) => {
        return (route === COMPLETED_URI && todo.completed) ||
          (route === ACTIVE_URI && !todo.completed) ||
          route === ROOT_URI
      })

      const checked = allCompleted ? 'checked' : ''

      return this.html`
        <section class="main" id="main">
          <input class="toggle-all" id="toggle-all"
            type="checkbox"
            name="toggle"
            ${Tonic.raw(checked)}
            data-event="toggle-all"
          />
          <label for="toggle-all">Mark all as complete</label>
          <ul class="todo-list" id="todo-list">
            ${Tonic.raw(visibleTodos.map((todo) => {
              return this.html`
                <todo-item todo=${todo}></todo-item>
              `
            }).join('\n'))}
          </ul>
        </section>
      `
    }

    renderStats () {
      const todosLeft = this.state.todos.filter((todo) => {
        return !todo.completed
      }).length
      const todosCompleted = this.state.todos.length - todosLeft

      const hidden = todosCompleted === 0 ? 'hidden' : ''
      const allSelected = this.state.route === '#/'
        ? 'selected' : ''
      const activeSelected = this.state.route === '#/active'
        ? 'selected' : ''
      const completeSelected = this.state.route === '#/complete'
        ? 'selected' : ''

      return this.html`
        <footer id='footer' class='footer'>
          <span class='todo-count' id='todo-count'>
            <strong>${String(todosLeft)}</strong>
            ${todosLeft === 1 ? 'item' : 'items'} left
          </span>
          <ul class='filters' id='filters'>
            <li><a href="#/" class="${allSelected}">All</a></li>
            <li><a href="#/active" class="${activeSelected}">Active</a></li>
            <li><a href="#/completed" class="${completeSelected}">Completed</a></li>
          </ul>
          <button class='clear-completed' id='clear-completed'
            ${Tonic.raw(hidden)}
            data-event="clear-completed"
          >
            Clear Completed (${String(todosCompleted)})
          </button>
        </footer>
      `
    }
  }
  Tonic.add(TodoApp, 'todo-app')

  class TodoItem extends Tonic {
    willConnect () {
      this.todoState = this.props.todo
    }

    render () {
      const className =
        (this.todoState.completed ? 'completed ' : '') +
        (this.state.editing ? 'editing' : '')

      const checked = this.todoState.completed ? 'checked' : ''

      return this.html`
        <li class="${className}">
          <div class="view">
            <input
              class="toggle"
              type="checkbox"
              ${Tonic.raw(checked)}
              data-event="toggle"
            />
            <label data-event="start-edit">${this.todoState.title}</label>
            <button class="destroy" data-event="destroy-item">
            </button>
          </div>
          <input
            class="edit"
            value="${this.todoState.title}"
            name="title"
            data-event="edit-todo"
          />
        </li>
      `
    }
  }
  Tonic.add(TodoItem, 'todo-item')
})()
