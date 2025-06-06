import React, { useState } from 'react';

type Props = {
  applyTitle: (title: string) => void;
};

export const Header: React.FC<Props> = ({ applyTitle }) => {
  const [title, setTitle] = useState<string>('');

  const handleSubmit = () => {
    applyTitle(title);
  };

  return (
    <header className="todoapp__header">
      {/* this button should have `active` class only if all todos are completed */}
      <button
        type="button"
        className="todoapp__toggle-all active"
        data-cy="ToggleAllButton"
      />

      {/* Add a todo on form submit */}
      <form
        onSubmit={event => {
          event.preventDefault();

          handleSubmit();
        }}
      >
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          autoFocus
          value={title}
          onChange={event => setTitle(event.target.value)}
        />
      </form>
    </header>
  );
};
