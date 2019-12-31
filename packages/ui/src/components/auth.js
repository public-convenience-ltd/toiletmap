import { gql } from '@apollo/client';

const doLogout = (auth, apolloClient, history) => {
  auth.logout();
  apolloClient.writeQuery({
    query: gql`
      query getAuth {
        userData {
          loggedIn
          name
        }
      }
    `,
    data: {
      userData: {
        loggedIn: false,
        name: '',
      },
    },
  });
  history.push('/');
};

export { doLogout };
