import { supabase } from "@/integrations/supabase/client";

interface ParsedQuery {
    category?: string;
    month?: string;
    year?: string;
    originalQuery: string;
}

interface Expense {
    amount: number;
    description?: string;
    created_at: string;
}

interface Category {
    category: string;
    total_amount: number;
    expense_count: number;
    percentage: number;
}

interface CategoryMonthResult {
    type: 'category_month';
    category: string;
    month: string;
    year: string;
    expenses: Expense[];
    total_amount: number;
    expense_count: number;
}

interface MonthlySummaryResult {
    type: 'monthly_summary';
    month: string;
    year: string;
    categories: Category[];
    total_expenses: number;
    total_count: number;
}

interface SummaryResult {
    type: 'summary';
    total_expenses: number;
    total_count: number;
    recent_expenses: Expense[];
}

type QueryResult = CategoryMonthResult | MonthlySummaryResult | SummaryResult;

export interface MCPQueryRequest {
    query: string;
    user_id?: string;
}

export interface MCPQueryResult {
    success: boolean;
    data: string;
    error?: string;
}

/**
 * Bridge service to communicate with MCP server through natural language
 * This service handles the translation between frontend requests and MCP server
 */
export class MCPBridgeService {
    private serverUrl: string;
    private isServerAvailable: boolean = false;

    constructor() {
        this.serverUrl = import.meta.env.VITE_MCP_SERVER_URL || 'http://localhost:3002';
    }

    /**
     * Check if MCP server is available (for now, we'll simulate this)
     */
    async checkServerStatus(): Promise<boolean> {
        try {
            // For this demo, we'll simulate MCP functionality using direct database queries
            // In a real implementation, this would connect to the actual MCP server
            this.isServerAvailable = true;
            return true;
        } catch (error) {
            console.error('MCP server not available:', error);
            this.isServerAvailable = false;
            return false;
        }
    }

