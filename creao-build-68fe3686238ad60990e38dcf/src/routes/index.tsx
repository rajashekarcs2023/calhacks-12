import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	useVapiDirectCall,
	useVapiGetCall,
} from "@/hooks/use-vapi-direct-call";
import { useVerify } from "@/hooks/use-verify";
import { useXrplMintDocumentNft } from "@/hooks/use-xrpl-mint-document-nft";
import { useXrplTimestamp } from "@/hooks/use-xrpl-timestamp";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import {
	AlertTriangle,
	Building2,
	Camera,
	Car,
	CheckCircle,
	Clock,
	DollarSign,
	FileText,
	Hash,
	History,
	Landmark,
	MapPin,
	Menu,
	Mic,
	Phone,
	Plus,
	Scale,
	Scroll,
	Send,
	Settings,
	Shield,
	Stamp,
	Ticket,
	Upload,
	Users,
	Vote,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
	component: App,
});

type Category =
	| "legal"
	| "money"
	| "community"
	| "voting"
	| "documents"
	| "dmv"
	| "laws"
	| "officials"
	| "tickets";

type IntentData = {
	category: Category;
	subcategory: string;
	department: string;
	service: string;
	icon: string;
	color: string;
};

type Conversation = {
	id: string;
	title: string;
	icon: string;
	timestamp: Date;
	intent?: IntentData;
	messages: Message[];
};

type Message = {
	id: string;
	type: "user" | "ai" | "system";
	content: string;
	timestamp: Date;
	urgent?: boolean;
};

type Task = {
	id: string;
	category: Category;
	title: string;
	date: Date;
	location?: string;
	status: "urgent" | "attention" | "ontrack";
	description: string;
};

type ScheduledCall = {
	id: string;
	date: Date;
	phoneNumber: string;
	purpose: string;
};

type TicketAppeal = {
	id: string;
	ticketNumber: string;
	amount: number;
	violation: string;
	issueDetected: string;
	successRate: number;
	status:
		| "analyzing"
		| "draft"
		| "submitted"
		| "under_review"
		| "approved"
		| "denied";
	submittedDate?: Date;
	decisionDue?: Date;
};

type LawAlert = {
	id: string;
	ordinanceNumber: string;
	title: string;
	passedDate: Date;
	effectiveDate: Date;
	plainEnglish: string;
	whoAffected: string[];
	actionRequired: string[];
	penalty: string;
	status: "unread" | "read" | "dismissed";
};

type OfficialMessage = {
	id: string;
	officialName: string;
	officialTitle: string;
	subject: string;
	message: string;
	sentDate: Date;
	status: "pending" | "sent" | "responded";
	responseDate?: Date;
};

type VapiCall = {
	id: string;
	callId?: string;
	status:
		| "initiating"
		| "queued"
		| "ringing"
		| "in-progress"
		| "forwarding"
		| "ended"
		| "completed"
		| "busy"
		| "no-answer"
		| "failed"
		| "canceled";
	purpose: string;
	phoneNumber: string;
	timestamp: Date;
	duration?: number;
	error?: string;
};

type XrplTimestamp = {
	id: string;
	sha256: string;
	txHash: string;
	explorerUrl: string;
	ledgerIndex: number;
	validated: boolean;
	timestamp: Date;
	fileName?: string;
};

const categories = [
	{ id: "legal" as Category, name: "Legal & Court", icon: Scale },
	{ id: "money" as Category, name: "Money & Benefits", icon: DollarSign },
	{ id: "community" as Category, name: "Community", icon: Users },
	{ id: "voting" as Category, name: "Voting", icon: Vote },
	{ id: "documents" as Category, name: "Documents", icon: FileText },
	{ id: "dmv" as Category, name: "DMV & Vehicles", icon: Car },
	{ id: "laws" as Category, name: "New Laws", icon: Scroll },
	{ id: "officials" as Category, name: "Officials", icon: Landmark },
	{ id: "tickets" as Category, name: "Tickets", icon: Ticket },
];

