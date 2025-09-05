import { supabase } from '../database/client.js';
import type { ExpenseRow } from '../database/client.js';

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

export interface ExpenseSearchResult {
  expenses: Pick<ExpenseRow, 'id' | 'amount' | 'category' | 'description' | 'created_at'>[];
  total_amount: number;
  total_count: number;
}

export interface ExpenseSearchFilters {
  category?: string;
  startDate?: string;
  endDate?: string;
}

// Category mapping for user-friendly names
const CATEGORY_LABELS: Record<string, string> = {
  investment: 'Investment',
  food: 'Food & Dining',
  transport: 'Transportation',
  shopping: 'Shopping',
  loan: 'Loan',
  medical: 'Medical',
  bill: 'Bills',
  travel: 'Travel',
  houseExpense: 'House Expense',
  others: 'Others'
};

export class ExpenseService {
  /**
   * Get monthly expenses grouped by category
   */
  async getMonthlyExpensesByCategory(
    month: string,
    year: string,
    userId: string
  ): Promise<MonthlyExpenseData> {
    try {
      // Validate input
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      
      if (monthNum < 1 || monthNum > 12) {
        throw new Error('Month must be between 01 and 12');
      }
      
      if (yearNum < 2000 || yearNum > new Date().getFullYear() + 1) {
        throw new Error('Invalid year');
      }
      
      // Calculate date range for the month
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const lastDay = new Date(yearNum, monthNum, 0).getDate();
      const endDate = `${year}-${month.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
      
      console.log(`Fetching expenses for user ${userId} from ${startDate} to ${endDate}`);
      
      // Query expenses for the specific month and user
      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('amount, category, created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Database query error:', error);
        throw new Error(`Failed to fetch expenses: ${error.message}`);
      }
      
      if (!expenses || expenses.length === 0) {
        return {
          month,
          year,
          categories: [],
          total_expenses: 0,
          total_count: 0
        };
      }
      
      // Group expenses by category
      const categoryTotals: Record<string, { amount: number; count: number }> = {};
      let totalAmount = 0;
      
      expenses.forEach((expense: Pick<ExpenseRow, 'amount' | 'category'>) => {
        const category = expense.category || 'others';
        const amount = Number(expense.amount) || 0;
        
        if (!categoryTotals[category]) {
          categoryTotals[category] = { amount: 0, count: 0 };
        }
        
        categoryTotals[category].amount += amount;
        categoryTotals[category].count += 1;
        totalAmount += amount;
      });
      
      // Convert to array and calculate percentages
      const categories: CategoryExpense[] = Object.entries(categoryTotals)
        .map(([category, data]) => ({
          category,
          category_label: CATEGORY_LABELS[category] || category,
          total_amount: Number(data.amount.toFixed(2)),
          expense_count: data.count,
          percentage: totalAmount > 0 ? Number(((data.amount / totalAmount) * 100).toFixed(2)) : 0
        }))
        .sort((a, b) => b.total_amount - a.total_amount); // Sort by amount descending
      
      return {
        month,
        year,
        categories,
        total_expenses: Number(totalAmount.toFixed(2)),
        total_count: expenses.length
      };
    } catch (error) {
      console.error('Error in getMonthlyExpensesByCategory:', error);
      throw error;
    }
  }
  
  /**
   * Get expense summary for a user
   */
  async getExpenseSummary(userId: string) {
    try {
      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('amount, category, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        throw new Error(`Failed to fetch expense summary: ${error.message}`);
      }
      
      const totalExpenses = (expenses as Pick<ExpenseRow, 'amount' | 'category'>[])?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
      const categories = [...new Set((expenses as Pick<ExpenseRow, 'amount' | 'category'>[])?.map(exp => exp.category) || [])];
      
      return {
        total_expenses: Number(totalExpenses.toFixed(2)),
        total_count: expenses?.length || 0,
        categories_used: categories,
        recent_expenses: expenses?.slice(0, 5) || []
      };
    } catch (error) {
      console.error('Error in getExpenseSummary:', error);
      throw error;
    }
  }

  /**
   * Get expenses for a specific category and month/year
   */
  async getCategoryExpensesForMonth(
    userId: string,
    category: string,
    month?: string,
    year?: string
  ) {
    try {
      const currentDate = new Date();
      const targetMonth = month || (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const targetYear = year || currentDate.getFullYear().toString();
      
      // Validate inputs
      const monthNum = parseInt(targetMonth, 10);
      const yearNum = parseInt(targetYear, 10);
      
      if (monthNum < 1 || monthNum > 12) {
        throw new Error('Month must be between 01 and 12');
      }
      
      if (yearNum < 2000 || yearNum > new Date().getFullYear() + 1) {
        throw new Error('Invalid year');
      }
      
      // Calculate date range for the month (or entire year if no month specified)
      let startDate: string;
      let endDate: string;
      
      if (month) {
        startDate = `${targetYear}-${targetMonth.padStart(2, '0')}-01`;
        const lastDay = new Date(yearNum, monthNum, 0).getDate();
        endDate = `${targetYear}-${targetMonth.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
      } else {
        // Entire year
        startDate = `${targetYear}-01-01`;
        endDate = `${targetYear}-12-31`;
      }
      
      console.log(`Fetching ${category} expenses for user ${userId} from ${startDate} to ${endDate}`);
      
      // Query expenses for the specific category, period, and user
      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('id, amount, category, description, created_at')
        .eq('user_id', userId)
        .eq('category', category)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Database query error:', error);
        throw new Error(`Failed to fetch ${category} expenses: ${error.message}`);
      }
      
      const totalAmount = (expenses || []).reduce((sum, exp) => sum + Number(exp.amount), 0);
      
      return {
        category,
        category_label: CATEGORY_LABELS[category] || category,
        expenses: expenses || [],
        total_amount: Number(totalAmount.toFixed(2)),
        expense_count: expenses?.length || 0,
        period: month ? `${targetMonth}/${targetYear}` : targetYear
      };
    } catch (error) {
      console.error(`Error in getCategoryExpensesForMonth:`, error);
      throw error;
    }
  }

  /**
   * Search expenses with flexible filters
   */
  async searchExpenses(
    userId: string,
    filters: ExpenseSearchFilters
  ): Promise<ExpenseSearchResult> {
    try {
      console.log(`Searching expenses for user ${userId} with filters:`, filters);
      
      // Build query
      let query = supabase
        .from('expenses')
        .select('id, amount, category, description, created_at')
        .eq('user_id', userId);
      
      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      
      // Execute query
      const { data: expenses, error } = await query
        .order('created_at', { ascending: false })
        .limit(100); // Limit to prevent large responses
      
      if (error) {
        console.error('Database query error:', error);
        throw new Error(`Failed to search expenses: ${error.message}`);
      }
      
      const totalAmount = (expenses || []).reduce((sum, exp) => sum + Number(exp.amount), 0);
      
      return {
        expenses: expenses || [],
        total_amount: Number(totalAmount.toFixed(2)),
        total_count: expenses?.length || 0
      };
    } catch (error) {
      console.error('Error in searchExpenses:', error);
      throw error;
    }
  }
}