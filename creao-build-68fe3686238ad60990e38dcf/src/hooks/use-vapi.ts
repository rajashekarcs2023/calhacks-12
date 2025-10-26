import { useCallback, useState } from "react";

/**
 * Vapi API configuration
 * Get your API key from: https://dashboard.vapi.ai
 */
const VAPI_API_KEY = import.meta.env.VITE_VAPI_API_KEY || "";
const VAPI_BASE_URL = "https://api.vapi.ai";

export interface VapiCallRequest {
	assistantId?: string;
	assistant?: {
		name: string;
		model: {
			provider: string;
			model: string;
			messages: Array<{ role: string; content: string }>;
		};
		voice: {
			provider: string;
			voiceId: string;
		};
		firstMessage?: string;
	};
	phoneNumberId?: string;
	customer: {
		number: string;
		name?: string;
	};
	assistantOverrides?: {
		firstMessage?: string;
		variableValues?: Record<string, string>;
	};
}

export interface VapiCall {
	id: string;
	orgId: string;
	createdAt: string;
	updatedAt: string;
	type: "webCall" | "phoneCall";
	status:
		| "queued"
		| "ringing"
		| "in-progress"
		| "forwarding"
		| "ended"
		| "busy"
		| "no-answer"
		| "failed"
		| "canceled";
	phoneCallProvider?: string;
	phoneCallTransport?: string;
	phoneNumber?: string;
	customer?: {
		number: string;
		name?: string;
	};
	startedAt?: string;
	endedAt?: string;
	cost?: number;
	costBreakdown?: {
		transport?: number;
		stt?: number;
		llm?: number;
		tts?: number;
		vapi?: number;
		total?: number;
	};
	messages?: Array<{
		role: string;
		message: string;
		time: number;
		endTime?: number;
		secondsFromStart: number;
	}>;
	transcript?: string;
	recordingUrl?: string;
	summary?: string;
	analysis?: unknown;
}

export interface VapiError {
	error: {
		message: string;
		statusCode?: number;
		details?: unknown;
	};
}

/**
 * Custom hook for Vapi phone call integration
 * Direct API integration without MCP layer
 */
export function useVapi() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const createCall = useCallback(
		async (request: VapiCallRequest): Promise<VapiCall> => {
			if (!VAPI_API_KEY) {
				throw new Error(
					"VAPI_API_KEY not configured. Please add VITE_VAPI_API_KEY to your .env.local file and restart the dev server",
				);
			}

			console.log("[Vapi] Creating call with request:", {
				customer: request.customer,
				assistantId: request.assistantId,
				hasAssistant: !!request.assistant,
			});

			setIsLoading(true);
			setError(null);

			try {
				const requestBody = JSON.stringify(request);
				console.log("[Vapi] Request body:", requestBody);

				const response = await fetch(`${VAPI_BASE_URL}/call/phone`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${VAPI_API_KEY}`,
					},
					body: requestBody,
				});

				console.log("[Vapi] Response status:", response.status);

				if (!response.ok) {
					let errorData: VapiError;
					try {
						errorData = await response.json();
						console.error("[Vapi] Error response:", errorData);
					} catch (parseError) {
						const textError = await response.text();
						console.error("[Vapi] Raw error response:", textError);
						throw new Error(
							`HTTP error! status: ${response.status}. Response: ${textError}`,
						);
					}
					throw new Error(
						errorData.error?.message ||
							`HTTP error! status: ${response.status}`,
					);
				}

				const call: VapiCall = await response.json();
				setIsLoading(false);
				return call;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error occurred";
				setError(errorMessage);
				setIsLoading(false);
				throw new Error(errorMessage);
			}
		},
		[],
	);

	const getCall = useCallback(async (callId: string): Promise<VapiCall> => {
		if (!VAPI_API_KEY) {
			throw new Error(
				"VAPI_API_KEY not configured. Please add VITE_VAPI_API_KEY to your .env file",
			);
		}

		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`${VAPI_BASE_URL}/call/${callId}`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${VAPI_API_KEY}`,
				},
			});

			if (!response.ok) {
				const errorData: VapiError = await response.json();
				throw new Error(
					errorData.error?.message || `HTTP error! status: ${response.status}`,
				);
			}

			const call: VapiCall = await response.json();
			setIsLoading(false);
			return call;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error occurred";
			setError(errorMessage);
			setIsLoading(false);
			throw new Error(errorMessage);
		}
	}, []);

	const listCalls = useCallback(
		async (options?: {
			limit?: number;
			createdAtGt?: string;
			createdAtLt?: string;
			createdAtGte?: string;
			createdAtLte?: string;
		}): Promise<VapiCall[]> => {
			if (!VAPI_API_KEY) {
				throw new Error(
					"VAPI_API_KEY not configured. Please add VITE_VAPI_API_KEY to your .env file",
				);
			}

			setIsLoading(true);
			setError(null);

			try {
				const params = new URLSearchParams();
				if (options?.limit) params.append("limit", options.limit.toString());
				if (options?.createdAtGt)
					params.append("createdAtGt", options.createdAtGt);
				if (options?.createdAtLt)
					params.append("createdAtLt", options.createdAtLt);
				if (options?.createdAtGte)
					params.append("createdAtGte", options.createdAtGte);
				if (options?.createdAtLte)
					params.append("createdAtLte", options.createdAtLte);

				const url = `${VAPI_BASE_URL}/call${params.toString() ? `?${params.toString()}` : ""}`;

				const response = await fetch(url, {
					method: "GET",
					headers: {
						Authorization: `Bearer ${VAPI_API_KEY}`,
					},
				});

				if (!response.ok) {
					const errorData: VapiError = await response.json();
					throw new Error(
						errorData.error?.message ||
							`HTTP error! status: ${response.status}`,
					);
				}

				const calls: VapiCall[] = await response.json();
				setIsLoading(false);
				return calls;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error occurred";
				setError(errorMessage);
				setIsLoading(false);
				throw new Error(errorMessage);
			}
		},
		[],
	);

	return {
		createCall,
		getCall,
		listCalls,
		isLoading,
		error,
	};
}