// Intent classification based on user input
const detectIntent = (userMessage: string): IntentData | null => {
	const lowerMsg = userMessage.toLowerCase();

	// Eviction / Housing
	if (
		lowerMsg.includes("evict") ||
		lowerMsg.includes("eviction") ||
		lowerMsg.includes("landlord") ||
		lowerMsg.includes("rent")
	) {
		return {
			category: "legal",
			subcategory: "eviction",
			department: "Legal Services",
			service: "Housing Rights",
			icon: "⚖️",
			color: "#2563EB",
		};
	}

	// Court dates
	if (lowerMsg.includes("court") || lowerMsg.includes("hearing")) {
		return {
			category: "legal",
			subcategory: "court",
			department: "Legal Services",
			service: "Court Dates",
			icon: "⚖️",
			color: "#2563EB",
		};
	}

	// Tickets
	if (
		lowerMsg.includes("ticket") ||
		lowerMsg.includes("citation") ||
		lowerMsg.includes("parking")
	) {
		return {
			category: "tickets",
			subcategory: "ticket",
			department: "Parking & Citations",
			service: "Ticket Appeals",
			icon: "🎫",
			color: "#7C3AED",
		};
	}

	// Food stamps / SNAP
	if (
		lowerMsg.includes("food stamp") ||
		lowerMsg.includes("snap") ||
		lowerMsg.includes("ebt")
	) {
		return {
			category: "money",
			subcategory: "snap",
			department: "Social Services",
			service: "SNAP Benefits",
			icon: "💰",
			color: "#059669",
		};
	}

	// Benefits
	if (lowerMsg.includes("benefit") || lowerMsg.includes("medicaid")) {
		return {
			category: "money",
			subcategory: "benefits",
			department: "Social Services",
			service: "Benefits Eligibility",
			icon: "💰",
			color: "#059669",
		};
	}

	// Community issues (pothole, streetlight, etc.)
	if (
		lowerMsg.includes("pothole") ||
		lowerMsg.includes("street") ||
		lowerMsg.includes("light") ||
		lowerMsg.includes("graffiti") ||
		lowerMsg.includes("broken")
	) {
		return {
			category: "community",
			subcategory: "311",
			department: "Public Works",
			service: "Street Maintenance",
			icon: "🏘️",
			color: "#EA580C",
		};
	}

	// Voting
	if (
		lowerMsg.includes("vote") ||
		lowerMsg.includes("ballot") ||
		lowerMsg.includes("polling")
	) {
		return {
			category: "voting",
			subcategory: "voter_info",
			department: "Elections Office",
			service: "Voter Information",
			icon: "🗳️",
			color: "#DC2626",
		};
	}

	// DMV
	if (
		lowerMsg.includes("dmv") ||
		lowerMsg.includes("license") ||
		lowerMsg.includes("registration")
	) {
		return {
			category: "dmv",
			subcategory: "dmv",
			department: "DMV Services",
			service: "Vehicle Services",
			icon: "🚗",
			color: "#0891B2",
		};
	}

	return null;
};

