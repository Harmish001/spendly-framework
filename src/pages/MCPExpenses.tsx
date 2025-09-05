import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Send, MessageSquare, Server, CheckCircle, XCircle, Lightbulb, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { mcpBridgeService, type MCPQueryResult } from "@/services/MCPBridgeService";
import { useIsMobile } from "@/hooks/use-mobile";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MCPExpenses = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [conversationHistory, setConversationHistory] = useState<Array<{query: string, response: string, timestamp: Date}>>([]);

  // Check MCP server status on component mount
  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      setServerStatus('checking');
      const isOnline = await mcpBridgeService.checkServerStatus();
      setServerStatus(isOnline ? 'online' : 'offline');
      
      if (isOnline) {
        toast.success("MCP Bridge Service is ready!");
      } else {
        toast.error("MCP Bridge Service is unavailable");
      }
    } catch (error) {
      setServerStatus('offline');
      toast.error("Failed to connect to MCP Bridge Service");
    }
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Please enter a query");
      return;
    }

    setLoading(true);
    try {
      const result = await mcpBridgeService.processNaturalLanguageQuery(query.trim());
      
      if (result.success) {
        setResponse(result.data);
        setConversationHistory(prev => [
          ...prev,
          {
            query: query.trim(),
            response: result.data,
            timestamp: new Date()
          }
        ]);
        toast.success("Query processed successfully!");
      } else {
        setResponse(`Error: ${result.error}`);
        toast.error(result.error || "Failed to process query");
      }
    } catch (error: unknown) {
      console.error("Error processing query:", error);
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      toast.error(error instanceof Error ? error.message : "Failed to process query");
    } finally {
      setLoading(false);
    }
  };

  const handleExampleQuery = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  const ServerStatusIndicator = () => (
    <div className={`flex items-center gap-2 mb-4 ${isMobile ? 'flex-col sm:flex-row' : ''}`}>
      <div className="flex items-center gap-2">
        <Server className="h-4 w-4" />
        <span className={`font-medium ${isMobile ? 'text-sm' : 'text-sm'}`}>MCP Bridge Service:</span>
      </div>
      <div className="flex items-center gap-2">
        {serverStatus === 'checking' && (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Checking
          </Badge>
        )}
        {serverStatus === 'online' && (
          <Badge variant="default" className="gap-1 bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3" />
            Online
          </Badge>
        )}
        {serverStatus === 'offline' && (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Offline
          </Badge>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={checkServerStatus}
          className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50"
        >
          Refresh
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient matching project theme */}
      <div className="sticky top-0 z-40 border-b px-4 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" 
           style={{ background: "linear-gradient(to right, #9333ea, #2563eb)" }}>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Sparkles className="h-6 w-6 text-white flex-shrink-0" />
            <div className="min-w-0">
              <h1 className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-xl'}`}>
                MCP Analytics
              </h1>
              {!isMobile && (
                <p className="text-sm text-white/80 truncate">
                  Ask questions about your expenses in natural language
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`p-4 space-y-4 ${isMobile ? 'pb-20 px-3' : 'pb-8'} max-w-full overflow-x-hidden`}>

        <ServerStatusIndicator />

        {/* Query Interface */}
        <Card className="mb-4">
          <CardHeader className={isMobile ? 'pb-3' : 'pb-6'}>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5" />
              {isMobile ? 'Ask Questions' : 'Ask About Your Expenses'}
            </CardTitle>
            {isMobile && (
              <p className="text-sm text-slate-600 mt-1">
                Use natural language to query your expenses
              </p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleQuerySubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Natural Language Query</label>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={isMobile ? "House expenses for February" : "e.g., 'Show me house expenses for February' or 'Get food costs last month'"}
                  className={`${isMobile ? 'text-base h-12' : 'text-lg'} transition-all focus:ring-2 focus:ring-purple-200`}
                  disabled={loading || serverStatus !== 'online'}
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading || !query.trim() || serverStatus !== 'online'}
                className={`w-full rounded-[20px] ${isMobile ? 'h-12 text-base' : 'h-11'} transition-all`}
                style={{ 
                  background: serverStatus === 'online' && !loading ? 'linear-gradient(to right, #9333ea, #2563eb)' : undefined,
                  opacity: loading || serverStatus !== 'online' ? 0.6 : 1
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {isMobile ? 'Ask' : 'Ask Question'}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Example Queries */}
        <Card className="mb-4">
          <CardHeader className={isMobile ? 'pb-3' : 'pb-6'}>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5" />
              {isMobile ? 'Examples' : 'Example Queries'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-2`}>
              {mcpBridgeService.getExampleQueries().slice(0, isMobile ? 3 : 6).map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleExampleQuery(example)}
                  className={`justify-start text-left h-auto rounded-[12px] transition-all hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:border-purple-200 ${isMobile ? 'p-2 text-xs' : 'p-3'}`}
                  disabled={loading}
                >
                  <MessageSquare className="h-3 w-3 mr-2 flex-shrink-0 text-purple-500" />
                  <span className={`text-left leading-tight ${isMobile ? 'text-xs' : 'text-sm'}`}>{example}</span>
                </Button>
              ))}
            </div>
            {isMobile && (
              <div className="mt-3 text-xs text-slate-500 text-center">
                Tap any example to try it out
              </div>
            )}
          </CardContent>
        </Card>

        {/* Response Display */}
        {response && (
          <Card className="mb-4">
            <CardHeader className={isMobile ? 'pb-3' : 'pb-6'}>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5" />
                Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`bg-gradient-to-br from-slate-50 to-slate-100 border rounded-lg overflow-hidden ${isMobile ? 'p-3' : 'p-4'}`}>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({...props}) => <h1 className="text-lg font-bold text-slate-900 mb-2" {...props} />,
                      h2: ({...props}) => <h2 className="text-base font-semibold text-slate-800 mb-2" {...props} />,
                      h3: ({...props}) => <h3 className="text-sm font-medium text-slate-700 mb-1" {...props} />,
                      p: ({...props}) => <p className={`text-slate-700 mb-2 ${isMobile ? 'text-sm' : 'text-base'}`} {...props} />,
                      strong: ({...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                      ul: ({...props}) => <ul className="list-none space-y-1 mb-2" {...props} />,
                      li: ({...props}) => <li className={`flex items-start gap-2 ${isMobile ? 'text-sm' : 'text-base'} text-slate-700`} {...props} />,
                      code: ({...props}) => <code className="bg-slate-200 px-1 py-0.5 rounded text-xs font-mono" {...props} />,
                      table: ({...props}) => (
                        <div className="overflow-x-auto mb-4 border rounded-lg">
                          <table className={`min-w-full ${isMobile ? 'text-xs' : 'text-sm'} border-collapse`} {...props} />
                        </div>
                      ),
                      thead: ({...props}) => <thead className="bg-slate-100" {...props} />,
                      th: ({...props}) => <th className="border border-slate-300 px-3 py-2 text-left font-semibold text-slate-900" {...props} />,
                      td: ({...props}) => <td className="border border-slate-300 px-3 py-2 text-slate-700" {...props} />,
                      blockquote: ({...props}) => (
                        <blockquote className="border-l-4 border-purple-400 pl-4 my-2 italic text-slate-600" {...props} />
                      ),
                    }}
                  >
                    {response}
                  </ReactMarkdown>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <Card>
            <CardHeader className={isMobile ? 'pb-3' : 'pb-6'}>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                Recent Queries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`space-y-4 ${isMobile ? 'max-h-80' : 'max-h-96'} overflow-y-auto`}>
                {conversationHistory.slice(-5).reverse().map((item, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-start gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 mt-1 text-purple-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium break-words ${isMobile ? 'text-sm' : 'text-base'}`}>{item.query}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {item.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className={`${isMobile ? 'ml-4' : 'ml-6'} bg-gradient-to-br from-slate-50 to-slate-100 border rounded-lg overflow-hidden`}>
                      <div className={`prose prose-sm max-w-none dark:prose-invert ${isMobile ? 'p-2' : 'p-3'}`}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({...props}) => <h1 className="text-base font-bold text-slate-900 mb-1" {...props} />,
                            h2: ({...props}) => <h2 className="text-sm font-semibold text-slate-800 mb-1" {...props} />,
                            h3: ({...props}) => <h3 className="text-xs font-medium text-slate-700 mb-1" {...props} />,
                            p: ({...props}) => <p className={`text-slate-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`} {...props} />,
                            strong: ({...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                            ul: ({...props}) => <ul className="list-none space-y-0.5 mb-1" {...props} />,
                            li: ({...props}) => <li className={`flex items-start gap-1 ${isMobile ? 'text-xs' : 'text-sm'} text-slate-700`} {...props} />,
                            code: ({...props}) => <code className="bg-slate-200 px-1 py-0.5 rounded text-xs font-mono" {...props} />,
                            table: ({...props}) => <div className="overflow-x-auto"><table className="min-w-full text-xs" {...props} /></div>,
                            th: ({...props}) => <th className="border border-slate-300 px-2 py-1 bg-slate-100 font-medium" {...props} />,
                            td: ({...props}) => <td className="border border-slate-300 px-2 py-1" {...props} />,
                          }}
                        >
                          {item.response}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MCPExpenses;