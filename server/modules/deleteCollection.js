const db = require('../database');
const ClientError = require('../client-error');

const deleteCollection = (req, res, next) => {
  const { collectionId } = req.params;
  if (isNaN(parseInt(collectionId))) {
    next(new ClientError('collectionId must be an integer', 400));
  }
  const sql = `
  delete from "collectionItems"
    where "collectionId" = $1
    returning *
  `;
  const params = [collectionId];
  db.query(sql, params)
    .then(result => {
      const sql = `
      delete from "collections"
        where "collectionId" = $1
        returning *
      `;
      return db.query(sql, params)
        .then(result => {
          return result.rows[0];
        });
    })
    .then(result => {
      res.json(result);
    })
    .catch(err => next(err));
};

module.exports = deleteCollection;
