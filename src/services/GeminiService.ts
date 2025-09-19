import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

export interface ChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
	expense_extracted?: boolean;
}

export interface ExtractedExpense {
	amount: number;
	description: string;
	category: string;
	date?: string;
	confidence: number;
}

export interface ChatResponse {
	message: string;
	extractedExpenses?: ExtractedExpense[];
	hasExpenses: boolean;
}

class GeminiService {
	private genAI: GoogleGenerativeAI;
	private model: GenerativeModel;

	constructor() {
		const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
		if (!apiKey) {
			throw new Error("VITE_GEMINI_API_KEY is not configured");
		}

		this.genAI = new GoogleGenerativeAI(apiKey);
		this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
	}

	async processMessage(
		message: string,
		conversationHistory: ChatMessage[] = []
	): Promise<ChatResponse> {
		try {
			// Build conversation context
			const context = this.buildConversationContext(conversationHistory);

			// Create system prompt for expense tracking
			const systemPrompt = `You are Spendly Bot, a friendly expense tracking assistant. Your job is to:

1. Help users track their expenses by extracting expense information from their messages
2. Answer questions about expense tracking, categories, and financial management
3. Provide helpful suggestions and insights about spending habits

EXPENSE CATEGORIES (use exact values):
- investment: Investment
- food: Food and Dining  
- transport: Transportation
- shopping: Shopping
- loan: Loan
- medical: Medical
- bill: Bills
- travel: Travel
- houseExpense: House Expense
- others: Others

When a user mentions an expense, extract it using this JSON format:
{
  "amount": number,
  "description": "description",
  "category": "category_id",
  "date": "YYYY-MM-DD" (optional, use today if not specified),
  "confidence": 0.0-1.0
}

Example extractions:
- "I spent 50 on groceries today" → {"amount": 50, "description": "groceries", "category": "food", "confidence": 0.9}
- "Paid rent 1200" → {"amount": 1200, "description": "rent payment", "category": "houseExpense", "confidence": 0.95}
- "Bought coffee for 5" → {"amount": 5, "description": "coffee", category": "food", "confidence": 0.8}

IMPORTANT RULES:
1. Always respond in a friendly, helpful tone
2. If you extract expenses, include them in your response AND provide the JSON
3. If no expenses found, just provide helpful conversation
4. Only extract clear, confident expense mentions (confidence > 0.7)
5. Ask for clarification if expense details are unclear
6. Provide tips and insights about expense tracking when appropriate

Current conversation context:
${context}

User message: "${message}"

Respond naturally and extract any expenses. If you find expenses, include the JSON extraction after your main response.`;

			const result = await this.model.generateContent(systemPrompt);
			const responseText = result.response.text();

			// Parse the response to extract expenses
			const { cleanMessage, extractedExpenses } =
				this.parseExpenseResponse(responseText);

			return {
				message: cleanMessage,
				extractedExpenses,
				hasExpenses: extractedExpenses.length > 0
			};
		} catch (error) {
			console.error("Gemini API error:", error);
			throw new Error("Failed to process message with AI");
		}
	}

	private buildConversationContext(history: ChatMessage[]): string {
		if (history.length === 0) return "This is the start of a new conversation.";

		return history
			.slice(-5) // Last 5 messages for context
			.map((msg) => `${msg.role}: ${msg.content}`)
			.join("\n");
	}

	private parseExpenseResponse(response: string): {
		cleanMessage: string;
		extractedExpenses: ExtractedExpense[];
	} {
		const expenses: ExtractedExpense[] = [];
		let cleanMessage = response;

		// Look for JSON expense extractions in the response
		const jsonRegex = /\{[^{}]*"amount"[^{}]*\}/g;
		const matches = response.match(jsonRegex);

		if (matches) {
			matches.forEach((match) => {
				try {
					const expenseData = JSON.parse(match);
					if (this.isValidExpense(expenseData)) {
						expenses.push({
							amount: expenseData.amount,
							description: expenseData.description || "Expense",
							category: expenseData.category || "others",
							date: expenseData.date || new Date().toISOString().split("T")[0],
							confidence: expenseData.confidence || 0.8
						});
					}
				} catch (e) {
					console.warn("Failed to parse expense JSON:", match);
				}
			});

			// Remove JSON from the clean message
			cleanMessage = response.replace(jsonRegex, "").trim();
		}

		return { cleanMessage, extractedExpenses: expenses };
	}

	private isValidExpense(data: unknown): boolean {
		if (typeof data !== "object" || data === null) return false;

		const expense = data as Record<string, unknown>;

		return (
			typeof expense.amount === "number" &&
			expense.amount > 0 &&
			typeof expense.description === "string" &&
			typeof expense.category === "string" &&
			(expense.confidence === undefined ||
				(typeof expense.confidence === "number" && expense.confidence >= 0.7))
		);
	}

	// Query mode for asking questions about expenses
	async queryExpenses(
		question: string,
		userExpenseData?: unknown
	): Promise<string> {
		try {
			const prompt = `You are Spendly Bot, helping analyze expense data. Answer the user's question about their expenses.

${
	userExpenseData
		? `Recent expense data: ${JSON.stringify(userExpenseData, null, 2)}`
		: "No recent expense data available."
}

User question: "${question}"

Provide a helpful, insightful answer about their expenses, spending patterns, or financial advice. Keep it concise and actionable.`;

			const result = await this.model.generateContent(prompt);
			return result.response.text();
		} catch (error) {
			console.error("Gemini query error:", error);
			throw new Error("Failed to process expense query");
		}
	}
}

export const geminiService = new GeminiService();
