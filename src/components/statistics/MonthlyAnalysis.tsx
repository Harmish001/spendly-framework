import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Header } from "../layout/Header";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import {
	ArrowDown,
	ArrowUp,
	BanknoteIcon,
	Car,
	Loader2,
	LucidePlane,
	MoreHorizontal,
	ScrollText,
	ShoppingBag,
	Stethoscope,
	Utensils,
	Wallet,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

const categoryIcons = {
	investment: Wallet,
	food: Utensils,
	transport: Car,
	shopping: ShoppingBag,
	loan: BanknoteIcon,
	medical: Stethoscope,
	travel: LucidePlane,
	bill: ScrollText,
	others: MoreHorizontal,
};

const categories = [
	{ id: "investment", label: "Investment", icon: null },
	{ id: "food", label: "Food and Dining", icon: null },
	{ id: "transport", label: "Transportation", icon: null },
	{ id: "shopping", label: "Shopping", icon: null },
	{ id: "loan", label: "Loan", icon: null },
	{ id: "medical", label: "Medical", icon: null },
	{ id: "bill", label: "Bill", icon: null },
	{ id: "travel", label: "Travel", icon: null },
	{ id: "others", label: "Others", icon: MoreHorizontal },
];

type AnalysisType = "Monthly" | "Yearly" | "Weekly";
const MonthlyAnalysis = () => {
	const [analysisType, setAnalysisType] = useState<AnalysisType>("Weekly");
	const [loading, setLoading] = useState(false);
	const [expenses, setExpenses] = useState([]);
	const [totalExpense, setTotalExpense] = useState(0);
	const [totalPreviousExpense, setTotalPreviousExpense] = useState(0);

	const getPercentageChange = useMemo(() => {
		console.log(totalPreviousExpense, totalExpense);
		if (totalPreviousExpense === 0 && totalExpense === 0) {
			return { type: "equal", percentage: 0 };
		}

		if (totalPreviousExpense === 0) {
			return { type: "increase", percentage: 100 }; // Or could return Infinity
		}

		const diff = totalExpense - totalPreviousExpense;
		const percentage = Math.abs((diff / totalPreviousExpense) * 100);

		if (diff > 0) {
			return { type: "increase", percentage: +percentage.toFixed(2) };
		} else if (diff < 0) {
			return { type: "decrease", percentage: +percentage.toFixed(2) };
		} else {
			return { type: "equal", percentage: 0 };
		}
	}, [totalExpense, totalPreviousExpense]);

	const fetchExpenses = async () => {
		setLoading(true);
		try {
			let query = supabase
				.from("expenses")
				.select("*")
				.order("created_at", { ascending: false });
			switch (analysisType) {
				// case "Yearly":
				// 	query = query.gte(
				// 		"created_at",
				// 		new Date(new Date().getFullYear(), 0, 1).toISOString()
				// 	); // Fetch from the start of the year
				// 	break;
				case "Weekly": {
					const today = new Date();
					const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)

					// Get the difference to Monday
					const diffToMonday = (dayOfWeek + 6) % 7;

					const monday = new Date(today);
					monday.setDate(today.getDate() - diffToMonday);
					monday.setHours(0, 0, 0, 0); // Start of Monday
					query = query.gte("created_at", monday.toISOString());
					break;
				}
				default:
					query = query.gte(
						"created_at",
						new Date(
							new Date().getFullYear(),
							new Date().getMonth(),
							1
						).toISOString()
					); // Fetch last 30 days for monthly analysis
					break;
			}
			const { data, error } = await query;
			if (error) throw error;
			setExpenses(data || []);
			const total = (data || []).reduce(
				(sum, expense) => sum + Number(expense.amount),
				0
			);
			setTotalExpense(total);
			setLoading(false);
		} catch (error) {
			console.log(error);
		}
	};

	const fetchPreviousExpenses = async () => {
		setLoading(true);
		try {
			let query = supabase
				.from("expenses")
				.select("*")
				.order("created_at", { ascending: false });
			console.log("analysisType", analysisType);
			switch (analysisType) {
				// case "Yearly":
				// 	query = query.gte(
				// 		"created_at",
				// 		new Date(new Date().getFullYear() - 1, 0, 1).toISOString()
				// 	); // Fetch from the start of the year
				// 	break;
				case "Weekly": {
					const today = new Date();
					const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)

					// Get the difference to Monday
					const diffToMonday = (dayOfWeek + 6) % 7;

					const monday = new Date(today);
					monday.setDate(today.getDate() - diffToMonday);
					monday.setHours(0, 0, 0, 0); // Start of Monday
					query = query.gte("created_at", monday.toISOString());
					break;
				}
				default:
					query = query.gte(
						"created_at",
						new Date(
							new Date().getFullYear(),
							new Date().getMonth() - 1,
							1
						).toISOString()
					); // Fetch last 30 days for monthly analysis
					query = query.lte(
						"created_at",
						new Date(
							new Date().getFullYear(),
							new Date().getMonth(),
							1
						).toISOString()
					);
					break;
			}
			const { data, error } = await query;
			if (error) throw error;
			const total = (data || []).reduce(
				(sum, expense) => sum + Number(expense.amount),
				0
			);
			setTotalPreviousExpense(total);
			setLoading(false);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		fetchExpenses();
		fetchPreviousExpenses();
	}, [analysisType]);

	return (
		<>
			<Header />
			<div
				className="py-8 px-4"
				style={{
					background: "linear-gradient(to right, #9333ea, #2563eb)",
					borderBottomLeftRadius: 20,
					borderBottomRightRadius: 20,
				}}
			>
				<h1 className="text-2xl font-bold mb-2 text-white flex justify-center">
					{analysisType}&nbsp;Analysis
				</h1>
				<p className="text-2xl font-bold text-white flex justify-center mb-1">
					₹{totalExpense.toLocaleString("en-IN")}{" "}
					{getPercentageChange.type === "decrease" ? (
						<ArrowDown className="h-7 w-7 text-red-600 ml-2" />
					) : getPercentageChange.type === "increase" ? (
						<ArrowUp className="w-7 h-7 text-green-500 ml-2" />
					) : null}
				</p>
				<Tabs defaultValue="Weekly" className="w-full bg-transparent">
					<TabsList className="grid w-full grid-cols-2 rounded-full px-1 py-3">
						<TabsTrigger
							value="Weekly"
							className="rounded-full font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-blue-400 data-[state=inactive]:text-white data-[state=active]:py-2"
							onClick={() => setAnalysisType("Weekly")}
						>
							Weekly
						</TabsTrigger>
						<TabsTrigger
							value="Monthly"
							className="rounded-full font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-blue-400 data-[state=inactive]:text-white data-[state=active]:py-2"
							onClick={() => setAnalysisType("Monthly")}
						>
							Monthly
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>
			<p
				className="text-2xl font-bold mt-2 ml-8 mb-2"
				style={{
					background: "linear-gradient(to right, #9333ea, #2563eb)",
					WebkitTextFillColor: "transparent",
					WebkitBackgroundClip: "text",
				}}
			>
				All Expenses
			</p>
			{loading && (
				<div className="w-full flex justify-center align-items-center">
					<Loader2 className="h-6 w-6 animate-spin text-purple-500" />
				</div>
			)}
			{!loading && (
				<div className="space-y-3 px-4">
					{expenses.map((expense) => {
						const CategoryIcon = categoryIcons[expense.category];
						return (
							<Card
								key={expense.id}
								className="shadow-md bg-gradient-to-r from-white to-gray-50/50 border rounded-[20px] hover:border-gray-300 transition-colors overflow-hidden"
							>
								<CardContent className="flex items-center justify-between p-5">
									<div className="flex items-center justify-end gap-3 flex-1 min-w-0">
										<div
											className="p-2 rounded-[14px] shrink-0"
											style={{
												background:
													"linear-gradient(to right, #9333ea, #2563eb)",
											}}
										>
											<CategoryIcon className="h-7 w-7 text-white" />
										</div>
										<div className="text-left min-w-0 flex-1">
											<p className="font-semibold truncate text-sm">
												{expense.description || "No description"}
											</p>
											<p className="text-xs text-gray-600 font-semibold">
												{new Date(expense.created_at).getDate()}&nbsp;
												{new Date(expense.created_at).toLocaleString(
													"default",
													{
														month: "long",
													}
												)}
											</p>
										</div>

										<div className="flex items-end gap-1 shrink-0 flex-col">
											<p
												className="text-base font-bold whitespace-nowrap"
												style={{
													background:
														"linear-gradient(to right, #9333ea, #2563eb)",
													WebkitTextFillColor: "transparent",
													WebkitBackgroundClip: "text",
												}}
											>
												₹{expense.amount}
											</p>
											<Badge
												variant="secondary"
												className="text-xs font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:bg-gray-200"
											>
												{
													categories.find((item) => item.id == expense.category)
														.label
												}
											</Badge>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</>
	);
};

export default MonthlyAnalysis;
