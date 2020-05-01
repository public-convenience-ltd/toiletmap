module.exports = {
  auth0: {
    userinfoUrl: 'https://gbptm.eu.auth0.com/userinfo',
    jwksUri: 'https://gbptm.eu.auth0.com/.well-known/jwks.json',
    audience: 'https://www.toiletmap.org.uk/graphql',
    issuer: 'https://gbptm.eu.auth0.com/',
    algorithms: ['RS256'],
    permissionsKey: 'https://toiletmap.org.uk/permissions',
    profileKey: 'https://toiletmap.org.uk/profile',
  },
  mapit: {
    apiKey: process.env.MAPIT_API_KEY,
    endpoint: 'http://mapit.mysociety.org/point/4326/',
    areaTypes: [
      'District council',
      'Unitary Authority',
      'Metropolitan district',
      'London borough',
    ],
  },
  graphql: {
    engine: {
      apiKey: process.env.ENGINE_API_KEY,
    },
    playground: {
      tabs: [
        {
          endpoint: '/api',
          name: 'Nearby Loos Query',
          query:
            'query loosNearNeontribe {\n\tloosByProximity(from: {lat: 52.6335, lng: 1.2953, maxDistance: 500}) {\n\t\tid\n\t\tname\n\t}\n}',
        },
      ],
    },
  },
  reports: {
    anonContributor: 'GBPTM Contributor',
  },
};
