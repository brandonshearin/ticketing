import { ApolloClient, InMemoryCache } from "@apollo/client";

/*
  We will define BASE_URL and HOST in the local docker file, but when
  we are running outside of our cluster locally, or on DO, we will
  use the second url/host
*/
const client = new ApolloClient({
  uri: process.env.BASE_URL
    ? `${process.env.BASE_URL}/api/orgs/graphql`
    : "http://squawktherapy.com/api/orgs/graphql",
  headers: {
    Host: process.env.HOST ? process.env.HOST : "www.squawktherapy.com",
  },
  cache: new InMemoryCache(),
});

export default client;

