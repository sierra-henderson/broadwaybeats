const db = require('../database');
const ClientError = require('../client-error');

const updateCollection = (req, res, next) => {
  const { collectionId } = req.params;
  const { collectionName } = req.body;
  if (isNaN(parseInt(collectionId))) {
    next(new ClientError('collectionId must be an integer', 400));
  }
  const sql = `
    update "collections"
      set "name" = $1
    where "collectionId" = $2
  `;
  const params = [collectionName, collectionId];
  db.query(sql, params)
    .then(result => {
      res.json(result.rows);
    })
    .catch(err => next(err));
};

module.exports = updateCollection;
