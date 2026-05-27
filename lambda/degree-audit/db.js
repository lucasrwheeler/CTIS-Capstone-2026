/**
 * @file db.js
 * @description PostgreSQL client factory for Lambda functions.
 *
 * Creates a new pg.Client instance per invocation using credentials
 * injected via Lambda environment variables. Each Lambda call gets its
 * own client (not a pool) because Lambda execution environments are
 * single-threaded and short-lived — a connection pool would hold open
 * connections across invocations unnecessarily.
 *
 * The caller is responsible for calling client.connect() before queries
 * and client.end() in a finally block to release the connection.
 *
 * SSL is enabled with rejectUnauthorized: false to allow connections to
 * the AWS RDS instance without needing to distribute the RDS CA certificate
 * inside the Lambda zip. This is acceptable for internal VPC traffic.
 *
 * @module db
 * @requires pg - node-postgres
 *
 * @environment
 *   DB_HOST     - RDS PostgreSQL endpoint hostname
 *                 e.g. guilford-capstone-postgres.c47ye4w2eo4m.us-east-1.rds.amazonaws.com
 *   DB_USER     - Database username (e.g. "postgres")
 *   DB_PASSWORD - Database password (set in Lambda env vars, never in source)
 *   DB_NAME     - Database name
 *   DB_PORT     - Database port (typically "5432")
 */

const { Client } = require("pg");

/**
 * Creates and returns a new PostgreSQL client configured from environment variables.
 *
 * Does NOT connect — caller must await client.connect() before running queries.
 *
 * @returns {import('pg').Client} An unconnected pg.Client instance
 *
 * @example
 * const client = getClient();
 * await client.connect();
 * const result = await client.query("SELECT * FROM courses");
 * await client.end();
 */
function getClient() {
  return new Client({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:     parseInt(process.env.DB_PORT || "5432"),
    ssl:      { rejectUnauthorized: false }
  });
}

module.exports = { getClient };