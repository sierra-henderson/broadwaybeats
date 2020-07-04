const db = require('../database');

const getCollections = (req, res, next) => {
  const { userId } = req.session;
  const sql = `
    select "c"."name",
           "c"."collectionId",
           "c"."imageUrl",
           count("ci"."musicalId") as "numMusicals"
      from "collections" as "c"
      left join "collectionItems" as "ci" using ("collectionId")
    where "c"."userId" = $1
    group by "c"."name", "c"."collectionId"
  `;
  const params = [userId];
  db.query(sql, params)
    .then(result => {
      res.json(result.rows);
    })
    .catch(err => next(err));
};

module.exports = getCollections;
