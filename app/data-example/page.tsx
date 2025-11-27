export default async function DataExamplePage() {
  // Example 1: Fetch all data from a table
  // const result = await fetchTableData('users');
  
  // Example 2: Fetch with custom query and parameters
  // const customResult = await fetchCustomData(
  //   'SELECT * FROM users WHERE email = $1',
  //   ['user@example.com']
  // );

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">PostgreSQL Data Example</h1>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Usage Examples</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">1. Fetch all records from a table:</h3>
            <code className="block bg-black text-green-400 p-3 rounded text-sm">
              const result = await fetchTableData(&apos;your_table_name&apos;);
            </code>
          </div>

          <div>
            <h3 className="font-medium mb-2">2. Fetch with custom query:</h3>
            <code className="block bg-black text-green-400 p-3 rounded text-sm">
              {`const result = await fetchCustomData(
  'SELECT * FROM users WHERE age > $1',
  [18]
);`}
            </code>
          </div>

          <div>
            <h3 className="font-medium mb-2">3. Insert data:</h3>
            <code className="block bg-black text-green-400 p-3 rounded text-sm">
              {`const result = await insertData('users', {
  name: 'John Doe',
  email: 'john@example.com'
});`}
            </code>
          </div>

          <div>
            <h3 className="font-medium mb-2">4. Update data:</h3>
            <code className="block bg-black text-green-400 p-3 rounded text-sm">
              {`const result = await updateData('users', 1, {
  name: 'Jane Doe'
});`}
            </code>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
          <p className="text-sm">
            <strong>Note:</strong> Update your <code>.env.local</code> file with your PostgreSQL credentials before using these features.
          </p>
        </div>
      </div>
    </div>
  );
}
