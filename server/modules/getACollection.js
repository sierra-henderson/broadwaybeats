const db = require('../database');
const ClientError = require('../client-error');

const getACollection = (req, res, next) => {
  const { collectionId } = req.params;
  if (isNaN(parseInt(collectionId))) {
    next(new ClientError('collectionId must be an integer', 400));
  }
  const sql = `
  select "c"."name" as "collectionName",
         "c"."collectionId",
         "m"."musicalId",
         "m"."title",
         "m"."musicBy",
         "m"."lyricsBy",
         "m"."imageUrl"
      from "collections" as "c"
      join "collectionItems" using ("collectionId")
      join "musicals" as "m" using ("musicalId")
    where "c"."collectionId" = $1
  `;
  const params = [collectionId];
  db.query(sql, params)
    .then(result => {
      if (result.rows.length === 0) {
        next(new ClientError(`collectionid ${collectionId} does not exist`, 400));
      } else {
        res.json(result.rows);
      }
    })
    .catch(err => next(err));
};

module.exports = getACollection;
