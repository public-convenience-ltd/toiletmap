import fs from 'fs';
import path from 'path';
import { getServerPageMinimumViableLooResponse } from './api-client/staticPage';

export default async function getStaticPropsAllLoos() {
  const { dbConnect } = require('./api/db');
  await dbConnect();

  const res = await getServerPageMinimumViableLooResponse({
    variables: { limit: 1000000 },
  });

  if (res.props.error || !res.props.data) {
    return {
      notFound: true,
    };
  }

  const data = res.props.apolloState;

  return data;
}
