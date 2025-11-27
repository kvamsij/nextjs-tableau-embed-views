import pool from '@/lib/config/database';

export interface DataRow {
  [key: string]: unknown;
}

/**
 * Fetch all data from a specific table
 * @param tableName - Name of the table to query
 * @returns Array of rows from the table
 */
export async function fetchDataFromTable(tableName: string): Promise<DataRow[]> {
  const client = await pool.connect();
  try {
    // Use parameterized query to prevent SQL injection for table names
    // Note: Table names cannot be parameterized in pg, so we sanitize manually
    const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');
    const result = await client.query(`SELECT * FROM ${sanitizedTableName}`);
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Execute a custom SQL query with optional parameters
 * @param query - SQL query string (use $1, $2, etc. for parameters)
 * @param params - Array of parameter values
 * @returns Array of rows from the query result
 */
export async function fetchDataWithQuery(query: string, params?: unknown[]): Promise<DataRow[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Execute a query that returns a single row
 * @param query - SQL query string
 * @param params - Array of parameter values
 * @returns Single row or null
 */
export async function fetchSingleRow(query: string, params?: unknown[]): Promise<DataRow | null> {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(query, params);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Execute an INSERT, UPDATE, or DELETE query
 * @param query - SQL query string
 * @param params - Array of parameter values
 * @returns Number of affected rows
 */
export async function executeQuery(query: string, params?: unknown[]): Promise<number> {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rowCount || 0;
  } finally {
    client.release();
  }
}
