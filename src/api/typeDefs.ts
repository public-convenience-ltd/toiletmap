import { gql } from 'apollo-server-micro';

import fs from 'fs';
import path from 'path';

export default gql(
  fs.readFileSync(path.join(process.cwd(), './src/api/typeDefs.graphql'), 'utf-8')
);