import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

async function testMCPServer() {
  console.log('🚀 Starting MCP Expense Server Test...\n');

  // Start the MCP server as a subprocess
  const serverProcess = spawn('node', ['dist/index.js'], {
    cwd: process.cwd(),
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Create MCP client
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/index.js']
  });

  const client = new Client({
    name: 'expense-test-client',
    version: '1.0.0'
  }, {
    capabilities: {}
  });

  try {
    // Connect to the server
    await client.connect(transport);
    console.log('✅ Connected to MCP server');

    // List available tools
    const tools = await client.listTools();
    console.log('🛠️ Available tools:', tools.tools.map(t => t.name));

    // Test natural language queries
    const testQueries = [
      {
        query: 'get me house expenses for february',
        user_id: 'test-user-id'
      },
      {
        query: 'show food costs last month',
        user_id: 'test-user-id'
      },
      {
        query: 'transport expenses this year',
        user_id: 'test-user-id'
      }
    ];

    for (const testQuery of testQueries) {
      console.log(`\n🔍 Testing query: "${testQuery.query}"`);
      
      try {
        const result = await client.callTool({
          name: 'get_expenses',
          arguments: testQuery
        });
        
        console.log('✅ Result:', result.content[0].text);
      } catch (error) {
        console.error('❌ Error:', error);
      }
    }

  } catch (error) {
    console.error('❌ Failed to connect or test MCP server:', error);
  } finally {
    // Clean up
    await client.close();
    serverProcess.kill();
    console.log('\n🏁 Test completed');
  }
}

// Run the test
testMCPServer().catch(console.error);