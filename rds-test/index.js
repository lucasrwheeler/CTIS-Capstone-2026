const { Client } = require('pg');

exports.handler = async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    return { status: 'connected' };
  } catch (err) {
    return { error: err.message };
  } finally {
    await client.end();
  }
};