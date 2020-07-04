require('dotenv/config');
const express = require('express');

const db = require('./database');
const ClientError = require('./client-error');
const staticMiddleware = require('./static-middleware');
const sessionMiddleware = require('./session-middleware');

const getQuery = require('./modules/getQuery');
const getFiltered = require('./modules/getFiltered');
const getMusicalDetails = require('./modules/getMusicalDetails');
const getRelated = require('./modules/getRelated');
const postSignup = require('./modules/postSignup');
const postQuestionnaireSeeds = require('./modules/postQuestionnaireSeeds');
const getSeedMusicals = require('./modules/getSeedMusicals');
const postQuestionnaireLikes = require('./modules/postQuestionnaireLikes');
const getRecommendations = require('./modules/getRecommendations');
const getLikedMusical = require('./modules/getLikedMusical');
const postLikedMusical = require('./modules/postLikedMusical');
const deleteLikedMusical = require('./modules/deleteLikedMusical');
const getHomePage = require('./modules/getHomePage');
const postMusicalToCollection = require('./modules/postMusicalToCollection');
const getCollections = require('./modules/getCollections');
const getACollection = require('./modules/getACollection');
const deleteMusicalFromCollection = require('./modules/deleteMusicalFromCollection');
const deleteCollection = require('./modules/deleteCollection');
const updateCollection = require('./modules/updateCollection');
const postSuggestion = require('./modules/postSuggestion');

const app = express();

app.use(staticMiddleware);
app.use(sessionMiddleware);

app.use(express.json());

app.get('/api/health-check', (req, res, next) => {
  db.query('select \'successfully connected\' as "message"')
    .then(result => res.json(result.rows[0]))
    .catch(err => next(err));
});

app.get('/api/search/:query', getQuery);

app.get('/api/filter/:tag/:genre/:musicalStyle', getFiltered);

app.get('/api/musicals/:musicalId', getMusicalDetails);

app.get('/api/musicals/:musicalId/related', getRelated);

app.post('/api/signup', postSignup);

app.post('/api/questionaire/seeds', postQuestionnaireSeeds);

app.get('/api/questionaire/seedMusicals', getSeedMusicals);

app.post('/api/questionaire/like', postQuestionnaireLikes);

app.get('/api/recommendations', getRecommendations);

app.get('/api/musicals/:musicalId/like', getLikedMusical);

app.post('/api/musicals/:musicalId/like', postLikedMusical);

app.delete('/api/musicals/:musicalId/like', deleteLikedMusical);

app.get('/api/home', getHomePage);

app.post('/api/collections/:musicalId', postMusicalToCollection);

app.get('/api/collections', getCollections);

app.get('/api/collections/:collectionId', getACollection);

app.delete('/api/collections/:collectionId/:musicalId', deleteMusicalFromCollection);

app.delete('/api/collections/:collectionId', deleteCollection);

app.put('/api/collections/:collectionId', updateCollection);

app.post('/api/suggestions', postSuggestion);

app.use('/api', (req, res, next) => {
  next(new ClientError(`cannot ${req.method} ${req.originalUrl}`, 404));
});

app.use((err, req, res, next) => {
  if (err instanceof ClientError) {
    res.status(err.status).json({ error: err.message });
  } else {
    console.error(err);
    res.status(500).json({
      error: 'an unexpected error occurred'
    });
  }
});

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Listening on port', process.env.PORT);
});
