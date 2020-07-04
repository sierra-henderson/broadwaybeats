const db = require('../database');
const ClientError = require('../client-error');

const getMusicalDetails = (req, res, next) => {
  const { musicalId } = req.params;
  const sql = `
      select *
      from "musicals"
      where "musicalId" = $1
      `;
  const params = [musicalId];
  db.query(sql, params)
    .then(result => {
      const musical = result.rows[0];
      if (!musical) {
        next(new ClientError(`musicalId ${musicalId} does not exist`, 400));
      } else {
        res.json(musical);
      }
    })
    .catch(err => next(err));
};

module.exports = getMusicalDetails;