    /**
     * Process natural language query and return formatted response
     */
    async processNaturalLanguageQuery(query: string): Promise<MCPQueryResult> {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            console.log(`Processing MCP query: "${query}" for user ${user.id}`);

            // Parse the query (simplified version of what the MCP server would do)
            const parsedQuery = this.parseQuery(query);

            // Execute the query based on parsed intent
            const result = await this.executeQuery(parsedQuery, user.id);

            // Format the response in a user-friendly way
            const formattedResponse = this.formatResponse(result, parsedQuery);

            return {
                success: true,
                data: formattedResponse
            };

        } catch (error) {
            console.error('Error processing MCP query:', error);
            return {
                success: false,
                data: '',
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    private parseQuery(query: string) {
        const normalizedQuery = query.toLowerCase().trim();

        // Extract category
        const categories = {
            house: ['house', 'home', 'rent', 'maintenance', 'household'],
            food: ['food', 'dining', 'restaurant', 'meal', 'grocery'],
            transport: ['transport', 'travel', 'uber', 'taxi', 'fuel', 'gas'],
            shopping: ['shopping', 'shop', 'purchase', 'buy', 'store'],
            investment: ['investment', 'invest', 'stock', 'mutual fund'],
            loan: ['loan', 'emi', 'credit', 'debt'],
            medical: ['medical', 'health', 'hospital', 'doctor', 'medicine'],
            bill: ['bill', 'electricity', 'water', 'phone', 'utility'],
            travel: ['travel', 'trip', 'vacation', 'hotel', 'flight'],
            others: ['other', 'others', 'miscellaneous']
        };

        let detectedCategory = '';
        for (const [category, keywords] of Object.entries(categories)) {
            for (const keyword of keywords) {
                if (normalizedQuery.includes(keyword)) {
                    detectedCategory = category === 'house' ? 'houseExpense' : category;
                    break;
                }
            }
            if (detectedCategory) break;
        }

        // Extract month
        const months = {
            'january': '01', 'jan': '01',
            'february': '02', 'feb': '02',
            'march': '03', 'mar': '03',
            'april': '04', 'apr': '04',
            'may': '05',
            'june': '06', 'jun': '06',
            'july': '07', 'jul': '07',
            'august': '08', 'aug': '08',
            'september': '09', 'sep': '09',
            'october': '10', 'oct': '10',
            'november': '11', 'nov': '11',
            'december': '12', 'dec': '12'
        };

        let detectedMonth = '';
        let detectedYear = new Date().getFullYear().toString();

        for (const [monthName, monthCode] of Object.entries(months)) {
            if (normalizedQuery.includes(monthName)) {
                detectedMonth = monthCode;
                break;
            }
        }

        // Handle relative time
        const currentDate = new Date();
        if (normalizedQuery.includes('last month')) {
            const lastMonth = currentDate.getMonth();
            detectedMonth = (lastMonth + 1).toString().padStart(2, '0');
            if (lastMonth === 0) {
                detectedYear = (currentDate.getFullYear() - 1).toString();
            }
        } else if (normalizedQuery.includes('this month')) {
            detectedMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        }

        // Extract year
        const yearMatch = normalizedQuery.match(/\b(20\d{2})\b/);
        if (yearMatch) {
            detectedYear = yearMatch[1];
        }

        return {
            category: detectedCategory,
            month: detectedMonth,
            year: detectedYear,
            originalQuery: query
        };
    }

    private async executeQuery(parsedQuery: ParsedQuery, userId: string): Promise<QueryResult> {
        const { category, month, year } = parsedQuery;

        if (category && month) {
            // Get specific category for specific month
            return await this.getCategoryExpensesForMonth(userId, category, month, year);
        } else if (month) {
            // Get all categories for specific month
            return await this.getMonthlyExpensesByCategory(userId, month, year);
        } else if (category) {
            // Get category expenses for current month
            const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
            return await this.getCategoryExpensesForMonth(userId, category, currentMonth, year);
        } else {
            // Get general summary
            return await this.getExpenseSummary(userId);
        }
    }

    private async getCategoryExpensesForMonth(userId: string, category: string, month: string, year: string): Promise<CategoryMonthResult> {
        try {
            const startDate = `${year}-${month.padStart(2, '0')}-01`;
            const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
            const endDate = `${year}-${month.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

            const { data: expenses, error } = await supabase
                .from('expenses')
                .select('id, amount, category, description, created_at')
                .eq('user_id', userId)
                .eq('category', category)
                .gte('created_at', startDate)
                .lte('created_at', endDate)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const totalAmount = (expenses || []).reduce((sum, exp) => sum + Number(exp.amount), 0);

            return {
                type: 'category_month',
                category,
                month,
                year,
                expenses: expenses || [],
                total_amount: totalAmount,
                expense_count: expenses?.length || 0
            };
        } catch (error) {
            throw new Error(`Failed to fetch ${category} expenses: ${error}`);
        }
    }

    private async getMonthlyExpensesByCategory(userId: string, month: string, year: string): Promise<MonthlySummaryResult> {
        try {
            const startDate = `${year}-${month.padStart(2, '0')}-01`;
            const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
            const endDate = `${year}-${month.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

            const { data: expenses, error } = await supabase
                .from('expenses')
                .select('amount, category, created_at')
                .eq('user_id', userId)
                .gte('created_at', startDate)
                .lte('created_at', endDate)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Group by category
            const categoryTotals: Record<string, { amount: number; count: number }> = {};
            let totalAmount = 0;

            (expenses || []).forEach(expense => {
                const cat = expense.category || 'others';
                if (!categoryTotals[cat]) {
                    categoryTotals[cat] = { amount: 0, count: 0 };
                }
                categoryTotals[cat].amount += Number(expense.amount);
                categoryTotals[cat].count += 1;
                totalAmount += Number(expense.amount);
            });

            const categories = Object.entries(categoryTotals).map(([cat, data]) => ({
                category: cat,
                total_amount: data.amount,
                expense_count: data.count,
                percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
            }));

            return {
                type: 'monthly_summary',
                month,
                year,
                categories,
                total_expenses: totalAmount,
                total_count: expenses?.length || 0
            };
        } catch (error) {
            throw new Error(`Failed to fetch monthly expenses: ${error}`);
        }
    }

    private async getExpenseSummary(userId: string): Promise<SummaryResult> {
        try {
            const { data: expenses, error } = await supabase
                .from('expenses')
                .select('amount, category, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;

            const totalExpenses = (expenses || []).reduce((sum, exp) => sum + Number(exp.amount), 0);

            return {
                type: 'summary',
                total_expenses: totalExpenses,
                total_count: expenses?.length || 0,
                recent_expenses: expenses?.slice(0, 5) || []
            };
        } catch (error) {
            throw new Error(`Failed to fetch expense summary: ${error}`);
        }
    }

    private formatResponse(result: QueryResult, parsedQuery: ParsedQuery): string {
        const categoryLabels: Record<string, string> = {
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

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        if (result.type === 'category_month') {
            const categoryLabel = categoryLabels[result.category] || result.category;
            const monthName = monthNames[parseInt(result.month) - 1];

            let response = `🏠 **${categoryLabel} Expenses for ${monthName} ${result.year}**\n\n`;
            response += `💰 **Total Amount:** ₹${result.total_amount.toLocaleString()}\n`;
            response += `📊 **Transaction Count:** ${result.expense_count}\n\n`;

            if (result.expenses.length > 0) {
                response += `**Recent Transactions:**\n`;
                (result.expenses as Expense[]).slice(0, 5).forEach((exp) => {
                    const date = new Date(exp.created_at).toLocaleDateString();
                    response += `• ₹${exp.amount} - ${exp.description || 'No description'} (${date})\n`;
                });

                if (result.expenses.length > 5) {
                    response += `\n... and ${result.expenses.length - 5} more transactions`;
                }
            } else {
                response += 'No transactions found for this period.';
            }

            return response;
        }

        if (result.type === 'monthly_summary') {
            const monthName = monthNames[parseInt(result.month) - 1];

            let response = `📊 **Expense Summary for ${monthName} ${result.year}**\n\n`;
            response += `💰 **Total Expenses:** ₹${result.total_expenses.toLocaleString()}\n`;
            response += `📈 **Total Transactions:** ${result.total_count}\n\n`;

            if (result.categories.length > 0) {
                response += `**Category Breakdown:**\n`;
                result.categories
                    .sort((a: Category, b: Category) => b.total_amount - a.total_amount)
                    .forEach((cat: Category) => {
                        const label = categoryLabels[cat.category] || cat.category;
                        response += `• **${label}**: ₹${cat.total_amount.toLocaleString()} (${cat.percentage.toFixed(1)}%) - ${cat.expense_count} transactions\n`;
                    });
            } else {
                response += 'No expenses found for this period.';
            }

            return response;
        }

        // Default summary
        return `📋 **Expense Summary**\n\nTotal: ₹${result.total_expenses?.toLocaleString() || '0'}\nTransactions: ${result.total_count || 0}`;
    }

    /**
     * Get example queries for users
     */
    getExampleQueries(): string[] {
        return [
            "Show me house expenses for February",
            "Get food costs for last month",
            "Transport expenses this year",
            "Medical bills in January",
            "Shopping expenses for December 2024",
            "Show all expenses for this month",
            "Get investment details for March"
        ];
    }
}

// Export singleton instance
export const mcpBridgeService = new MCPBridgeService();