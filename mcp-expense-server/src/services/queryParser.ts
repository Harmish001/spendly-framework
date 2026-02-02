export interface ParsedExpenseQuery {
  category?: string;
  month?: string;
  year?: string;
  timeframe?: 'week' | 'month' | 'year' | 'day';
  startDate?: string;
  endDate?: string;
  amount?: {
    min?: number;
    max?: number;
  };
  keywords: string[];
}

export class QueryParser {
  private categoryMappings: Record<string, string[]> = {
    food: ['food', 'dining', 'restaurant', 'meal', 'lunch', 'dinner', 'breakfast', 'snack', 'grocery', 'groceries', 'eating', 'cafe'],
    transport: ['transport', 'transportation', 'travel', 'uber', 'taxi', 'bus', 'train', 'metro', 'fuel', 'gas', 'petrol', 'car', 'vehicle'],
    shopping: ['shopping', 'shop', 'purchase', 'buy', 'bought', 'store', 'mall', 'clothes', 'clothing', 'electronics', 'gadget'],
    investment: ['investment', 'invest', 'stock', 'mutual', 'fund', 'shares', 'portfolio', 'sip', 'fd', 'deposit'],
    loan: ['loan', 'emi', 'credit', 'debt', 'borrow', 'mortgage', 'installment'],
    medical: ['medical', 'health', 'hospital', 'doctor', 'medicine', 'pharmacy', 'treatment', 'checkup', 'clinic'],
    bill: ['bill', 'bills', 'electricity', 'water', 'phone', 'internet', 'utility', 'utilities', 'subscription'],
    travel: ['travel', 'trip', 'vacation', 'holiday', 'hotel', 'flight', 'booking', 'tour'],
    houseExpense: ['house', 'home', 'rent', 'maintenance', 'repair', 'furniture', 'appliance', 'household'],
    others: ['other', 'others', 'miscellaneous', 'misc', 'general', 'random']
  };

  private monthMappings: Record<string, string> = {
    january: '01', jan: '01', '1': '01',
    february: '02', feb: '02', '2': '02',
    march: '03', mar: '03', '3': '03',
    april: '04', apr: '04', '4': '04',
    may: '05', '5': '05',
    june: '06', jun: '06', '6': '06',
    july: '07', jul: '07', '7': '07',
    august: '08', aug: '08', '8': '08',
    september: '09', sep: '09', sept: '09', '9': '09',
    october: '10', oct: '10', '10': '10',
    november: '11', nov: '11', '11': '11',
    december: '12', dec: '12', '12': '12'
  };

  parseExpenseQuery(query: string): ParsedExpenseQuery {
    const normalizedQuery = query.toLowerCase().trim();
    const words = normalizedQuery.split(/\\s+/);
    
    const result: ParsedExpenseQuery = {
      keywords: words
    };

    // Parse category
    result.category = this.extractCategory(normalizedQuery);

    // Parse month
    result.month = this.extractMonth(normalizedQuery);

    // Parse year
    result.year = this.extractYear(normalizedQuery);

    // Parse timeframe
    result.timeframe = this.extractTimeframe(normalizedQuery);

    // Parse relative time references
    this.parseRelativeTime(normalizedQuery, result);

    console.log(`Parsed query: "${query}" -> Category: ${result.category}, Month: ${result.month}, Year: ${result.year}`);
    
    return result;
  }

  parseMonth(monthInput: string): string {
    const normalized = monthInput.toLowerCase().trim();
    
    // Check if it's already in MM format
    if (/^\\d{2}$/.test(monthInput)) {
      return monthInput;
    }
    
    // Check if it's a number (1-12)
    if (/^\\d{1,2}$/.test(monthInput)) {
      const num = parseInt(monthInput, 10);
      if (num >= 1 && num <= 12) {
        return num.toString().padStart(2, '0');
      }
    }
    
    // Check month mappings
    return this.monthMappings[normalized] || monthInput.padStart(2, '0');
  }

  private extractCategory(query: string): string | undefined {
    for (const [category, keywords] of Object.entries(this.categoryMappings)) {
      for (const keyword of keywords) {
        if (query.includes(keyword)) {
          return category;
        }
      }
    }
    return undefined;
  }

  private extractMonth(query: string): string | undefined {
    // Look for month names or numbers
    for (const [monthName, monthCode] of Object.entries(this.monthMappings)) {
      if (query.includes(monthName)) {
        return monthCode;
      }
    }

    // Look for patterns like "in march", "for february", "march expenses"
    const monthPatterns = [
      /(?:in|for|during)\\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)/,
      /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\\s+(?:expenses|costs|spending)/,
      /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)/
    ];

    for (const pattern of monthPatterns) {
      const match = query.match(pattern);
      if (match) {
        const monthName = match[1].toLowerCase();
        return this.monthMappings[monthName];
      }
    }

    return undefined;
  }

  private extractYear(query: string): string | undefined {
    // Look for 4-digit years
    const yearMatch = query.match(/\\b(20\\d{2})\\b/);
    if (yearMatch) {
      return yearMatch[1];
    }

    // Look for relative year references
    const currentYear = new Date().getFullYear();
    if (query.includes('last year') || query.includes('previous year')) {
      return (currentYear - 1).toString();
    }
    
    if (query.includes('this year') || query.includes('current year')) {
      return currentYear.toString();
    }

    return undefined;
  }

  private extractTimeframe(query: string): 'week' | 'month' | 'year' | 'day' | undefined {
    if (query.includes('week') || query.includes('weekly')) {
      return 'week';
    }
    if (query.includes('month') || query.includes('monthly')) {
      return 'month';
    }
    if (query.includes('year') || query.includes('yearly') || query.includes('annual')) {
      return 'year';
    }
    if (query.includes('day') || query.includes('daily') || query.includes('today')) {
      return 'day';
    }
    return undefined;
  }

  private parseRelativeTime(query: string, result: ParsedExpenseQuery): void {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Handle "last month"
    if (query.includes('last month') || query.includes('previous month')) {
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      result.month = lastMonth.toString().padStart(2, '0');
      result.year = lastMonthYear.toString();
    }

    // Handle "this month"
    if (query.includes('this month') || query.includes('current month')) {
      result.month = currentMonth.toString().padStart(2, '0');
      result.year = currentYear.toString();
    }

    // Handle "next month"
    if (query.includes('next month')) {
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      result.month = nextMonth.toString().padStart(2, '0');
      result.year = nextMonthYear.toString();
    }
  }

  // Helper method to validate parsed data
  isValidMonth(month: string): boolean {
    const monthNum = parseInt(month, 10);
    return monthNum >= 1 && monthNum <= 12;
  }

  isValidYear(year: string): boolean {
    const yearNum = parseInt(year, 10);
    const currentYear = new Date().getFullYear();
    return yearNum >= 2020 && yearNum <= currentYear + 5;
  }

  // Generate suggestions for ambiguous queries
  generateSuggestions(query: string): string[] {
    const suggestions: string[] = [];
    
    if (!this.extractCategory(query)) {
      suggestions.push('Try specifying a category like "food", "transport", "house", etc.');
    }
    
    if (!this.extractMonth(query) && !this.extractYear(query)) {
      suggestions.push('Try adding a time period like "this month", "February", or "2024"');
    }
    
    return suggestions;
  }
}