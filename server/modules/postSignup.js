const db = require('../database');

const postSignup = (req, res, next) => {
  const { username } = req.body;
  const sql = `
  select "username",
          "userId"
    from "users"
    where lower("username") = lower($1)
  `;
  const params = [username];
  db.query(sql, params)
    .then(result => {
      if (result.rows.length === 0) {
        const sql = `
          insert into "users" ("userId", "username")
              values  (default, $1)
            returning *
        `;
        return db.query(sql, params)
          .then(result => {
            return result.rows[0];
          });
      } else {
        return result.rows[0];
      }
    })
    .then(result => {
      req.session.userId = result.userId;
      res.json(result);
    })
    .catch(err => next(err));
};

module.exports = postSignup;
