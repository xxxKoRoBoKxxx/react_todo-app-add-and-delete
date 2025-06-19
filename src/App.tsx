/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';

import {
  createTodo,
  deleteTodoFromServer,
  getTodos,
  USER_ID,
} from './api/todos';
import { wait } from './utils/fetchClient';
import { filteringTodos } from './utils/queueTodos';
import { countItemsLeft } from './utils/countItemsLeft';
import { errorMsg } from './utils/ErrorMsg';
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
        setAllTodos(() =>
          todosRecieved.map(todo => {
            const newTodo = todo;

            newTodo.loading = false;

            return newTodo;
          }),
        );
      })
      .catch(() => {
        setError(errorMsg.LIST_LOAD_ERROR);
        wait(3000, true).then(() => setError(''));
      });
  }, []);

  if (!USER_ID) {
    return <UserWarning />;
  }

  const completedTodos: Todo[] = allTodos.filter(todo => todo.completed);
  const queuedTodos: Todo[] = filteringTodos(allTodos, filter);
  const itemsLeft: number = countItemsLeft(allTodos);

  const setLoading = (todoId: number, load: boolean) => {
    setAllTodos(() => {
      const newTodos = [...allTodos];

      const deletingTodo = newTodos.find(todo => todo.id === todoId);

      if (deletingTodo) {
        deletingTodo.loading = load;
      }

      return newTodos;
    });
  };

  const applyTitle = (
    title: string,
    setTitle: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    if (!title.trim().length) {
      setError(errorMsg.EMPTY_TITLE);
      wait(3000, true).then(() => setError(''));

      return;
    }

    setTempTodo({
      id: 0,
      title: title.trim(),
      userId: USER_ID,
      completed: false,
      loading: true,
    });

    createTodo(title.trim())
      .then(todo => {
        setTempTodo(null);
        setTitle('');

        setAllTodos([...allTodos, todo]);
      })
      .catch(() => {
        setTempTodo(null);

        setError(errorMsg.ADD_TODO_ERROR);
        wait(3000, true).then(() => setError(''));
      });
  };

  const deleteTodo = (todoId: number, clearCompletedTodos?: boolean): void => {
    setLoading(todoId, true);

    wait(200).then(() => {
      deleteTodoFromServer(todoId)
        .then(() => {
          if (!clearCompletedTodos) {
            setAllTodos(allTodos.filter(todo => todo.id !== todoId));
          }
        })
        .catch(() => {
          setLoading(todoId, false);

          setError(errorMsg.DELETE_TODO_ERROR);
          wait(3000, true).then(() => setError(''));
        });
    });
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          applyTitle={applyTitle}
          tempTodo={tempTodo}
          allTodos={allTodos}
        />

        <TodoList
          todos={queuedTodos}
          tempTodo={tempTodo}
          deleteTodo={deleteTodo}
        />

        {allTodos.length > 0 && (
          <Footer
            setError={setError}
            setFilter={setFilter}
            setAllTodos={setAllTodos}
            filter={filter}
            itemsLeft={itemsLeft}
            completedTodos={completedTodos}
          />
        )}
      </div>

      <ErrorNotification error={error} setError={setError} />
    </div>
  );
};
