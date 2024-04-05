import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  split,
  gql,
  useMutation,
  useSubscription,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import TradeForm from './LiveTradeOrders';



// HTTP connection to the GraphQL API
const httpLink = new HttpLink({
  // uri: 'http://localhost:3030/graphql',
  uri: 'https://presidiumludhiana.in/graphql',
});

// Create a WebSocket client for subscriptions
const wsClient = createClient({
  // url: 'ws://localhost:3030/graphql',
  url: 'wss://presidiumludhiana.in/graphql',
});



// Create a WebSocket link
const wsLink = new GraphQLWsLink(wsClient);

// Using split for HTTP and WebSocket links
const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink, // Use this link for subscriptions
  httpLink, // Use this link for queries and mutations
);

// Apollo client setup
const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});



// GraphQL mutation for adding a todo
const ADD_TODO_MUTATION = gql`
  mutation addTodo($text: String!) {
    addTodo(text: $text) {
      id
      text
    }
  }
`;




// Subscription for listening to new todos    
const TODO_ADDED_SUBSCRIPTION = gql`
  subscription onTodoAdded {
    todoAdded {
      id
      text
    }
  }
`;



const App = () => {
  const [todos, setTodos] = useState([]);
  const [todoText, setTodoText] = useState('');
  const { data } = useSubscription(TODO_ADDED_SUBSCRIPTION);

  const [addTodo, { loading: addingTodo }] = useMutation(ADD_TODO_MUTATION, {
    onCompleted: () => setTodoText(''), // Clear input after adding
  });

  // Update the local list of todos when a new one is added
  useEffect(() => {
    if (data) {
      setTodos((prevTodos) => [...prevTodos, data.todoAdded]);
    }
  }, [data]);

  // console.log({data})

  const handleAddTodo = () => {
    if (!todoText.trim()) return; // Prevent adding empty todos
    addTodo({
      variables: {
        text: todoText,
      },
    });
  };

  return (
    <div>

      <div className=''>

        <h2>Limit Trade Order:</h2>

        <TradeForm />
      </div>

      <br />
      <h2>Todos:</h2>

      <input
        type="text"
        value={todoText}
        onChange={(e) => setTodoText(e.target.value)}
        placeholder="Write a todo"
      />

      <button onClick={handleAddTodo} disabled={addingTodo}>
        Add Todo
      </button>


      {todos.map((todo, index) => (
        <p key={index}>{todo.text}</p>
      ))}
    </div>
  );
};



ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);


