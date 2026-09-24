const db = require('../config/db');

async function notify(userId, title, message) {
  if (!userId) return;
  await db.query(
    'INSERT INTO notifications(user_id,title,message) VALUES($1,$2,$3)',
    [userId, title, message]
  );
}
module.exports = { notify };
