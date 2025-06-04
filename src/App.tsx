/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import { getTodos, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import { Todos } from './components/Todos';
import classNames from 'classnames';
import { wait } from './utils/fetchClient';
import { ErrorNotification } from './components/ErrorNotification';
import { TodosFilter } from './types/TodosFilter';

export const App: React.FC = () => {
  const [queuedTodos, setQueuedTodos] = useState<Todo[]>([]);
  const [todosFilter, setTodosFilter] = useState<TodosFilter>('All');
  const [inputValue, setInputValue] = useState<string>('');

  const [error, setError] = useState('');

  const todosFromServer = useRef<Todo[]>([]);
  const [completedTodosCount, setCompletedTodosCount] = useState<number>(0);

  const countCompletedTodos = useCallback<() => void>(() => {
    setCompletedTodosCount(
      todosFromServer.current.filter(todo => !todo.completed).length,
    );
  }, []);

  const updateTodosFromServer = useCallback(() => {
    getTodos()
      .then(todosRecieved => {
        todosFromServer.current = [...todosRecieved];
        setQueuedTodos([...todosRecieved]);
        countCompletedTodos();
      })
      .catch(() => {
        setError('Unable to load todos');
        wait(3000).then(() => setError(''));
      });
  }, []);

  const validateInput = useCallback(() => {
    return inputValue.length > 0;
  }, []);

  const addTodo = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateInput()) {
      setError('Title should not be empty');
      wait(3000).then(() => setError(''));

      return;
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(updateTodosFromServer, []);

  // filter applying
  useEffect(() => {
    let newTodos: Todo[] = [];
    const allTodos = [...todosFromServer.current];

    if (todosFilter === 'Active') {
      newTodos = allTodos.filter(todo => !todo.completed);
    } else if (todosFilter === 'Completed') {
      newTodos = allTodos.filter(todo => todo.completed);
    } else {
      newTodos = allTodos;
    }

    setQueuedTodos(newTodos);
  }, [todosFilter]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form onSubmit={event => addTodo(event)}>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              autoFocus
              value={inputValue}
              onChange={event => setInputValue(event.target.value)}
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {queuedTodos.length > 0 && <Todos todos={queuedTodos} />}
          {false && (
            <>
              {/* This is a completed todo */}
              <div data-cy="Todo" className="todo completed">
                <label className="todo__status-label">
                  <input
                    data-cy="TodoStatus"
                    type="checkbox"
                    className="todo__status"
                    checked
                  />
                </label>

                <span data-cy="TodoTitle" className="todo__title">
                  Completed Todo
                </span>

                {/* Remove button appears only on hover */}
                <button
                  type="button"
                  className="todo__remove"
                  data-cy="TodoDelete"
                >
                  ×
                </button>

                {/* overlay will cover the todo while it is being deleted or updated */}
                <div data-cy="TodoLoader" className="modal overlay">
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              </div>

              {/* This todo is an active todo */}
              <div data-cy="Todo" className="todo">
                <label className="todo__status-label">
                  <input
                    data-cy="TodoStatus"
                    type="checkbox"
                    className="todo__status"
                  />
                </label>

                <span data-cy="TodoTitle" className="todo__title">
                  Not Completed Todo
                </span>
                <button
                  type="button"
                  className="todo__remove"
                  data-cy="TodoDelete"
                >
                  ×
                </button>

                <div data-cy="TodoLoader" className="modal overlay">
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              </div>

              {/* This todo is being edited */}
              <div data-cy="Todo" className="todo">
                <label className="todo__status-label">
                  <input
                    data-cy="TodoStatus"
                    type="checkbox"
                    className="todo__status"
                  />
                </label>

                {/* This form is shown instead of the title and remove button */}
                <form>
                  <input
                    data-cy="TodoTitleField"
                    type="text"
                    className="todo__title-field"
                    placeholder="Empty todo will be deleted"
                    value="Todo is being edited now"
                  />
                </form>

                <div data-cy="TodoLoader" className="modal overlay">
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              </div>

              {/* This todo is in loadind state */}
              <div data-cy="Todo" className="todo">
                <label className="todo__status-label">
                  <input
                    data-cy="TodoStatus"
                    type="checkbox"
                    className="todo__status"
                  />
                </label>

                <span data-cy="TodoTitle" className="todo__title">
                  Todo is being saved now
                </span>

                <button
                  type="button"
                  className="todo__remove"
                  data-cy="TodoDelete"
                >
                  ×
                </button>

                {/* 'is-active' class puts this modal on top of the todo */}
                <div data-cy="TodoLoader" className="modal overlay is-active">
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              </div>
            </>
          )}
        </section>

        {/* Hide the footer if there are no todos */}
        {todosFromServer.current.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {completedTodosCount} items left
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={classNames('filter__link', {
                  selected: todosFilter === 'All',
                })}
                data-cy="FilterLinkAll"
                onClick={() => setTodosFilter('All')}
              >
                All
              </a>

              <a
                href="#/active"
                className={classNames('filter__link', {
                  selected: todosFilter === 'Active',
                })}
                data-cy="FilterLinkActive"
                onClick={() => setTodosFilter('Active')}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={classNames('filter__link', {
                  selected: todosFilter === 'Completed',
                })}
                data-cy="FilterLinkCompleted"
                onClick={() => setTodosFilter('Completed')}
              >
                Completed
              </a>
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <ErrorNotification error={error} setError={setError} />
    </div>
  );
};
