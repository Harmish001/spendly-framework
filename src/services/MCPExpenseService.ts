import { supabase } from "@/integrations/supabase/client";

// Types for MCP server responses
export interface CategoryExpense {
  category: string;
  category_label: string;
  total_amount: number;
  expense_count: number;
  percentage: number;
}

export interface MonthlyExpenseData {
  month: string;
  year: string;
  categories: CategoryExpense[];
  total_expenses: number;
  total_count: number;
}

export interface MCPResponse<T> {
  success: boolean;
  data: T;
  metadata?: {
    request_time: string;
    user_id: string;
    period?: string;
  };
  error?: string;
  message?: string;
}

// Configuration for MCP server
const MCP_SERVER_CONFIG = {
  baseUrl: import.meta.env.VITE_MCP_SERVER_URL || 'http://localhost:3001',
  apiKey: import.meta.env.VITE_MCP_API_KEY || 'mcp-expense-server-2025-secure-key-change-this',
  timeout: 10000, // 10 seconds
};

export class MCPExpenseService {
  private async makeRequest<T>(endpoint: string, params: Record<string, string>): Promise<T> {
    try {
      // Get current user for authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Build URL with query parameters
      const url = new URL(`${MCP_SERVER_CONFIG.baseUrl}/api/expenses${endpoint}`);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      console.log(`Making MCP request to: ${url.toString()}`);

      // Make the request
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': MCP_SERVER_CONFIG.apiKey,
          // You can also use Authorization header if you implement JWT
          // 'Authorization': `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(MCP_SERVER_CONFIG.timeout),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result: MCPResponse<T> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'MCP server returned an error');
      }

      return result.data;
    } catch (error) {
      console.error('MCP request failed:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - MCP server may be unavailable');
        }
        throw error;
      }
      
      throw new Error('Unknown error occurred while contacting MCP server');
    }
  }

  /**
   * Fetch monthly expenses grouped by category using MCP server
   */
  async getMonthlyExpensesByCategory(month: string, year: string): Promise<MonthlyExpenseData> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate inputs
      const monthNum = parseInt(month, 10);
      if (monthNum < 1 || monthNum > 12) {
        throw new Error('Month must be between 1 and 12');
      }

      const formattedMonth = month.padStart(2, '0');
      
      return await this.makeRequest<MonthlyExpenseData>('/monthly-by-category', {
        month: formattedMonth,
        year: year,
        user_id: user.id,
      });
    } catch (error) {
      console.error('Failed to fetch monthly expenses by category:', error);
      throw error;
    }
  }

  /**
   * Get expense summary using MCP server
   */
  async getExpenseSummary() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      return await this.makeRequest('/summary', {
        user_id: user.id,
      });
    } catch (error) {
      console.error('Failed to fetch expense summary:', error);
      throw error;
    }
  }

  /**
   * Test connection to MCP server
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${MCP_SERVER_CONFIG.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout for health check
      });
      
      return response.ok;
    } catch (error) {
      console.error('MCP server health check failed:', error);
      return false;
    }
  }

  /**
   * Get MCP server status
   */
  async getServerStatus() {
    try {
      const response = await fetch(`${MCP_SERVER_CONFIG.baseUrl}/health`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`Server responded with status: ${response.status}`);
    } catch (error) {
      return {
        status: 'unavailable',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Export singleton instance
export const mcpExpenseService = new MCPExpenseService();