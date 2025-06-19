import React from 'react';

import classNames from 'classnames';
import { TodoFilter } from '../../types/TodoFilter';
import { Todo } from '../../types/Todo';
import { deleteTodoFromServer } from '../../api/todos';
import { errorMsg } from '../../utils/ErrorMsg';

type Props = {
  setError: React.Dispatch<React.SetStateAction<string>>;
  setFilter: React.Dispatch<React.SetStateAction<TodoFilter>>;
  setAllTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  filter: TodoFilter;
  itemsLeft: number;
  completedTodos: Todo[];
};

export const Footer: React.FC<Props> = ({
  setError,
  setFilter,
  setAllTodos,
  filter,
  itemsLeft,
  completedTodos,
}) => {
  const handleClearCompleted = () => {
    const completedIds = completedTodos.map(todo => todo.id);

    Promise.allSettled(
      completedIds.map(id => deleteTodoFromServer(id).then(() => id)),
    ).then(results => {
      const successfullyDeletedIds = completedIds.filter(
        (id, index) => results[index].status === 'fulfilled',
      );

      if (results.find(result => result.status === 'rejected')) {
        setError(errorMsg.DELETE_TODO_ERROR);
      }

      setAllTodos(currentTodos =>
        currentTodos.filter(todo => !successfullyDeletedIds.includes(todo.id)),
      );
    });
  };

  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {itemsLeft} items left
      </span>

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
