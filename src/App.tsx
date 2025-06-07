/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';

import { createTodo, getTodos, USER_ID } from './api/todos';
import { wait } from './utils/fetchClient';
import { filteringTodos } from './utils/queueTodos';
import { countItemsLeft } from './utils/countItemsLeft';
import { ErrorMsg } from './utils/ErrorMsg';
import { Todo } from './types/Todo';
import { TodoFilter } from './types/TodoFilter';

import { UserWarning } from './UserWarning';
import { Header } from './components/Header';
import { TodoList } from './components/TodoList';
import { Footer } from './components/Footer';
import { ErrorNotification } from './components/ErrorNotification';

export const App: React.FC = () => {
  const [allTodos, setAllTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>('All');
  const [error, setError] = useState<string>('');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);

  useEffect(() => {
    getTodos()
      .then(todosRecieved => {
        setAllTodos(todosRecieved);
      })
      .catch(() => {
        setError(ErrorMsg.LIST_LOAD_ERROR);
        wait(3000).then(() => setError(''));
      });
  }, []);

  if (!USER_ID) {
    return <UserWarning />;
  }

  const queuedTodos: Todo[] = filteringTodos(allTodos, filter);
  const itemsLeft: number = countItemsLeft(allTodos);

  // let errorTimerId: number = 0;

  // const showErrorMsg = (message: string) => {

  // };

  const applyTitle = (
    title: string,
    setTitle: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    if (!title.trim().length) {
      setError(ErrorMsg.EMPTY_TITLE);
      wait(3000).then(() => setError(''));

      return;
    }

    setTempTodo({ id: 0, title, userId: USER_ID, completed: false });

    createTodo(title)
      .then(todo => {
        setTempTodo(null);
        setTitle('');

        setAllTodos([...allTodos, todo]);
      })
      .catch(() => {
        setTempTodo(null);

        setError(ErrorMsg.ADD_TODO_ERROR);
        wait(3000).then(() => setError(''));
      });
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header applyTitle={applyTitle} tempTodo={tempTodo} />

        <TodoList todos={queuedTodos} tempTodo={tempTodo} />

        {allTodos.length > 0 && (
          <Footer filter={filter} setFilter={setFilter} itemsLeft={itemsLeft} />
        )}
      </div>

      <ErrorNotification error={error} setError={setError} />
    </div>
  );
};
