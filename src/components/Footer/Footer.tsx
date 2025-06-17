import React from 'react';

import { TodoFilter } from '../../types/TodoFilter';
import classNames from 'classnames';
import { Todo } from '../../types/Todo';
import { wait } from '../../utils/fetchClient';

type Props = {
  setFilter: React.Dispatch<React.SetStateAction<TodoFilter>>;
  setAllTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  deleteTodo: (todoId: number, clearCompletedTodos: boolean) => void;
  filter: TodoFilter;
  itemsLeft: number;
  completedTodos: Todo[];
};

export const Footer: React.FC<Props> = ({
  setFilter,
  setAllTodos,
  deleteTodo,
  filter,
  itemsLeft,
  completedTodos,
}) => {
  const handleClearCompleted = () => {
    const completedIds = completedTodos.map(todo => todo.id);

    Promise.allSettled(completedIds.map(id => deleteTodo(id, true))).then(
      results => {
        const successfullyDeletedIds = completedIds.filter(
          (id, index) => results[index].status === 'fulfilled',
        );

        wait(300).then(() => {
          setAllTodos(currentTodos =>
            currentTodos.filter(
              todo => !successfullyDeletedIds.includes(todo.id),
            ),
          );
        });
      },
    );
  };

  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {itemsLeft} items left
      </span>

      {/* Active link should have the 'selected' class */}
      <nav className="filter" data-cy="Filter">
        <a
          href="#/"
          className={classNames('filter__link', { selected: filter === 'All' })}
          data-cy="FilterLinkAll"
          onClick={() => setFilter('All')}
        >
          All
        </a>

        <a
          href="#/active"
          className={classNames('filter__link', {
            selected: filter === 'Active',
          })}
          data-cy="FilterLinkActive"
          onClick={() => setFilter('Active')}
        >
          Active
        </a>

        <a
          href="#/completed"
          className={classNames('filter__link', {
            selected: filter === 'Completed',
          })}
          data-cy="FilterLinkCompleted"
          onClick={() => setFilter('Completed')}
        >
          Completed
        </a>
      </nav>

      {/* this button should be disabled if there are no completed todos */}
      <button
        type="button"
        className="todoapp__clear-completed"
        data-cy="ClearCompletedButton"
        disabled={!Boolean(completedTodos.length)}
        onClick={handleClearCompleted}
      >
        Clear completed
      </button>
    </footer>
  );
};
