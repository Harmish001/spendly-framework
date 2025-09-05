import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { ExpenseService } from './services/expenseService.js';
import { QueryParser } from './services/queryParser.js';
import { config } from './config/index.js';

class ExpenseMCPServer {
  private server: Server;
  private expenseService: ExpenseService;
  private queryParser: QueryParser;

  constructor() {
    this.server = new Server(
      {
        name: 'expense-tracker',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.expenseService = new ExpenseService();
    this.queryParser = new QueryParser();
    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_expenses',
            description: 'Fetch expenses based on natural language query. Supports filtering by category (food, transport, shopping, investment, loan, medical, bill, travel, houseExpense, others), month, year, and date ranges.',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Natural language query for expenses (e.g., "get me house expenses for February", "show food costs last month", "transport expenses this year")',
                },
                user_id: {
                  type: 'string',
                  description: 'User identifier (required for data access)',
                },
              },
              required: ['query', 'user_id'],
            },
          },
          {
            name: 'get_category_summary',
            description: 'Get expense summary grouped by categories for a specific period',
            inputSchema: {
              type: 'object',
              properties: {
                month: {
                  type: 'string',
                  description: 'Month in MM format (01-12) or month name (January, February, etc.)',
                },
                year: {
                  type: 'string',
                  description: 'Year in YYYY format (e.g., 2024, 2025)',
                },
                user_id: {
                  type: 'string',
                  description: 'User identifier',
                },
              },
              required: ['user_id'],
            },
          },
          {
            name: 'search_expenses',
            description: 'Search expenses with specific filters',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  description: 'Expense category: investment, food, transport, shopping, loan, medical, bill, travel, houseExpense, others',
                },
                start_date: {
                  type: 'string',
                  description: 'Start date in YYYY-MM-DD format',
                },
                end_date: {
                  type: 'string',
                  description: 'End date in YYYY-MM-DD format',
                },
                user_id: {
                  type: 'string',
                  description: 'User identifier',
                },
              },
              required: ['user_id'],
            },
          },
        ] as Tool[],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_expenses': {
            const { query, user_id } = args as { query: string; user_id: string };
            return await this.handleNaturalLanguageQuery(query, user_id);
          }

          case 'get_category_summary': {
            const { month, year, user_id } = args as {
              month?: string;
              year?: string;
              user_id: string;
            };
            return await this.handleCategorySummary(user_id, month, year);
          }

          case 'search_expenses': {
            const { category, start_date, end_date, user_id } = args as {
              category?: string;
              start_date?: string;
              end_date?: string;
              user_id: string;
            };
            return await this.handleExpenseSearch(user_id, category, start_date, end_date);
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        console.error(`Error handling tool ${name}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
            },
          ],
        };
      }
    });
  }

  private async handleNaturalLanguageQuery(query: string, userId: string) {
    try {
      console.log(`Processing natural language query: "${query}" for user ${userId}`);
      
      // Parse the natural language query
      const parsedQuery = this.queryParser.parseExpenseQuery(query);
      console.log('Parsed query:', parsedQuery);

      let result;
      
      if (parsedQuery.month && parsedQuery.category) {
        // Get specific category for specific month
        result = await this.expenseService.getCategoryExpensesForMonth(
          userId,
          parsedQuery.category,
          parsedQuery.month,
          parsedQuery.year || new Date().getFullYear().toString()
        );
      } else if (parsedQuery.month) {
        // Get all categories for specific month
        result = await this.expenseService.getMonthlyExpensesByCategory(
          parsedQuery.month,
          parsedQuery.year || new Date().getFullYear().toString(),
          userId
        );
      } else if (parsedQuery.category) {
        // Get category expenses for current month or year
        const currentDate = new Date();
        const month = parsedQuery.year ? undefined : (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const year = parsedQuery.year || currentDate.getFullYear().toString();
        
        result = await this.expenseService.getCategoryExpensesForMonth(
          userId,
          parsedQuery.category,
          month,
          year
        );
      } else {
        // Get general expense summary
        result = await this.expenseService.getExpenseSummary(userId);
      }

      // Format the response in a user-friendly way
      const formattedResponse = this.formatExpenseResponse(result, parsedQuery);

      return {
        content: [
          {
            type: 'text',
            text: formattedResponse,
          },
        ],
      };
    } catch (error) {
      console.error('Error in handleNaturalLanguageQuery:', error);
      throw error;
    }
  }

  private async handleCategorySummary(userId: string, month?: string, year?: string) {
    try {
      const currentDate = new Date();
      const targetMonth = month || (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const targetYear = year || currentDate.getFullYear().toString();

      // Convert month name to number if needed
      const monthNumber = this.queryParser.parseMonth(targetMonth);

      const result = await this.expenseService.getMonthlyExpensesByCategory(
        monthNumber,
        targetYear,
        userId
      );

      const monthName = new Date(parseInt(targetYear), parseInt(monthNumber) - 1).toLocaleString('default', { month: 'long' });
      
      let response = `📊 **Expense Summary for ${monthName} ${targetYear}**\n\n`;
      response += `💰 **Total Expenses:** ₹${result.total_expenses.toLocaleString()}\n`;
      response += `📈 **Total Transactions:** ${result.total_count}\n\n`;

      if (result.categories.length > 0) {
        response += `**Category Breakdown:**\n`;
        result.categories.forEach((cat, index) => {
          const emoji = this.getCategoryEmoji(cat.category);
          response += `${emoji} **${cat.category_label}**: ₹${cat.total_amount.toLocaleString()} (${cat.percentage}%) - ${cat.expense_count} transactions\n`;
        });
      } else {
        response += `No expenses found for this period.`;
      }

      return {
        content: [
          {
            type: 'text',
            text: response,
          },
        ],
      };
    } catch (error) {
      console.error('Error in handleCategorySummary:', error);
      throw error;
    }
  }

  private async handleExpenseSearch(
    userId: string,
    category?: string,
    startDate?: string,
    endDate?: string
  ) {
    try {
      const result = await this.expenseService.searchExpenses(userId, {
        category,
        startDate,
        endDate,
      });

      let response = `🔍 **Expense Search Results**\n\n`;
      
      if (category) {
        const categoryLabel = this.getCategoryLabel(category);
        response += `📂 **Category:** ${categoryLabel}\n`;
      }
      
      if (startDate || endDate) {
        response += `📅 **Date Range:** ${startDate || 'Start'} to ${endDate || 'End'}\n`;
      }

      response += `\n💰 **Total Amount:** ₹${result.total_amount.toLocaleString()}\n`;
      response += `📊 **Transaction Count:** ${result.expenses.length}\n\n`;

      if (result.expenses.length > 0) {
        response += `**Recent Transactions:**\n`;
        result.expenses.slice(0, 10).forEach((expense, index) => {
          const date = new Date(expense.created_at).toLocaleDateString();
          const emoji = this.getCategoryEmoji(expense.category);
          response += `${emoji} ₹${expense.amount} - ${expense.description || 'No description'} (${date})\n`;
        });
        
        if (result.expenses.length > 10) {
          response += `\n... and ${result.expenses.length - 10} more transactions`;
        }
      } else {
        response += `No expenses found matching your criteria.`;
      }

      return {
        content: [
          {
            type: 'text',
            text: response,
          },
        ],
      };
    } catch (error) {
      console.error('Error in handleExpenseSearch:', error);
      throw error;
    }
  }

  private formatExpenseResponse(result: any, parsedQuery: any): string {
    if (parsedQuery.category && parsedQuery.month) {
      // Specific category and month
      const categoryLabel = this.getCategoryLabel(parsedQuery.category);
      const monthName = this.getMonthName(parsedQuery.month);
      const emoji = this.getCategoryEmoji(parsedQuery.category);
      
      return `${emoji} **${categoryLabel} Expenses for ${monthName} ${parsedQuery.year || new Date().getFullYear()}**\n\n` +
             `💰 **Total Amount:** ₹${result.total_amount?.toLocaleString() || '0'}\n` +
             `📊 **Transaction Count:** ${result.expense_count || result.total_count || 0}\n\n` +
             (result.expenses?.length > 0 ? 
               `**Recent Transactions:**\n` + 
               result.expenses.slice(0, 5).map((exp: any) => 
                 `• ₹${exp.amount} - ${exp.description || 'No description'} (${new Date(exp.created_at).toLocaleDateString()})`
               ).join('\n') : 
               'No transactions found for this period.');
    }

    // Default formatting for other responses
    return JSON.stringify(result, null, 2);
  }

  private getCategoryEmoji(category: string): string {
    const emojis: Record<string, string> = {
      food: '🍽️',
      transport: '🚗',
      shopping: '🛍️',
      investment: '📈',
      loan: '💳',
      medical: '🏥',
      bill: '📄',
      travel: '✈️',
      houseExpense: '🏠',
      others: '📦',
    };
    return emojis[category] || '💰';
  }

  private getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      investment: 'Investment',
      food: 'Food & Dining',
      transport: 'Transportation',
      shopping: 'Shopping',
      loan: 'Loan',
      medical: 'Medical',
      bill: 'Bills',
      travel: 'Travel',
      houseExpense: 'House Expense',
      others: 'Others',
    };
    return labels[category] || category;
  }

  private getMonthName(month: string): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIndex = parseInt(month, 10) - 1;
    return months[monthIndex] || month;
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('💫 Expense MCP Server is running...');
    console.log('🎯 Available tools: get_expenses, get_category_summary, search_expenses');
    console.log('💬 Try queries like: "get me house expenses for February" or "show food costs last month"');
  }
}

// Start the server
const server = new ExpenseMCPServer();
server.run().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});