function App() {
	const { mutateAsync: createCall, isPending: isCreatingCall } =
		useVapiDirectCall();
	const { mutateAsync: getCall } = useVapiGetCall();
	const xrplTimestamp = useXrplTimestamp();
	const xrplMintNft = useXrplMintDocumentNft();
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [activeConversationId, setActiveConversationId] = useState<
		string | null
	>(null);
	const [currentIntent, setCurrentIntent] = useState<IntentData | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [vapiCalls, setVapiCalls] = useState<VapiCall[]>([]);
	const [xrplTimestamps, setXrplTimestamps] = useState<XrplTimestamp[]>([]);
	const [showXrplModal, setShowXrplModal] = useState(false);
	const [xrplDocumentHash, setXrplDocumentHash] = useState("");
	const [xrplFileName, setXrplFileName] = useState("");
	const [tasks, setTasks] = useState<Task[]>([
		{
			id: "1",
			category: "legal",
			title: "Court Hearing - Traffic Violation",
			date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
			location: "Municipal Court, Room 302",
			status: "attention",
			description: "Appearance required for traffic citation #TX-2024-1234",
		},
		{
			id: "2",
			category: "money",
			title: "SNAP Benefits Renewal",
			date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			location: "Online submission",
			status: "ontrack",
			description: "Submit renewal documents by deadline",
		},
	]);
	const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([
		{
			id: "1",
			date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
			phoneNumber: "(555) 123-4567",
			purpose: "Court date reminder",
		},
	]);
	const [ticketAppeals, setTicketAppeals] = useState<TicketAppeal[]>([]);
	const [lawAlerts, setLawAlerts] = useState<LawAlert[]>([
		{
			id: "1",
			ordinanceNumber: "2025-08",
			title: "Calorie posting requirement",
			passedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
			effectiveDate: new Date("2026-01-01"),
			plainEnglish:
				"All restaurants must display nutritional information for menu items with calorie counts visible to customers.",
			whoAffected: ["Restaurants", "Cafes with menus"],
			actionRequired: [
				"Calculate calories for menu items",
				"Update menus/menu boards",
				"Display by Jan 1, 2026",
			],
			penalty: "$250-$1000 fine",
			status: "unread",
		},
	]);
	const [officialMessages, setOfficialMessages] = useState<OfficialMessage[]>(
		[],
	);
	const [showDocumentModal, setShowDocumentModal] = useState(false);
	const [showCallbackModal, setShowCallbackModal] = useState(false);
	const [callbackPhone, setCallbackPhone] = useState("");
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [language, setLanguage] = useState("en");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Show welcome message on first load
	useEffect(() => {
		if (messages.length === 0 && !activeConversationId) {
			setMessages([
				{
					id: "welcome",
					type: "ai",
					content: `Hi! I'm Civic AI. I help with government services and can make voice calls using Vapi.

Just tell me what you need:
• Legal issues (court dates, evictions, tickets)
• Money help (food stamps, healthcare, benefits)
• Community issues (potholes, broken lights)
• Voting information
• Or anything else government-related

**Try saying: "call me for eviction case"** to test the Vapi voice call feature!

What can I help you with today?`,
					timestamp: new Date(),
				},
			]);
		}
	}, [messages.length, activeConversationId]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	});

	const handleNewConversation = () => {
		// Save current conversation if exists
		if (activeConversationId && messages.length > 0) {
			setConversations((prev) => {
				const existing = prev.find((c) => c.id === activeConversationId);
				if (existing) {
					return prev.map((c) =>
						c.id === activeConversationId ? { ...c, messages } : c,
					);
				}
				return prev;
			});
		}

		// Start fresh conversation
		setActiveConversationId(null);
		setCurrentIntent(null);
		setMessages([
			{
				id: "welcome",
				type: "ai",
				content: `Hi! I'm Civic AI. I help with government services and can make voice calls using Vapi.

Just tell me what you need:
• Legal issues (court dates, evictions, tickets)
• Money help (food stamps, healthcare, benefits)
• Community issues (potholes, broken lights)
• Voting information
• Or anything else government-related

**Try saying: "call me for eviction case"** to test the Vapi voice call feature!

What can I help you with today?`,
				timestamp: new Date(),
			},
		]);
		setIsSidebarOpen(false);
	};

	const handleResumeConversation = (conversationId: string) => {
		const conversation = conversations.find((c) => c.id === conversationId);
		if (conversation) {
			setActiveConversationId(conversationId);
			setMessages(conversation.messages);
			setCurrentIntent(conversation.intent || null);
			setIsSidebarOpen(false);
		}
	};

	// Function to initiate a Vapi call
	const initiateVapiCall = async (
		phoneNumber: string,
		purpose: string,
		context: string,
	) => {
		const vapiCallId = `vapi-${Date.now()}`;
		const newCall: VapiCall = {
			id: vapiCallId,
			status: "initiating",
			purpose,
			phoneNumber,
			timestamp: new Date(),
		};

		setVapiCalls((prev) => [...prev, newCall]);

		const systemMessage: Message = {
			id: `system-${Date.now()}`,
			type: "system",
			content: `📞 Initiating call to ${phoneNumber} for ${purpose}...`,
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, systemMessage]);

		try {
			// Call Vapi MCP server to create the call using the configured assistant ID
			const callData = await createCall({
				assistantId: "7ce91853-c695-4f00-85c4-5ce178ef8536",
				phoneNumberId: "bde66960-0c56-4a4f-9845-44af35789e01", // Govtassist phone number
				customer: {
					number: phoneNumber,
				},
			});

			// Update call status
			setVapiCalls((prev) =>
				prev.map((call) =>
					call.id === vapiCallId
						? { ...call, callId: callData.id, status: "ringing" }
						: call,
				),
			);

			const successMessage: Message = {
				id: `success-${Date.now()}`,
				type: "ai",
				content: `✅ Call initiated successfully! Call ID: ${callData.id}. The phone is now ringing.`,
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, successMessage]);

			// Monitor the call
			monitorVapiCall(vapiCallId, callData.id);
		} catch (error) {
			const errorMessage: Message = {
				id: `error-${Date.now()}`,
				type: "ai",
				content: `❌ Failed to initiate call: ${error instanceof Error ? error.message : "Unknown error"}. Please check your Vapi configuration and API key.`,
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, errorMessage]);

			setVapiCalls((prev) =>
				prev.map((call) =>
					call.id === vapiCallId
						? {
								...call,
								status: "failed",
								error: error instanceof Error ? error.message : "Unknown error",
							}
						: call,
				),
			);
		}
	};

	// Function to monitor Vapi call status
	const monitorVapiCall = async (localCallId: string, vapiCallId: string) => {
		const checkStatus = async () => {
			try {
				// Call the Vapi API directly to get call status
				const callData = (await getCall(vapiCallId)) as {
					id: string;
					status: VapiCall["status"];
					duration?: number;
					startedAt?: string;
					endedAt?: string;
				};

				// Calculate duration if call has started and ended
				let duration: number | undefined;
				if (callData.startedAt && callData.endedAt) {
					const start = new Date(callData.startedAt).getTime();
					const end = new Date(callData.endedAt).getTime();
					duration = Math.floor((end - start) / 1000); // Convert to seconds
				}

				setVapiCalls((prev) =>
					prev.map((call) =>
						call.id === localCallId
							? {
									...call,
									status: callData.status as VapiCall["status"],
									duration,
								}
							: call,
					),
				);

				// If call is still in progress, check again in 5 seconds
				if (
					callData.status === "ringing" ||
					callData.status === "in-progress" ||
					callData.status === "queued"
				) {
					setTimeout(() => monitorVapiCall(localCallId, vapiCallId), 5000);
				} else if (callData.status === "ended") {
					const completionMessage: Message = {
						id: `complete-${Date.now()}`,
						type: "ai",
						content: `✅ Call completed. Duration: ${duration || 0} seconds.`,
						timestamp: new Date(),
					};

					setMessages((prev) => [...prev, completionMessage]);
				}
			} catch (error) {
				console.error("Error monitoring call:", error);
			}
		};

		// Start monitoring
		setTimeout(checkStatus, 5000);
	};

	const handleSendMessage = () => {
		if (!inputValue.trim()) return;

		const userMessage: Message = {
			id: `user-${Date.now()}`,
			type: "user",
			content: inputValue,
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		const originalInput = inputValue;
		setInputValue("");
		setIsTyping(true);

		// Detect intent from user message
		const detectedIntent = detectIntent(inputValue);

		// Check if user wants a phone call
		const lowerInput = originalInput.toLowerCase();
		const wantsCall =
			lowerInput.includes("call me") ||
			lowerInput.includes("phone me") ||
			lowerInput.includes("ring me");

		// Update intent if detected
		if (detectedIntent && !currentIntent) {
			setTimeout(() => {
				setCurrentIntent(detectedIntent);
			}, 800);
		}

		// Simulate AI response
		setTimeout(() => {
			let aiResponse = "";

			if (detectedIntent) {
				// Contextual responses based on intent
				switch (detectedIntent.subcategory) {
					case "eviction":
						if (wantsCall) {
							// Extract phone number or use default for testing
							const phoneNumber = "+16695774085"; // Default test number
							aiResponse = `I understand you need urgent help with an eviction case. I'm going to call you right now to discuss your situation and explain your legal rights.`;

							// Trigger Vapi call after response
							setTimeout(() => {
								initiateVapiCall(
									phoneNumber,
									"Eviction Case Assistance",
									"your eviction notice and legal rights",
								);
							}, 1000);
						} else {
							aiResponse =
								"That sounds like an eviction notice. This is serious but you have rights. Can you upload a photo so I can read it and help you understand your options? Or would you like me to call you to discuss this?";
						}
						break;
					case "ticket":
						aiResponse = `I can help you with that ticket. Upload a photo of it and I'll analyze whether it's valid. If there are errors, I can auto-generate an appeal letter for you.`;
						break;
					case "snap":
						aiResponse = `Let me help you check if you qualify for SNAP benefits. Can you tell me:
• How many people in your household?
• Your approximate monthly income?
• Do you have any children under 18?`;
						break;
					case "311":
						aiResponse = `I can help you report that to the city. Let me get the details:
• What's the exact location or nearest intersection?
• How long has this been an issue?
• Is it creating a safety hazard?

I'll submit a 311 request and track it for you.`;
						break;
					case "court":
						aiResponse = `I can help you prepare for your court date. Tell me:
• What's the date and time?
• What type of case is it?
• Do you have any documents related to it?

I'll create a reminder and help you understand what to expect.`;
						break;
					case "voter_info":
						aiResponse = `I can help you with voting information. What do you need?
• Check if you're registered to vote
• Find your polling location
• See what's on your ballot
• Register to vote`;
						break;
					default:
						aiResponse =
							"I understand. Let me help you with that. Can you provide more details so I can assist you better?";
				}
			} else {
				// Generic helpful response
				aiResponse = `I'm here to help! Can you tell me a bit more about what you need? For example:
• Are you dealing with a legal issue, ticket, or court date?
• Do you need help with benefits like food stamps or healthcare?
• Is there a problem in your neighborhood (pothole, broken light, etc.)?
• Do you need voting information?`;
			}

			const aiMessage: Message = {
				id: `ai-${Date.now()}`,
				type: "ai",
				content: aiResponse,
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, aiMessage]);
			setIsTyping(false);

			// Save conversation
			if (!activeConversationId) {
				const newConversationId = `conv-${Date.now()}`;
				const newConversation: Conversation = {
					id: newConversationId,
					title: detectedIntent
						? `${detectedIntent.icon} ${detectedIntent.service}`
						: "💬 General Chat",
					icon: detectedIntent?.icon || "💬",
					timestamp: new Date(),
					intent: detectedIntent || undefined,
					messages: [...messages, userMessage, aiMessage],
				};
				setConversations((prev) => [newConversation, ...prev].slice(0, 5));
				setActiveConversationId(newConversationId);
			} else {
				// Update existing conversation
				setConversations((prev) =>
					prev.map((c) =>
						c.id === activeConversationId
							? {
									...c,
									messages: [...messages, userMessage, aiMessage],
									intent: detectedIntent || c.intent,
									title: detectedIntent
										? `${detectedIntent.icon} ${detectedIntent.service}`
										: c.title,
									timestamp: new Date(),
								}
							: c,
					),
				);
			}
		}, 1500);
	};

	const handleDocumentUpload = (file: File) => {
		setShowDocumentModal(false);

		const uploadMessage: Message = {
			id: `upload-${Date.now()}`,
			type: "user",
			content: `📎 Uploaded: ${file.name}`,
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, uploadMessage]);
		setIsTyping(true);

		setTimeout(() => {
			const analysisMessage: Message = {
				id: `analysis-${Date.now()}`,
				type: "ai",
				content: `I've analyzed your document "${file.name}". This appears to be a court notice. I've created a task reminder for you. Would you like me to explain what you need to do next?`,
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, analysisMessage]);
			setIsTyping(false);
		}, 2000);
	};

	const handleScheduleCallback = () => {
		if (!callbackPhone.trim()) return;

		const newCall: ScheduledCall = {
			id: `call-${Date.now()}`,
			date: new Date(Date.now() + 30 * 60 * 1000),
			phoneNumber: callbackPhone,
			purpose: "Requested callback",
		};

		setScheduledCalls((prev) => [...prev, newCall]);

		const callbackMessage: Message = {
			id: `callback-${Date.now()}`,
			type: "ai",
			content: `✅ I've scheduled a callback to ${callbackPhone} in approximately 30 minutes. You'll receive a call to discuss your needs.`,
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, callbackMessage]);
		setShowCallbackModal(false);
		setCallbackPhone("");
	};

	const getStatusColor = (status: Task["status"]) => {
		switch (status) {
			case "urgent":
				return "border-red-600";
			case "attention":
				return "border-yellow-500";
			case "ontrack":
				return "border-green-600";
		}
	};

	const getCountdown = (date: Date) => {
		const now = new Date();
		const diff = date.getTime() - now.getTime();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

		if (days > 0) return `${days} days`;
		if (hours > 0) return `${hours} hours`;
		return "Soon";
	};

	const getRelativeTime = (date: Date) => {
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / (1000 * 60));
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		if (days === 1) return "Yesterday";
		if (days < 7) return `${days} days ago`;
		return date.toLocaleDateString();
	};

	return (
		<div className="flex h-screen overflow-hidden bg-[#F9FAFB]">
			{/* Left Sidebar */}
			<div
				className={cn(
					"fixed inset-y-0 left-0 z-50 w-[200px] transform bg-[#1F2937] text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
					isSidebarOpen ? "translate-x-0" : "-translate-x-full",
				)}
			>
				<div className="flex h-full flex-col">
					{/* Logo and status */}
					<div className="border-b border-gray-700 p-4">
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-lg font-bold">Civic AI</h1>
								<div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
									<div className="h-2 w-2 rounded-full bg-green-500" />
									<span>Online</span>
								</div>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="md:hidden text-white"
								onClick={() => setIsSidebarOpen(false)}
							>
								<X className="h-5 w-5" />
							</Button>
						</div>
					</div>

					{/* Call button */}
					<div className="p-4">
						<Button
							className="w-full bg-[#059669] hover:bg-[#047857] text-white font-semibold text-sm py-2"
							onClick={() => window.open("tel:1-844-CIVIC-AI")}
						>
							<Phone className="h-4 w-4 mr-2" />
							Call 1-844-CIVIC-AI
						</Button>
					</div>

					{/* New Conversation Button */}
					<div className="px-4 pb-4">
						<Button
							className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold text-sm py-2"
							onClick={handleNewConversation}
						>
							<Plus className="h-4 w-4 mr-2" />
							New Conversation
						</Button>
					</div>

					{/* Recent Conversations */}
					<ScrollArea className="flex-1 px-2">
						<div className="space-y-2">
							{conversations.length > 0 && (
								<div className="px-2 py-2">
									<h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
										Recent
									</h3>
								</div>
							)}
							{conversations.map((conv) => (
								<button
									key={conv.id}
									type="button"
									onClick={() => handleResumeConversation(conv.id)}
									className={cn(
										"w-full text-left rounded-md px-3 py-2 transition-colors",
										activeConversationId === conv.id
											? "bg-[#374151] text-white"
											: "text-gray-300 hover:bg-[#374151] hover:text-white",
									)}
								>
									<div className="flex items-start gap-2">
										<span className="text-base mt-0.5">{conv.icon}</span>
										<div className="flex-1 min-w-0">
											<p className="text-xs font-medium truncate">
												{conv.title}
											</p>
											<p className="text-xs text-gray-400">
												{getRelativeTime(conv.timestamp)}
											</p>
										</div>
									</div>
								</button>
							))}
						</div>
					</ScrollArea>

					{/* Bottom section */}
					<div className="border-t border-gray-700 p-4 space-y-3">
						<Select value={language} onValueChange={setLanguage}>
							<SelectTrigger className="w-full bg-[#374151] border-gray-600 text-white text-sm h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="en">English</SelectItem>
								<SelectItem value="es">Español</SelectItem>
								<SelectItem value="zh">中文</SelectItem>
								<SelectItem value="vi">Tiếng Việt</SelectItem>
							</SelectContent>
						</Select>
						<Button
							variant="ghost"
							className="w-full justify-start text-gray-300 hover:text-white hover:bg-[#374151] h-8 text-sm"
						>
							<Settings className="h-4 w-4 mr-2" />
							Settings
						</Button>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex flex-1 flex-col overflow-hidden">
				{/* Header with Dynamic Routing */}
				<div className="flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
					<div className="flex items-center gap-3">
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden"
							onClick={() => setIsSidebarOpen(true)}
						>
							<Menu className="h-5 w-5" />
						</Button>
						{currentIntent ? (
							<div
								className="flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium animate-in fade-in duration-300"
								style={{ backgroundColor: currentIntent.color }}
							>
								<span className="text-base">{currentIntent.icon}</span>
								<span className="text-sm">
									{currentIntent.department} → {currentIntent.service}
								</span>
							</div>
						) : (
							<div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600">
								<span className="text-base">💬</span>
								<span className="text-sm">General Chat</span>
							</div>
						)}
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setShowCallbackModal(true)}
						>
							<Phone className="h-4 w-4 mr-1" />
							Request Callback
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setShowDocumentModal(true)}
						>
							<Upload className="h-4 w-4 mr-1" />
							Upload Document
						</Button>
						<Button variant="outline" size="sm">
							<Mic className="h-4 w-4 mr-1" />
							Voice Message
						</Button>
					</div>
				</div>

				{/* Messages Area */}
				<ScrollArea className="flex-1 p-4">
					<div className="mx-auto max-w-3xl space-y-4">
						{messages.map((message) => (
							<div
								key={message.id}
								className={cn(
									"flex gap-3",
									message.type === "user" ? "justify-end" : "justify-start",
								)}
							>
								{message.type !== "user" && (
									<Avatar className="h-8 w-8 shrink-0">
										<AvatarFallback className="bg-[#2563EB] text-white text-xs">
											CA
										</AvatarFallback>
									</Avatar>
								)}
								<div
									className={cn(
										"max-w-[80%] rounded-lg px-4 py-3 shadow-sm",
										message.type === "user"
											? "bg-[#2563EB] text-white"
											: "bg-white border",
										message.urgent && "border-red-500 border-2 bg-red-50",
									)}
								>
									{message.urgent && (
										<div className="mb-2 flex items-center gap-2 text-red-600 font-semibold text-sm">
											<AlertTriangle className="h-4 w-4" />
											URGENT
										</div>
									)}
									<p className="text-sm leading-relaxed whitespace-pre-wrap">
										{message.content}
									</p>
									<p
										className={cn(
											"mt-2 text-xs opacity-70",
											message.type === "user" ? "text-white" : "text-gray-500",
										)}
									>
										{message.timestamp.toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</p>
								</div>
								{message.type === "user" && (
									<Avatar className="h-8 w-8 shrink-0">
										<AvatarFallback className="bg-gray-500 text-white text-xs">
											U
										</AvatarFallback>
									</Avatar>
								)}
							</div>
						))}
						{isTyping && (
							<div className="flex gap-3 justify-start">
								<Avatar className="h-8 w-8 shrink-0">
									<AvatarFallback className="bg-[#2563EB] text-white text-xs">
										CA
									</AvatarFallback>
								</Avatar>
								<div className="bg-white border rounded-lg px-4 py-3 shadow-sm">
									<div className="flex gap-1">
										<div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
										<div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce delay-100" />
										<div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce delay-200" />
									</div>
								</div>
							</div>
						)}
						<div ref={messagesEndRef} />
					</div>
				</ScrollArea>

				{/* Input Area */}
				<div className="border-t bg-white p-4">
					<div className="mx-auto max-w-3xl">
						<div className="flex items-end gap-2">
							<div className="flex-1">
								<Textarea
									placeholder="Type your message..."
									value={inputValue}
									onChange={(e) => setInputValue(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											handleSendMessage();
										}
									}}
									className="min-h-[44px] max-h-[120px] resize-none"
									rows={1}
								/>
							</div>
							<Button
								size="icon"
								className="h-[44px] w-[44px] shrink-0 bg-[#2563EB] hover:bg-[#1d4ed8]"
								onClick={handleSendMessage}
							>
								<Send className="h-5 w-5" />
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Right Panel - Keeping existing design */}
			<div className="hidden lg:flex w-[350px] flex-col border-l bg-white overflow-hidden">
				<ScrollArea className="flex-1">
					<div className="p-4 space-y-6">
						{/* Active Tasks */}
						<div>
							<h3 className="text-sm font-semibold mb-3">Active Tasks</h3>
							<div className="space-y-3">
								{tasks.map((task) => {
									const CategoryIcon = categories.find(
										(c) => c.id === task.category,
									)?.icon;
									return (
										<Card
											key={task.id}
											className={cn(
												"border-l-4 shadow-sm",
												getStatusColor(task.status),
											)}
										>
											<CardHeader className="p-3 pb-2">
												<div className="flex items-start gap-2">
													{CategoryIcon && (
														<CategoryIcon className="h-4 w-4 mt-0.5 shrink-0" />
													)}
													<div className="flex-1 min-w-0">
														<CardTitle className="text-sm leading-tight">
															{task.title}
														</CardTitle>
														<CardDescription className="text-xs mt-1">
															{task.description}
														</CardDescription>
													</div>
												</div>
											</CardHeader>
											<CardContent className="p-3 pt-0 space-y-2">
												<div className="flex items-center gap-1 text-xs text-gray-600">
													<Clock className="h-3 w-3" />
													<span>{task.date.toLocaleDateString()}</span>
													<Badge variant="outline" className="ml-auto text-xs">
														{getCountdown(task.date)}
													</Badge>
												</div>
												{task.location && (
													<div className="flex items-center gap-1 text-xs text-gray-600">
														<MapPin className="h-3 w-3" />
														<span className="truncate">{task.location}</span>
													</div>
												)}
												<div className="flex gap-2 pt-1">
													<Button
														size="sm"
														variant="outline"
														className="flex-1 h-7 text-xs"
													>
														View Details
													</Button>
													<Button
														size="sm"
														variant="outline"
														className="h-7 text-xs"
													>
														<Shield className="h-3 w-3" />
													</Button>
												</div>
											</CardContent>
										</Card>
									);
								})}
							</div>
						</div>

						{/* Vapi Calls - Active Voice Calls */}
						{vapiCalls.length > 0 && (
							<div>
								<h3 className="text-sm font-semibold mb-3">
									Active Voice Calls (Vapi)
								</h3>
								<div className="space-y-2">
									{vapiCalls.map((call) => (
										<Card
											key={call.id}
											className={cn(
												"shadow-sm",
												call.status === "failed"
													? "border-red-300 bg-red-50"
													: call.status === "completed"
														? "border-green-300 bg-green-50"
														: "border-blue-300 bg-blue-50",
											)}
										>
											<CardContent className="p-3">
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<Phone
															className={cn(
																"h-4 w-4",
																call.status === "failed"
																	? "text-red-600"
																	: call.status === "completed"
																		? "text-green-600"
																		: "text-blue-600 animate-pulse",
															)}
														/>
														<span className="text-sm font-medium">
															{call.status === "initiating" && "Initiating..."}
															{call.status === "ringing" && "Ringing..."}
															{call.status === "in-progress" && "In Progress"}
															{call.status === "completed" && "Completed"}
															{call.status === "failed" && "Failed"}
														</span>
													</div>
													<p className="text-xs text-gray-700 font-semibold">
														{call.purpose}
													</p>
													<p className="text-xs text-gray-600">
														{call.phoneNumber}
													</p>
													{call.callId && (
														<p className="text-xs text-gray-500 font-mono">
															ID: {call.callId}
														</p>
													)}
													{call.duration && (
														<p className="text-xs text-gray-600">
															Duration: {call.duration}s
														</p>
													)}
													{call.error && (
														<p className="text-xs text-red-600">
															Error: {call.error}
														</p>
													)}
													<p className="text-xs text-gray-400">
														{call.timestamp.toLocaleTimeString()}
													</p>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						)}

						{/* Scheduled Calls */}
						<div>
							<h3 className="text-sm font-semibold mb-3">Scheduled Calls</h3>
							<div className="space-y-2">
								{scheduledCalls.map((call) => (
									<Card key={call.id} className="shadow-sm">
										<CardContent className="p-3">
											<div className="space-y-2">
												<div className="flex items-center gap-2">
													<Phone className="h-4 w-4 text-[#059669]" />
													<span className="text-sm font-medium">
														{call.date.toLocaleString([], {
															month: "short",
															day: "numeric",
															hour: "2-digit",
															minute: "2-digit",
														})}
													</span>
												</div>
												<p className="text-xs text-gray-600">
													{call.phoneNumber}
												</p>
												<p className="text-xs text-gray-500">{call.purpose}</p>
												<div className="flex gap-2 pt-1">
													<Button
														size="sm"
														variant="outline"
														className="flex-1 h-7 text-xs"
													>
														Reschedule
													</Button>
													<Button
														size="sm"
														variant="outline"
														className="flex-1 h-7 text-xs text-red-600 hover:text-red-700"
													>
														Cancel
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</div>

						{/* Law Alerts */}
						{lawAlerts.filter((a) => a.status === "unread").length > 0 && (
							<div>
								<h3 className="text-sm font-semibold mb-3">Law Alerts</h3>
								<Card className="shadow-sm border-orange-200 bg-orange-50">
									<CardContent className="p-3">
										<div className="space-y-2">
											<div className="flex items-start gap-2">
												<Scroll className="h-4 w-4 text-orange-600 mt-0.5" />
												<div className="flex-1">
													<p className="text-sm font-semibold text-orange-900">
														Active Monitoring
													</p>
													<p className="text-xs text-orange-700 mt-1">
														Restaurant regulations
													</p>
													<div className="flex items-center gap-1 mt-1">
														<Badge variant="destructive" className="text-xs">
															{
																lawAlerts.filter((a) => a.status === "unread")
																	.length
															}{" "}
															new alert
														</Badge>
													</div>
												</div>
											</div>
											<div className="text-xs text-orange-700 pt-1">
												Next city council meeting:
												<br />
												Nov 20, 2025 at 6:00 PM
											</div>
											<div className="flex gap-2 pt-1">
												<Button
													size="sm"
													variant="outline"
													className="flex-1 h-7 text-xs"
												>
													View Alerts
												</Button>
												<Button
													size="sm"
													variant="outline"
													className="h-7 text-xs"
												>
													Settings
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						)}

						{/* Pending Appeals */}
						{ticketAppeals.length > 0 && (
							<div>
								<h3 className="text-sm font-semibold mb-3">Ticket Appeals</h3>
								<div className="space-y-2">
									{ticketAppeals.map((appeal) => (
										<Card
											key={appeal.id}
											className="shadow-sm border-yellow-200 bg-yellow-50"
										>
											<CardContent className="p-3">
												<div className="space-y-2">
													<div className="flex items-start gap-2">
														<Ticket className="h-4 w-4 text-yellow-700 mt-0.5" />
														<div className="flex-1">
															<p className="text-sm font-semibold text-yellow-900">
																Ticket #{appeal.ticketNumber}
															</p>
															{appeal.submittedDate && (
																<p className="text-xs text-yellow-700 mt-1">
																	Contested:{" "}
																	{appeal.submittedDate.toLocaleDateString()}
																</p>
															)}
															<p className="text-xs text-yellow-700">
																Status:{" "}
																{appeal.status === "submitted"
																	? "Under review"
																	: appeal.status}
															</p>
															{appeal.decisionDue && (
																<p className="text-xs text-yellow-700">
																	Decision due:{" "}
																	{appeal.decisionDue.toLocaleDateString()}
																</p>
															)}
														</div>
													</div>
													<div className="text-xs text-yellow-700 bg-yellow-100 rounded px-2 py-1">
														{appeal.successRate}% success rate for this type
													</div>
													<div className="flex gap-2 pt-1">
														<Button
															size="sm"
															variant="outline"
															className="flex-1 h-7 text-xs"
														>
															View Appeal
														</Button>
														<Button
															size="sm"
															variant="outline"
															className="h-7 text-xs"
														>
															Proof
														</Button>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						)}

						{/* Official Messages */}
						{officialMessages.length > 0 && (
							<div>
								<h3 className="text-sm font-semibold mb-3">
									Messages to Officials
								</h3>
								<div className="space-y-2">
									{officialMessages.map((msg) => (
										<Card
											key={msg.id}
											className="shadow-sm border-blue-200 bg-blue-50"
										>
											<CardContent className="p-3">
												<div className="space-y-2">
													<div className="flex items-start gap-2">
														<Landmark className="h-4 w-4 text-blue-700 mt-0.5" />
														<div className="flex-1">
															<p className="text-sm font-semibold text-blue-900">
																To: {msg.officialTitle} {msg.officialName}
															</p>
															<p className="text-xs text-blue-700 mt-1">
																Re: {msg.subject}
															</p>
															<p className="text-xs text-blue-700">
																Sent:{" "}
																{Math.floor(
																	(Date.now() - msg.sentDate.getTime()) /
																		(1000 * 60 * 60 * 24),
																)}{" "}
																days ago
															</p>
															<p className="text-xs text-blue-700">
																⏳ Awaiting response
															</p>
														</div>
													</div>
													<Button
														size="sm"
														variant="outline"
														className="w-full h-7 text-xs"
													>
														Follow Up
													</Button>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						)}

						{/* Quick Actions */}
						<div>
							<h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
							<div className="space-y-2">
								<Button
									variant="outline"
									className="w-full justify-start h-auto py-3"
									onClick={() => setShowDocumentModal(true)}
								>
									<Camera className="h-5 w-5 mr-3" />
									<div className="text-left">
										<div className="font-semibold text-sm">Scan Document</div>
										<div className="text-xs text-gray-500">Upload or photo</div>
									</div>
								</Button>
								<Button
									variant="outline"
									className="w-full justify-start h-auto py-3"
								>
									<CheckCircle className="h-5 w-5 mr-3" />
									<div className="text-left">
										<div className="font-semibold text-sm">Check Benefits</div>
										<div className="text-xs text-gray-500">
											Eligibility check
										</div>
									</div>
								</Button>
								<Button
									variant="outline"
									className="w-full justify-start h-auto py-3"
								>
									<AlertTriangle className="h-5 w-5 mr-3" />
									<div className="text-left">
										<div className="font-semibold text-sm">Report Issue</div>
										<div className="text-xs text-gray-500">City services</div>
									</div>
								</Button>
							</div>
						</div>

						{/* Recent Activity */}
						<div>
							<h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
							<div className="space-y-3">
								<div className="flex gap-3">
									<div className="w-1 bg-[#2563EB] rounded-full" />
									<div className="flex-1 pb-3">
										<p className="text-xs font-medium">Document analyzed</p>
										<p className="text-xs text-gray-500 mt-0.5">
											Court notice processed
										</p>
										<p className="text-xs text-gray-400 mt-1">2 hours ago</p>
									</div>
								</div>
								<div className="flex gap-3">
									<div className="w-1 bg-[#059669] rounded-full" />
									<div className="flex-1 pb-3">
										<p className="text-xs font-medium">Callback scheduled</p>
										<p className="text-xs text-gray-500 mt-0.5">
											Tomorrow at 2:00 PM
										</p>
										<p className="text-xs text-gray-400 mt-1">5 hours ago</p>
									</div>
								</div>
								<div className="flex gap-3">
									<div className="w-1 bg-gray-300 rounded-full" />
									<div className="flex-1">
										<p className="text-xs font-medium">
											Benefits check completed
										</p>
										<p className="text-xs text-gray-500 mt-0.5">
											Eligible for SNAP
										</p>
										<p className="text-xs text-gray-400 mt-1">Yesterday</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</ScrollArea>
			</div>

			{/* Document Upload Modal */}
			<Dialog open={showDocumentModal} onOpenChange={setShowDocumentModal}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Upload Document</DialogTitle>
						<DialogDescription>
							Take a photo or upload a file for analysis
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="border-2 border-dashed rounded-lg p-8 text-center">
							<Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
							<p className="text-sm text-gray-600 mb-4">
								Click to take a photo or upload a file
							</p>
							<input
								type="file"
								accept="image/*,.pdf"
								className="hidden"
								id="file-upload"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) handleDocumentUpload(file);
								}}
							/>
							<label htmlFor="file-upload">
								<Button asChild>
									<span>Choose File</span>
								</Button>
							</label>
						</div>
						<p className="text-xs text-gray-500 text-center">
							Supported formats: JPG, PNG, PDF
						</p>
					</div>
				</DialogContent>
			</Dialog>

			{/* Callback Modal */}
			<Dialog open={showCallbackModal} onOpenChange={setShowCallbackModal}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Schedule Callback</DialogTitle>
						<DialogDescription>
							Enter your phone number and we'll call you back shortly
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<label
								htmlFor="callback-phone"
								className="text-sm font-medium mb-2 block"
							>
								Phone Number
							</label>
							<input
								id="callback-phone"
								type="tel"
								placeholder="(555) 123-4567"
								value={callbackPhone}
								onChange={(e) => setCallbackPhone(e.target.value)}
								className="w-full px-3 py-2 border rounded-md text-sm"
							/>
						</div>
						<p className="text-xs text-gray-500">
							We'll call you within 30 minutes during business hours
						</p>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowCallbackModal(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleScheduleCallback}
							disabled={!callbackPhone.trim()}
						>
							Schedule Call
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
