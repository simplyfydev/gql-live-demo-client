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
import { setContext } from '@apollo/client/link/context';

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJQSyI6IkFkbWluI2EyNzMwMGI3LTI1ZGUtNDVjNS1iZDMzLWU1OWEyMjY2OWFhZCIsIlNLIjoiTG9naW4jQWRtaW4jYTI3MzAwYjctMjVkZS00NWM1LWJkMzMtZTU5YTIyNjY5YWFkIiwiaWF0IjoxNzE1NTkzMTAzLCJleHAiOjE3MTgxODUxMDN9.dKfzroRtXxEHcqLu6ayJCD1fV9HYlTwXiWFBysJgE48"
const httpLink = new HttpLink({
  // uri: 'http://localhost:3030/graphql',
  uri: 'https://presidiumludhiana.in/graphql',
});


const authLink = setContext((_, { headers }) => {
  // Retrieve the token from storage (localStorage or another method)
  // const token = localStorage.getItem('authToken');
  // Add the token to the headers
  return {
    headers: {
      ...headers,
      authorization: token ? ` Bearer ${token} ` : '',
    }
  };
});

// Combine authLink with httpLink
const enhancedHttpLink = authLink.concat(httpLink);



// Create a WebSocket client for subscriptions
// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(createClient({
  url: 'wss://presidiumludhiana.in/graphql',
  // url: 'ws://localhost:3030/graphql',
  connectionParams: {
    authToken: token, // Assuming you store the token the same way
  },
  reconnect: true,
}));



// Split connections based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink, // Operations requiring subscriptions use this link
  enhancedHttpLink  // Other operations (queries and mutations) use this link
);



// Apollo client setup
// Initialize Apollo Client with the split link and in-memory cache
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

const ACCOUNT_DETAILS = gql`
query getWalletDetails {
  getWalletDetails {
    remaining_price {
      price
    }
    reserved_price {
      price
    }
    pending_price {
      price
    }
    remaining_coin {
      coinCode
      coinPairWith
      lastTradePrice
      coinPrice
      totalSupply
    }
    reserved_coin {
      coinCode
      coinPairWith
      lastTradePrice
      coinPrice
      totalSupply
    }
    pending_coin {
      coinCode
      coinPairWith
      lastTradePrice
      coinPrice
      totalSupply
    }
  }
}

`;

export const fetchAllCategories = async () => {
  try {
    const { data } = await client.query({
      query: ACCOUNT_DETAILS,
      fetchPolicy: 'network-only', // Ensures the data is fetched from the server each time
    });

    console.log('this is data', data)
    return data;
  } catch (error) {
    console.error('Error fetching all categories:', error);
    throw new Error('An error occurred while fetching all categories');
  }
};



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

      {/* <br />
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
      ))} */}
    </div>
  );
};



ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);


