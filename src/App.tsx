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
import { useEffect } from "react";
import { supabase } from "./integrations/supabase/client";
import { toast } from "sonner";
import { ShareReceiver } from "./services/ShareReceiver";
import { Capacitor } from "@capacitor/core";

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
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		if (params.get("shared") === "expense_image") {
			// Fetch data from cache here
			caches.open("shared-data-v1").then(async (cache) => {
				const dataRes = await cache.match("shared-data-latest");
				const imageRes = await cache.match("shared-image-latest");
				const sharedData = dataRes && (await dataRes.json());
				toast.success("Shared data received! Processing...");
				// TODO: Show preview or upload flow
			});
		}
	}, []);
	return (
		<Router>
			<Routes>
				<Route path="/*" element={<AuthHandler />} />
				<Route path="/" element={<Index />} />
				<Route path="/signup" element={<SignUp />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/travel-expenses" element={<TravelExpenses />} />
				<Route path="/statistics" element={<Statistics />} />
			</Routes>
			<Toaster />
		</Router>
	);
}

export default App;
