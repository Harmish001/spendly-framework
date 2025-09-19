
import {
	BrowserRouter as Router,
	Routes,
	Route,
	useNavigate,
	useLocation,
} from "react-router-dom";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import TravelExpenses from "./pages/TravelExpenses";
import Statistics from "./pages/Statistics";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { toast } from "sonner";
import { ShareReceiver } from "./services/ShareReceiver";
import { Capacitor } from "@capacitor/core";
import MonthlyAnalysis from "./components/statistics/Analysis";
import LandingPage from "./pages/LandingPage";
import PasswordManager from "./pages/PasswordManager";
import ChatBotTest from "./pages/ChatBotTest";
import { FloatingChatBot } from "./components/chatbot/FloatingChatBot";
import { FloatingChatButton } from "./components/chatbot/FloatingChatButton";
import { createPortal } from "react-dom";


// Handle OAuth redirect and query parameters
const AuthHandler = () => {
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		navigator.serviceWorker.ready.then((registration) => {
			console.log("Service Worker registered:", registration);
		});
		// Initialize share receiver for native platforms
		if (Capacitor.isNativePlatform()) {
			ShareReceiver.initialize();
		}

		// Check for hash fragments that might contain OAuth response data
		if (location.hash || location.search) {
			// Let Supabase auth handle the redirect
			const handleRedirect = async () => {
				try {
					const { error, data } = await supabase.auth.getSession();

					if (error) {
						console.error("Error handling redirect:", error);
						toast.error("Authentication failed. Please try again.");
					} else if (data?.session) {
						// Check if this is a Google OAuth response
						const params = new URLSearchParams(
							location.hash.substring(1) || location.search
						);
						const provider = params.get("provider");

						if (provider === "google") {
							toast.success("Successfully connected with Google!");
						}

						navigate("/dashboard");
					}
				} catch (err) {
					console.error("Unexpected error during auth:", err);
					toast.error("An unexpected error occurred during authentication");
				}
			};

			handleRedirect();
		}
	}, [location, navigate]);

	return null;
};

function App() {
	const [isChatBotOpen, setIsChatBotOpen] = useState(false);
	
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		if (params.get("shared") === "expense_image") {
			handleSharedExpenseImage();
			// Clean URL
			window.history.replaceState({}, document.title, window.location.pathname);
		}
	}, []);

	const handleSharedExpenseImage = async () => {
		try {
			const cache = await caches.open("shared-data-v1");
			const dataRes = await cache.match("shared-data-latest");
			const imageRes = await cache.match("shared-image-latest");

			if (dataRes && imageRes) {
				const sharedData = await dataRes.json();
				const imageBlob = await imageRes.blob();

				// Create File object from blob
				const imageFile = new File([imageBlob], sharedData.imageName, {
					type: sharedData.imageType,
					lastModified: sharedData.timestamp
				});

				// Clean up cache
				await cache.delete("shared-data-latest");
				await cache.delete("shared-image-latest");

				// Process the image with AI to extract expense data
				processSharedImage(imageFile);
			} else {
				console.error("Shared image data not found");
				toast.error("Failed to retrieve shared image");
			}
		} catch (error) {
			console.error("Error handling shared image:", error);
			toast.error("Error processing shared image");
		}
	};

	const processSharedImage = async (imageFile: File) => {
		try {
			toast.success("Processing shared image...");

			// Convert image to base64
			const base64Image = await fileToBase64(imageFile);

			// Call the AI processing function
			const { data, error } = await supabase.functions.invoke('process-expense-image', {
				body: {
					image: base64Image
				}
			});

			if (error) {
				console.error('Error processing image:', error);
				toast.error("Failed to process the shared image");
				return;
			}

			const { amount, category, description } = data;

			// Dispatch event to open expense form with prefilled data
			window.dispatchEvent(new CustomEvent('sharedExpenseProcessed', {
				detail: {
					amount: amount?.toString() || '',
					category: category || 'others',
					description: description || 'Shared expense',
					date: new Date().toISOString().split('T')[0]
				}
			}));

			toast.success("Expense data extracted from shared image!");

		} catch (error) {
			console.error("Error processing shared image:", error);
			toast.error("Failed to process shared image");
		}
	};

	const fileToBase64 = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result as string;
				const base64 = result.split(',')[1];
				resolve(base64);
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	};

	return (
		<Router>
			<Routes>
				<Route path="/*" element={<AuthHandler />} />
				<Route path="/login" element={<Index />} />
				<Route path="/" element={<LandingPage />} />
				<Route path="/signup" element={<SignUp />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/travel-expenses" element={<TravelExpenses />} />
				<Route path="/passwords" element={<PasswordManager />} />
				<Route path="/statistics" element={<Statistics />} />
				<Route path="/monthlyAnalysis" element={<MonthlyAnalysis />} />
				<Route path="/chatbot-test" element={<ChatBotTest />} />

			</Routes>
			
			{/* Global Floating Chatbot */}
			<FloatingChatButton 
				onClick={() => setIsChatBotOpen(!isChatBotOpen)}
			/>
			{createPortal(
				<FloatingChatBot 
					isOpen={isChatBotOpen} 
					onToggle={() => setIsChatBotOpen(!isChatBotOpen)}
				/>,document.body)}
			
			<Toaster />
		</Router>
	);
}

export default App;
