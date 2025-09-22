import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Send,
	Bot,
	User,
	Loader2,
	Check,
	X,
	Minimize2,
	Maximize2,
	Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import {
	geminiService,
	type ChatMessage as GeminiChatMessage
} from "@/services/GeminiService";
import {
	expenseParserService,
	type ChatConversation,
	type ChatMessage,
	type ChatExtractedExpense
} from "@/services/ExpenseParserService";

interface FloatingChatBotProps {
	isOpen: boolean;
	onToggle: () => void;
}

export const FloatingChatBot = ({ isOpen, onToggle }: FloatingChatBotProps) => {
	const isMobile = useIsMobile();
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const [currentConversation, setCurrentConversation] =
		useState<ChatConversation | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [extractedExpenses, setExtractedExpenses] = useState<
		ChatExtractedExpense[]
	>([]);
	const [inputMessage, setInputMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);

	useEffect(() => {
		if (isOpen && !currentConversation) {
			initializeChat();
		}
	}, [isOpen]);

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		if (currentConversation) {
			loadMessages();
			loadExtractedExpenses();
		}
	}, [currentConversation]);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const initializeChat = async () => {
		try {
			const convs = await expenseParserService.getConversations();

			if (convs.length > 0) {
				setCurrentConversation(convs[0]);
			} else {
				const newConv = await expenseParserService.createConversation(
					"Chat with Spendly Bot"
				);
				setCurrentConversation(newConv);
			}
		} catch (error) {
			console.error("Failed to initialize chat:", error);
			toast.error("Failed to initialize Spendly Bot");
		}
	};

	const loadMessages = async () => {
		if (!currentConversation) return;

		try {
			const msgs = await expenseParserService.getMessages(
				currentConversation.id
			);
			setMessages(msgs);
		} catch (error) {
			console.error("Failed to load messages:", error);
		}
	};

	const loadExtractedExpenses = async () => {
		if (!currentConversation) return;

		try {
			const expenses = await expenseParserService.getExtractedExpenses(
				currentConversation.id
			);
			setExtractedExpenses(expenses);
		} catch (error) {
			console.error("Failed to load extracted expenses:", error);
		}
	};

	const sendMessage = async () => {
		if (!inputMessage.trim() || !currentConversation || loading) return;

		const userMessage = inputMessage.trim();
		setInputMessage("");
		setLoading(true);

		try {
			// Add user message to database
			const userMsg = await expenseParserService.addMessage(
				currentConversation.id,
				"user",
				userMessage
			);
			setMessages((prev) => [...prev, userMsg]);

			// Get conversation history for context
			const conversationHistory: GeminiChatMessage[] = messages.map((msg) => ({
				id: msg.id,
				role: msg.role as "user" | "assistant",
				content: msg.content,
				timestamp: new Date(msg.created_at)
			}));

			// Process with Gemini
			const response = await geminiService.processMessage(
				userMessage,
				conversationHistory
			);

			// Add assistant response to database
			const assistantMsg = await expenseParserService.addMessage(
				currentConversation.id,
				"assistant",
				response.message,
				response.hasExpenses
			);
			setMessages((prev) => [...prev, assistantMsg]);

			// Save extracted expenses if any
			if (response.extractedExpenses && response.extractedExpenses.length > 0) {
				const savedExpenses = await expenseParserService.saveExtractedExpenses(
					assistantMsg.id,
					response.extractedExpenses
				);
				setExtractedExpenses((prev) => [...prev, ...savedExpenses]);
				toast.success(
					`Spendly Bot found ${response.extractedExpenses.length} expense(s)!`
				);
			}
		} catch (error) {
			console.error("Failed to send message:", error);
			toast.error("Failed to send message to Spendly Bot");
		} finally {
			setLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	const approveExpense = async (expenseId: string) => {
		try {
			await expenseParserService.approveExtractedExpense(expenseId);
			setExtractedExpenses((prev) =>
				prev.map((exp) =>
					exp.id === expenseId
						? { ...exp, approved: true, added_to_expenses: true }
						: exp
				)
			);
			toast.success("Expense added by Spendly Bot!");
		} catch (error) {
			console.error("Failed to approve expense:", error);
			toast.error("Failed to add expense");
		}
	};

	const rejectExpense = async (expenseId: string) => {
		try {
			await expenseParserService.rejectExtractedExpense(expenseId);
			setExtractedExpenses((prev) =>
				prev.filter((exp) => exp.id !== expenseId)
			);
			toast.success("Expense rejected");
		} catch (error) {
			console.error("Failed to reject expense:", error);
			toast.error("Failed to reject expense");
		}
	};

	const getCategoryLabel = (category: string): string => {
		const labels: Record<string, string> = {
			investment: "Investment",
			food: "Food & Dining",
			transport: "Transportation",
			shopping: "Shopping",
			loan: "Loan",
			medical: "Medical",
			bill: "Bills",
			travel: "Travel",
			houseExpense: "House Expense",
			others: "Others"
		};
		return labels[category] || category;
	};

	const pendingExpenses = extractedExpenses.filter(
		(exp) => !exp.approved && !exp.added_to_expenses
	);

	if (!isOpen) return null;

	return (
		<div
			className={`fixed bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden ${
				isMobile
					? "bottom-4 left-4 right-4 top-16"
					: isMinimized
					? "bottom-4 right-4 w-80 h-16"
					: "bottom-4 left-4 w-96 h-[600px]"
			}`}
			style={{
				zIndex: 1000,
				background:
					"linear-gradient(135deg, rgba(147, 51, 234, 1) 0%, rgba(37, 99, 235, 1) 100%)"
			}}
		>
			{/* Header */}
			<div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
						<Sparkles className="h-4 w-4" />
					</div>
					<div>
						<h3 className="font-semibold text-sm">Spendly Bot</h3>
						{!isMinimized && (
							<p className="text-xs opacity-90">Your AI expense assistant</p>
						)}
					</div>
				</div>

				<div className="flex items-center gap-1">
					{pendingExpenses.length > 0 && !isMinimized && (
						<Badge
							variant="secondary"
							className="bg-orange-200 text-orange-800 text-xs"
						>
							{pendingExpenses.length}
						</Badge>
					)}
					{!isMobile && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsMinimized(!isMinimized)}
							className="text-white hover:bg-white hover:bg-opacity-20 h-6 w-6 p-0"
						>
							{isMinimized ? (
								<Maximize2 className="h-3 w-3" />
							) : (
								<Minimize2 className="h-3 w-3" />
							)}
						</Button>
					)}
					<Button
						variant="ghost"
						size="sm"
						onClick={onToggle}
						className="text-white hover:bg-white hover:bg-opacity-20 h-6 w-6 p-0"
					>
						<X className="h-3 w-3" />
					</Button>
				</div>
			</div>

			{!isMinimized && (
				<>
					{/* Messages */}
					<ScrollArea
						className="flex-1 p-3"
						style={{ height: isMobile ? "calc(100vh - 200px)" : "470px" }}
					>
						<div className="space-y-3">
							{messages.length === 0 && (
								<Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
									<CardContent className="p-4 text-center">
										<Bot className="h-8 w-8 text-purple-600 mx-auto mb-2" />
										<h4 className="font-semibold text-gray-800 mb-1">
											Hi! I'm Spendly Bot
										</h4>
										<p className="text-xs text-gray-600 mb-2">
											I can help you track expenses and answer questions about
											your spending.
										</p>
										<p className="text-xs text-gray-500">
											💡 Try: "I spent $20 on lunch today"
										</p>
									</CardContent>
								</Card>
							)}

							{messages.map((message) => (
								<div
									key={message.id}
									className={`flex gap-2 ${
										message.role === "user" ? "justify-end" : "justify-start"
									}`}
								>
									{message.role === "assistant" && (
										<div className="flex-shrink-0">
											<div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
												<Bot className="h-3 w-3 text-white" />
											</div>
										</div>
									)}

									<div
										className={`max-w-[80%] ${
											message.role === "user" ? "order-1" : ""
										}`}
									>
										<Card
											className={`rounded-2xl ${
												message.role === "user"
													? "bg-blue-600 text-white border-blue-600"
													: "bg-white border-gray-200"
											}`}
										>
											<CardContent className="p-2">
												<p className="text-xs whitespace-pre-wrap">
													{message.content}
												</p>
												{message.expense_extracted && (
													<Badge variant="secondary" className="mt-1 text-xs">
														Expense detected
													</Badge>
												)}
											</CardContent>
										</Card>
									</div>

									{message.role === "user" && (
										<div className="flex-shrink-0">
											<div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
												<User className="h-3 w-3 text-white" />
											</div>
										</div>
									)}
								</div>
							))}

							{/* Pending Expenses */}
							{pendingExpenses.length > 0 && (
								<Card className="bg-orange-50 border-orange-200">
									<CardHeader className="p-2">
										<CardTitle className="text-sm flex items-center gap-1">
											Detected Expenses
										</CardTitle>
									</CardHeader>
									<CardContent className="p-2">
										<div className="space-y-2">
											{pendingExpenses.map((expense) => (
												<div
													key={expense.id}
													className="flex items-center justify-between p-2 bg-white rounded-2xl border"
												>
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium">
															{expense.amount.toFixed(2)}
														</p>
														<p className="text-xs text-gray-600 truncate">
															{expense.description}
														</p>
														<Badge variant="outline" className="text-xs mt-1">
															{getCategoryLabel(expense.category)}
														</Badge>
													</div>
													<div className="flex gap-1">
														<Button
															size="sm"
															onClick={() => approveExpense(expense.id)}
															className="bg-green-600 hover:bg-green-700 h-6 w-6 p-0"
														>
															<Check className="h-3 w-3" />
														</Button>
														<Button
															size="sm"
															variant="outline"
															onClick={() => rejectExpense(expense.id)}
															className="h-6 w-6 p-0"
														>
															<X className="h-3 w-3" />
														</Button>
													</div>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							)}

							<div ref={messagesEndRef} />
						</div>
					</ScrollArea>

					{/* Input */}
					<div className="border-t bg-white p-3">
						<div className="flex gap-2">
							<Input
								value={inputMessage}
								onChange={(e) => setInputMessage(e.target.value)}
								onKeyPress={handleKeyPress}
								placeholder="Ask Spendly Bot about expenses..."
								className="flex-1 text-sm rounded-2xl"
								disabled={loading}
							/>
							<Button
								onClick={sendMessage}
								disabled={loading || !inputMessage.trim()}
								size="sm"
								className="bg-purple-600 hover:bg-purple-700 rounded-3xl"
							>
								{loading ? (
									<Loader2 className="h-3 w-3 animate-spin" />
								) : (
									<Send className="h-3 w-3" />
								)}
							</Button>
						</div>
					</div>
				</>
			)}
		</div>
	);
};
