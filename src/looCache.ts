import fs from 'fs';
import path from 'path';
import { getServerPageMinimumViableLooResponse } from './api-client/staticPage';

const LOO_CACHE_PATH = path.resolve('.loos');

export default async function getStaticPropsAllLoos() {
  let cachedData;

  try {
    cachedData = JSON.parse(fs.readFileSync(LOO_CACHE_PATH, 'utf8'));
  } catch (error) {
    console.log('Member cache not initialized');
  }

  if (!cachedData) {
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

    try {
      fs.writeFileSync(LOO_CACHE_PATH, JSON.stringify(data), 'utf8');
      console.log('Wrote to loos cache');
    } catch (error) {
      console.log('ERROR WRITING LOOS CACHE TO FILE');
      console.log(error);
    }

    cachedData = data;
  }

  return cachedData;
}
