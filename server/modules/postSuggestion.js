const db = require('../database');

const postSuggestion = (req, res, next) => {
  const { title, composer, notes } = req.body;
  const sql = `
  insert into "suggestions" ("title", "composer", "notes")
  values ($1, $2, $3)
  `;
  const params = [title, composer, notes];
  db.query(sql, params)
    .then(result => {
      res.json(result.rows);
    })
    .catch(err => next(err));
};
module.exports = postSuggestion;
