'use server';

import { DataService } from '@/lib/services/data-service';

/**
 * Fetch all data from a table
 * @param tableName - Name of the table to query
 */
export async function fetchTableData(tableName: string) {
  return await DataService.getData(tableName);
}

/**
 * Fetch data with a custom SQL query
 * @param query - SQL query string (use $1, $2, etc. for parameters)
 * @param params - Array of parameter values
 */
export async function fetchCustomData(query: string, params?: unknown[]) {
  return await DataService.getDataWithFilter(query, params);
}

/**
 * Get a single record by ID
 * @param tableName - Name of the table
 * @param id - Record ID
 */
export async function fetchDataById(tableName: string, id: number | string) {
  return await DataService.getById(tableName, id);
}

/**
 * Insert a new record
 * @param tableName - Name of the table
 * @param data - Object with column names as keys
 */
export async function insertData(tableName: string, data: Record<string, unknown>) {
  return await DataService.insert(tableName, data);
}

/**
 * Update an existing record
 * @param tableName - Name of the table
 * @param id - Record ID
 * @param data - Object with column names as keys
 */
export async function updateData(tableName: string, id: number | string, data: Record<string, unknown>) {
  return await DataService.update(tableName, id, data);
}

/**
 * Delete a record
 * @param tableName - Name of the table
 * @param id - Record ID
 */
export async function deleteData(tableName: string, id: number | string) {
  return await DataService.delete(tableName, id);
}
