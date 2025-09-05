# 🚀 MCP Expense Server

A **proper** Model Context Protocol (MCP) server for natural language expense queries. This server uses the official `@modelcontextprotocol/sdk` and allows users to ask questions about their expenses in natural language.

## ✨ Features

- 🧠 **Natural Language Processing**: Ask questions like "show me house expenses for February"
- 🔧 **MCP Tools**: Implements proper MCP tools for expense queries
- 🗄️ **Database Integration**: Direct connection to Supabase for real-time data
- 📊 **Smart Parsing**: Understands categories, months, years, and relative time
- 🎯 **Flexible Queries**: Support for various query patterns

## 🛠️ MCP Tools Available

### 1. `get_expenses`
Process natural language queries about expenses.

**Examples:**
- "get me house expenses for February"
- "show food costs last month" 
- "transport expenses this year"

### 2. `get_category_summary`
Get expense summary grouped by categories for a specific period.

### 3. `search_expenses`
Search expenses with specific filters (category, date range, etc.)

## 📝 Natural Language Query Examples

| Query | What it finds |
|-------|---------------|
| `"show me house expenses for February"` | House category expenses for February |
| `"food costs last month"` | Food expenses from previous month |
| `"transport expenses this year"` | All transport expenses for current year |
| `"medical bills in January"` | Medical expenses for January |
| `"shopping expenses for December 2024"` | Shopping expenses for specific month/year |
| `"get investment details for March"` | Investment category for March |

## 🏃‍♂️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update:
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
API_KEY=your_secure_api_key
```

### 3. Build and Test
```bash
# Build the server
npm run build

# Test query parsing
npx tsx src/test-queries.ts

# Run the MCP server (for client connections)
npm start
```

## 🔍 Testing Query Parser

The natural language parser can understand:

- **Categories**: house, food, transport, shopping, investment, loan, medical, bill, travel, others
- **Months**: January/Jan, February/Feb, March, etc.
- **Years**: 2024, 2025, etc.
- **Relative Time**: "last month", "this month", "this year"
- **Timeframes**: week, month, year, day

Test it:
```bash
npx tsx src/test-queries.ts
```

## 🌐 Frontend Integration

The frontend uses `MCPBridgeService` which:
1. Parses natural language queries
2. Executes database queries based on intent
3. Formats responses in a user-friendly way
4. Provides example queries for users

### Usage in React:
```typescript
import { mcpBridgeService } from '@/services/MCPBridgeService';

// Process a natural language query
const result = await mcpBridgeService.processNaturalLanguageQuery(
  "show me house expenses for February"
);

console.log(result.data); // Formatted response
```

## 📊 Response Format

The server returns formatted text responses like:

```
🏠 House Expense Expenses for February 2025

💰 Total Amount: ₹15,450
📊 Transaction Count: 12

Recent Transactions:
• ₹8,500 - Monthly rent (2/15/2025)
• ₹2,500 - Electricity bill (2/10/2025)
• ₹1,200 - Water bill (2/8/2025)
```

## 🔧 Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│  MCP Bridge      │───▶│   Supabase      │
│   (React)       │    │  Service         │    │   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        │                        ▼                        │
        │              ┌──────────────────┐               │
        └──────────────│  Query Parser    │───────────────┘
                       │  (NLP)           │
                       └──────────────────┘
```

## 🚀 Deployment

This MCP server can be:
1. **Used as a library** in your existing Node.js application
2. **Deployed as a standalone service** to any Node.js hosting
3. **Connected to MCP clients** for AI assistant integration

## 🤖 MCP Client Integration

For AI assistants or MCP clients:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client({
  name: 'expense-client',
  version: '1.0.0'
});

// Connect to MCP server
await client.connect(transport);

// Use the tools
const result = await client.callTool({
  name: 'get_expenses',
  arguments: {
    query: 'show me food expenses for last month',
    user_id: 'user123'
  }
});
```

## 📁 Project Structure

```
mcp-expense-server/
├── src/
│   ├── config/           # Environment configuration
│   ├── database/         # Supabase client and types
│   ├── services/         # Business logic
│   │   ├── expenseService.ts  # Database operations
│   │   └── queryParser.ts     # Natural language parsing
│   ├── index.ts          # MCP server implementation
│   ├── test-queries.ts   # Query parser tests
│   └── client-test.ts    # MCP client tests
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Key Differences from Regular APIs

This is a **proper MCP server**, not just an HTTP API:

✅ **Uses MCP SDK**: Built with `@modelcontextprotocol/sdk`  
✅ **Implements MCP Tools**: Proper tool definitions and handlers  
✅ **Natural Language**: Processes human-like queries  
✅ **Stateless**: Each query is self-contained  
✅ **Standardized**: Follows MCP protocol specifications  

## 🔄 Query Processing Flow

1. **Input**: Natural language query (e.g., "house expenses for February")
2. **Parse**: Extract category, month, year, timeframe
3. **Query**: Build and execute database query
4. **Format**: Create user-friendly response
5. **Return**: Structured text response

## 🧪 Example Test Results

```bash
🧪 Testing Natural Language Query Parser

1. Query: "get me house expenses for february"
   → Category: houseExpense
   → Month: 02
   → Year: none
   → Timeframe: none

2. Query: "show food costs last month"  
   → Category: food
   → Month: 08
   → Year: 2025
   → Timeframe: month
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test with `npm run test`
4. Submit a pull request

## 📄 License

MIT License - feel free to use in your projects!

---

**🎉 Now you have a real MCP server that understands natural language queries about expenses!**