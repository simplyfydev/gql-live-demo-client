// App.js

import React from 'react';
import {
  gql,
  useQuery,
  useMutation,
  useSubscription
} from '@apollo/client';

// GraphQL queries, mutations, and subscriptions
const GET_TODOS = gql`
  query {
    todos {
      id
      text
      completed
    }
  }
`;

const ADD_TODO = gql`
  mutation($text: String!) {
    addTodo(text: $text) {
      id
      text
      completed
    }
  }
`;

const TOGGLE_TODO_COMPLETED = gql`
  mutation($id: ID!) {
    toggleTodoCompleted(id: $id) {
      id
      completed
    }
  }
`;

const TODO_ADDED = gql`
  subscription {
    todoAdded {
      id
      text
      completed
    }
  }
`;

const TODO_TOGGLED = gql`
  subscription {
    todoToggled {
      id
      completed
    }
  }
`;

function App() {
  const { loading, error, data } = useQuery(GET_TODOS);
  const [addTodo] = useMutation(ADD_TODO,
    {
      update(cache, { data: { addTodo } }) {
        cache.modify({
          fields: {
            todos(existingTodos = []) {
              const newTodoRef = cache.writeFragment({
                data: addTodo,
                fragment: gql`
                fragment NewTodo on Todo {
                  id
                  text
                  completed
                }
              `
              });
              return [...existingTodos, newTodoRef];
            }
          }
        });
      }
    }
  );
  const [toggleTodoCompleted] = useMutation(TOGGLE_TODO_COMPLETED, {
    update(cache, { data: { toggleTodoCompleted } }) {
      cache.modify({
        id: cache.identify(toggleTodoCompleted),
        fields: {
          completed(cachedCompleted) {
            return !cachedCompleted;
          }
        }
      });
    }
  });

  useSubscription(TODO_ADDED, {
    onSubscriptionData: ({ client, subscriptionData }) => {
      client.writeQuery({
        query: GET_TODOS,
        data: { todos: data?.todos.concat([subscriptionData.data.todoAdded]) }
      });
    }
  });

  useSubscription(TODO_TOGGLED, {
    onSubscriptionData: ({ client, subscriptionData }) => {
      client.writeQuery({
        query: GET_TODOS,
        data: {
          todos: data?.todos.map(todo =>
            todo.id === subscriptionData.data.todoToggled.id
              ? { ...todo, completed: !todo.completed }
              : todo
          )
        }
      });
    }
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;


  const handleAddTodo = async () => {
    const text = prompt('Enter new todo:');
    if (text) {
      await addTodo({
        variables: { text },
        refetchQueries: [{ query: GET_TODOS }]
      });
    }
  };

  const handleToggleTodoCompleted = async id => {
    await toggleTodoCompleted({
      variables: { id },
      refetchQueries: [{ query: GET_TODOS }]
    });
  };

  return (
    <div>
      <h1>Todo List</h1>
      <button onClick={handleAddTodo}>Add Todo</button>
      <ul>
        {data?.todos.map(todo => (
          <li key={todo.id} onClick={() => handleToggleTodoCompleted(todo.id)} style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}



export default App;
