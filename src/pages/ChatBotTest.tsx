import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, TestTube, Bot } from "lucide-react";
import { toast } from "sonner";
import { geminiService } from "@/services/GeminiService";
import { expenseParserService } from "@/services/ExpenseParserService";

const ChatBotTest = () => {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [testMessage, setTestMessage] = useState("I spent $25 on lunch at McDonald's today");
  const [apiKeySet, setApiKeySet] = useState(false);
  const [loading, setLoading] = useState(false);

  const tests = [
    {
      id: 'gemini_api',
      name: 'Gemini API Connection',
      description: 'Test if Gemini API key is configured and working'
    },
    {
      id: 'database_tables',
      name: 'Database Tables',
      description: 'Check if chat tables exist in database'
    },
    {
      id: 'expense_extraction',
      name: 'Expense Extraction',
      description: 'Test Spendly Bot expense extraction from sample message'
    },
    {
      id: 'conversation_creation',
      name: 'Conversation Management',
      description: 'Test creating and managing conversations'
    }
  ];

  const checkApiKey = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const isSet = apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.trim() !== '';
    setApiKeySet(isSet);
    return isSet;
  };

  const runTest = async (testId: string) => {
    setLoading(true);
    try {
      let result = false;
      
      switch (testId) {
        case 'gemini_api':
          try {
            const response = await geminiService.processMessage("Hello, test message");
            result = response.message && response.message.length > 0;
          } catch (error) {
            console.error('Gemini API test failed:', error);
            result = false;
          }
          break;
          
        case 'database_tables':
          try {
            const conversations = await expenseParserService.getConversations();
            result = Array.isArray(conversations);
          } catch (error) {
            console.error('Database test failed:', error);
            result = false;
          }
          break;
          
        case 'expense_extraction':
          try {
            const response = await geminiService.processMessage(testMessage);
            result = response.hasExpenses && response.extractedExpenses && response.extractedExpenses.length > 0;
          } catch (error) {
            console.error('Expense extraction test failed:', error);
            result = false;
          }
          break;
          
        case 'conversation_creation':
          try {
            const newConv = await expenseParserService.createConversation('Test Chat');
            result = !!(newConv && newConv.id);
            if (result) {
              // Clean up test conversation
              await expenseParserService.deleteConversation(newConv.id);
            }
          } catch (error) {
            console.error('Conversation creation test failed:', error);
            result = false;
          }
          break;
      }
      
      setTestResults(prev => ({ ...prev, [testId]: result }));
      
      if (result) {
        toast.success(`✅ ${tests.find(t => t.id === testId)?.name} test passed!`);
      } else {
        toast.error(`❌ ${tests.find(t => t.id === testId)?.name} test failed!`);
      }
    } catch (error) {
      console.error(`Test ${testId} failed:`, error);
      setTestResults(prev => ({ ...prev, [testId]: false }));
      toast.error(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    for (const test of tests) {
      await runTest(test.id);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getStatusIcon = (testId: string) => {
    const result = testResults[testId];
    if (result === undefined) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return result ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (testId: string) => {
    const result = testResults[testId];
    if (result === undefined) return <Badge variant="secondary">Not Run</Badge>;
    return result ? <Badge className="bg-green-500">Passed</Badge> : <Badge variant="destructive">Failed</Badge>;
  };

  return (
    <div style={{ zIndex: 956565689 }} className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-6 w-6 text-purple-600" />
              Spendly Bot System Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Use this page to verify that your Spendly Bot setup is working correctly. 
              Make sure you have configured your Gemini API key and created the database tables.
            </p>
            
            {/* API Key Status */}
            <Alert className="mb-6">
              <Bot className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>
                    Gemini API Key: {checkApiKey() ? '✅ Configured' : '❌ Not configured'}
                  </span>
                  {!checkApiKey() && (
                    <span className="text-sm text-red-600">
                      Add VITE_GEMINI_API_KEY to your .env.local file
                    </span>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex gap-4 mb-6">
              <Button onClick={runAllTests} disabled={loading} className="flex-1">
                {loading ? 'Running Tests...' : 'Run All Tests'}
              </Button>
              <Button variant="outline" onClick={() => setTestResults({})}>
                Clear Results
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Individual Tests */}
        <div className="grid gap-4">
          {tests.map((test) => (
            <Card key={test.id} className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.id)}
                    <div>
                      <h3 className="font-medium">{test.name}</h3>
                      <p className="text-sm text-gray-600">{test.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(test.id)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runTest(test.id)}
                      disabled={loading}
                    >
                      Test
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Test Message */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Test Expense Extraction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Test Message:</label>
                <Input
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter a message with expense information..."
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={() => runTest('expense_extraction')}
                disabled={loading}
                className="w-full"
              >
                Test Expense Extraction
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-lg text-orange-800">Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-orange-700">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Get a Gemini API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
              <li>Copy .env.example to .env.local and add your API key</li>
              <li>Run the database migration in your Supabase SQL editor:</li>
              <li className="ml-4 text-xs bg-white p-2 rounded border">
                Execute: supabase/migrations/20250919000000_chatbot_schema.sql
              </li>
              <li>Run all tests to verify everything is working</li>
              <li>Click the floating Spendly Bot button to start using the AI assistant!</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatBotTest;