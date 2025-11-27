import { 
  fetchDataFromTable, 
  fetchDataWithQuery, 
  fetchSingleRow,
  executeQuery
} from '@/lib/repositories/data-repository';

export class DataService {
  /**
   * Get all data from a table
   */
  static async getData(tableName: string) {
    try {
      const data = await fetchDataFromTable(tableName);
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch data' 
      };
    }
  }

  /**
   * Get data with custom SQL query
   */
  static async getDataWithFilter(query: string, params?: unknown[]) {
    try {
      const data = await fetchDataWithQuery(query, params);
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch data' 
      };
    }
  }

  /**
   * Get a single row by ID
   */
  static async getById(tableName: string, id: number | string) {
    try {
      const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');
      const data = await fetchSingleRow(
        `SELECT * FROM ${sanitizedTableName} WHERE id = $1`,
        [id]
      );
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching data by ID:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch data' 
      };
    }
  }

  /**
   * Insert data into a table
   */
  static async insert(tableName: string, data: Record<string, unknown>) {
    try {
      const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');
      const columns = Object.keys(data).join(', ');
      const values = Object.values(data);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      
      const query = `INSERT INTO ${sanitizedTableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
      const result = await fetchSingleRow(query, values);
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error inserting data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to insert data' 
      };
    }
  }

  /**
   * Update data in a table
   */
  static async update(tableName: string, id: number | string, data: Record<string, unknown>) {
    try {
      const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');
      const entries = Object.entries(data);
      const setClause = entries.map(([key], i) => `${key} = $${i + 1}`).join(', ');
      const values = [...entries.map(([, value]) => value), id];
      
      const query = `UPDATE ${sanitizedTableName} SET ${setClause} WHERE id = $${values.length} RETURNING *`;
      const result = await fetchSingleRow(query, values);
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error updating data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update data' 
      };
    }
  }

  /**
   * Delete data from a table
   */
  static async delete(tableName: string, id: number | string) {
    try {
      const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');
      const rowCount = await executeQuery(
        `DELETE FROM ${sanitizedTableName} WHERE id = $1`,
        [id]
      );
      
      return { success: true, deleted: rowCount > 0, rowCount };
    } catch (error) {
      console.error('Error deleting data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete data' 
      };
    }
  }
}
