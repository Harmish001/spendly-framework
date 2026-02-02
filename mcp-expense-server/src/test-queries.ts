import { QueryParser } from './services/queryParser.js';

// Test the query parser
const parser = new QueryParser();

const testQueries = [
  'get me house expenses for february',
  'show food costs last month',
  'transport expenses this year',
  'medical bills in January',
  'shopping expenses for December 2024',
  'show all expenses for this month',
  'get investment details for March',
  'house expense february',
  'food february 2024',
  'show me my rent for last month'
];

console.log('🧪 Testing Natural Language Query Parser\n');

testQueries.forEach((query, index) => {
  console.log(`${index + 1}. Query: "${query}"`);
  const parsed = parser.parseExpenseQuery(query);
  console.log(`   → Category: ${parsed.category || 'none'}`);
  console.log(`   → Month: ${parsed.month || 'none'}`);
  console.log(`   → Year: ${parsed.year || 'none'}`);
  console.log(`   → Timeframe: ${parsed.timeframe || 'none'}`);
  console.log('');
});

console.log('✅ Query parsing test complete!');