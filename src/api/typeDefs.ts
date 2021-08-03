import { gql } from 'apollo-server-micro'
const typeDefs = gql(
  fs.readFileSync(path.join(__dirname, 'typeDefs.graphql'), 'utf-8')
);
export default gql(typeDefs);
