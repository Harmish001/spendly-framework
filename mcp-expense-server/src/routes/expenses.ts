import { Router } from 'express';
import { z } from 'zod';
import { ExpenseService } from '../services/expenseService.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const expenseService = new ExpenseService();

// Validation schemas
const monthlyExpensesQuerySchema = z.object({
  month: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Month must be in MM format (01-12)'),
  year: z.string().regex(/^\d{4}$/, 'Year must be in YYYY format'),
  user_id: z.string().min(1, 'User ID is required')
});

const expenseSummaryQuerySchema = z.object({
  user_id: z.string().min(1, 'User ID is required')
});

/**
 * GET /api/expenses/monthly-by-category
 * Get monthly expenses grouped by category
 */
router.get('/monthly-by-category', async (req: AuthenticatedRequest, res) => {
  try {
    // Validate query parameters
    const { month, year, user_id } = monthlyExpensesQuerySchema.parse(req.query);
    
    console.log(`Request: Monthly expenses for user ${user_id}, ${month}/${year}`);
    
    // Get data from service
    const data = await expenseService.getMonthlyExpensesByCategory(month, year, user_id);
    
    res.json({
      success: true,
      data,
      metadata: {
        request_time: new Date().toISOString(),
        user_id,
        period: `${month}/${year}`
      }
    });
  } catch (error) {
    console.error('Error in monthly-by-category route:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * GET /api/expenses/summary
 * Get expense summary for a user
 */
router.get('/summary', async (req: AuthenticatedRequest, res) => {
  try {
    const { user_id } = expenseSummaryQuerySchema.parse(req.query);
    
    console.log(`Request: Expense summary for user ${user_id}`);
    
    const data = await expenseService.getExpenseSummary(user_id);
    
    res.json({
      success: true,
      data,
      metadata: {
        request_time: new Date().toISOString(),
        user_id
      }
    });
  } catch (error) {
    console.error('Error in summary route:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export { router as expenseRoutes };