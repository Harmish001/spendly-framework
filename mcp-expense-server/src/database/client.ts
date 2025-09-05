import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';

// Database types based on your existing schema
export interface ExpenseRow {
  id: string;
  amount: number;
  category: string;
  created_at: string;
  date: string;
  description: string | null;
  user_id: string;
}

export interface Database {
  public: {
    Tables: {
      expenses: {
        Row: ExpenseRow;
        Insert: Omit<ExpenseRow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<ExpenseRow>;
      };
    };
  };
}

// Create Supabase client with service role key for server-side operations
export const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection test error:', error);
    return false;
  }
};