import { supabase } from "@/integrations/supabase/client";
import { ExtractedExpense } from "./GeminiService";

export interface ChatConversation {
	id: string;
	user_id: string;
	title: string;
	created_at: string;
	updated_at: string;
}

export interface ChatMessage {
	id: string;
	conversation_id: string;
	user_id: string;
	role: "user" | "assistant";
	content: string;
	expense_extracted: boolean;
	created_at: string;
}

export interface ChatExtractedExpense {
	id: string;
	message_id: string;
	user_id: string;
	amount: number;
	description: string;
	category: string;
	confidence: number;
	approved: boolean;
	created_at: string;
	added_to_expenses: boolean;
	expense_id?: string;
}

class ExpenseParserService {
	// Create a new conversation
	async createConversation(title?: string): Promise<ChatConversation> {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not authenticated");

		const { data, error } = await supabase
			.from("chat_conversations")
			.insert({
				user_id: user.id,
				title: title || "New Chat"
			})
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	// Get user's conversations
	async getConversations(): Promise<ChatConversation[]> {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not authenticated");

		const { data, error } = await supabase
			.from("chat_conversations")
			.select("*")
			.eq("user_id", user.id)
			.order("updated_at", { ascending: false });

		if (error) throw error;
		return data || [];
	}

	// Add message to conversation
	async addMessage(
		conversationId: string,
		role: "user" | "assistant",
		content: string,
		expenseExtracted = false
	): Promise<ChatMessage> {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not authenticated");

		const { data, error } = await supabase
			.from("chat_messages")
			.insert({
				conversation_id: conversationId,
				user_id: user.id,
				role,
				content,
				expense_extracted: expenseExtracted
			})
			.select()
			.single();

		if (error) throw error;

		// Update conversation timestamp
		await this.updateConversationTimestamp(conversationId);

		return data as ChatMessage;
	}

	// Get messages for a conversation
	async getMessages(conversationId: string): Promise<ChatMessage[]> {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not authenticated");

		const { data, error } = await supabase
			.from("chat_messages")
			.select("*")
			.eq("conversation_id", conversationId)
			.eq("user_id", user.id)
			.order("created_at", { ascending: true });

		if (error) throw error;
		return (data || []) as ChatMessage[];
	}

	// Save extracted expenses from chat
	async saveExtractedExpenses(
		messageId: string,
		extractedExpenses: ExtractedExpense[]
	): Promise<ChatExtractedExpense[]> {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not authenticated");

		const expensesToInsert = extractedExpenses.map((expense) => ({
			message_id: messageId,
			user_id: user.id,
			amount: expense.amount,
			description: expense.description,
			category: expense.category,
			confidence: expense.confidence
		}));

		const { data, error } = await supabase
			.from("chat_extracted_expenses")
			.insert(expensesToInsert)
			.select();

		if (error) throw error;
		return data || [];
	}

	// Get extracted expenses for a conversation
	async getExtractedExpenses(
		conversationId: string
	): Promise<ChatExtractedExpense[]> {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not authenticated");

		const { data, error } = await supabase
			.from("chat_extracted_expenses")
			.select(
				`
        *,
        chat_messages!inner(conversation_id)
      `
			)
			.eq("user_id", user.id)
			.eq("chat_messages.conversation_id", conversationId)
			.order("created_at", { ascending: false });

		if (error) throw error;
		return data || [];
	}

	// Approve extracted expense and add to main expenses table
	async approveExtractedExpense(extractedExpenseId: string): Promise<void> {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not authenticated");

		// Get the extracted expense
		const { data: extractedExpense, error: fetchError } = await supabase
			.from("chat_extracted_expenses")
			.select("*")
			.eq("id", extractedExpenseId)
			.eq("user_id", user.id)
			.single();

		if (fetchError) throw fetchError;
		if (!extractedExpense) throw new Error("Extracted expense not found");

		// Add to main expenses table
		const { data: newExpense, error: insertError } = await supabase
			.from("expenses")
			.insert({
				user_id: user.id,
				amount: extractedExpense.amount,
				description: extractedExpense.description,
				category: extractedExpense.category,
				date: new Date().toISOString().split("T")[0],
				created_at: new Date().toISOString()
			})
			.select()
			.single();

		if (insertError) throw insertError;

		// Update extracted expense to mark as approved and added
		const { error: updateError } = await supabase
			.from("chat_extracted_expenses")
			.update({
				approved: true,
				added_to_expenses: true,
				expense_id: newExpense.id
			})
			.eq("id", extractedExpenseId);

		if (updateError) throw updateError;
	}

	// Reject extracted expense
	async rejectExtractedExpense(extractedExpenseId: string): Promise<void> {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not authenticated");

		const { error } = await supabase
			.from("chat_extracted_expenses")
			.delete()
			.eq("id", extractedExpenseId)
			.eq("user_id", user.id);

		if (error) throw error;
	}

	// Update conversation title
	async updateConversationTitle(
		conversationId: string,
		title: string
	): Promise<void> {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not authenticated");

		const { error } = await supabase
			.from("chat_conversations")
			.update({ title })
			.eq("id", conversationId)
			.eq("user_id", user.id);

		if (error) throw error;
	}

	// Delete conversation
	async deleteConversation(conversationId: string): Promise<void> {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not authenticated");

		const { error } = await supabase
			.from("chat_conversations")
			.delete()
			.eq("id", conversationId)
			.eq("user_id", user.id);

		if (error) throw error;
	}

	// Get recent user expenses for context
	async getRecentExpenses(limit = 20): Promise<unknown[]> {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not authenticated");

		const { data, error } = await supabase
			.from("expenses")
			.select("*")
			.eq("user_id", user.id)
			.order("created_at", { ascending: false })
			.limit(limit);

		if (error) throw error;
		return data || [];
	}

	private async updateConversationTimestamp(
		conversationId: string
	): Promise<void> {
		const { error } = await supabase
			.from("chat_conversations")
			.update({ updated_at: new Date().toISOString() })
			.eq("id", conversationId);

		if (error) console.warn("Failed to update conversation timestamp:", error);
	}
}

export const expenseParserService = new ExpenseParserService();
