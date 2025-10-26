import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Input parameters for creating a Vapi call
 */
export interface CreateCallInputParams {
	/**
	 * The ID of the assistant to use for the call
	 */
	assistantId?: string;

	/**
	 * The ID of the phone number to use for the call
	 */
	phoneNumberId?: string;

	/**
	 * Customer information for the call
	 */
	customer?: {
		number: string;
		[key: string]: unknown;
	};

	/**
	 * Overrides for assistant configuration
	 */
	assistantOverrides?: Record<string, unknown>;

	/**
	 * Scheduled time for the call (ISO 8601 format)
	 */
	scheduledAt?: string;

	/**
	 * Additional properties allowed by the schema
	 */
	[key: string]: unknown;
}

/**
 * Output data returned from creating a Vapi call
 */
export interface CreateCallOutputData {
	/**
	 * The unique identifier of the created call
	 */
	id: string;

	/**
	 * The current status of the call
	 */
	status: string;

	/**
	 * Additional properties allowed by the schema
	 */
	[key: string]: unknown;
}

const VAPI_API_KEY = "c9357f08-9add-46dc-a32a-f91aa5f5c0fd";
const VAPI_API_BASE_URL = "https://api.vapi.ai";

/**
 * React hook for creating a Vapi call by directly calling the Vapi REST API.
 *
 * This mutation hook allows you to initiate a new call through the Vapi service
 * with customizable assistant, phone number, customer details, and scheduling options.
 *
 * @returns TanStack Query mutation object for creating Vapi calls
 */
export function useVapiDirectCall() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: CreateCallInputParams) => {
			if (!params) {
				throw new Error("Parameters are required for creating a Vapi call");
			}

			const response = await fetch(`${VAPI_API_BASE_URL}/call`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${VAPI_API_KEY}`,
				},
				body: JSON.stringify(params),
			});

			if (!response.ok) {
				const errorText = await response.text();
				let errorMessage = `Vapi API Error (${response.status}): `;

				try {
					const errorData = JSON.parse(errorText);
					errorMessage += errorData.message || errorData.error || errorText;
				} catch {
					errorMessage += errorText;
				}

				throw new Error(errorMessage);
			}

			const data: CreateCallOutputData = await response.json();
			return data;
		},
		onSuccess: () => {
			// Invalidate related queries to refresh data
			queryClient.invalidateQueries({ queryKey: ["vapi-calls"] });
		},
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
}

/**
 * React hook for getting Vapi call status by directly calling the Vapi REST API.
 *
 * @returns TanStack Query mutation object for getting call status
 */
export function useVapiGetCall() {
	return useMutation({
		mutationFn: async (callId: string) => {
			if (!callId) {
				throw new Error("Call ID is required");
			}

			const response = await fetch(`${VAPI_API_BASE_URL}/call/${callId}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${VAPI_API_KEY}`,
				},
			});

			if (!response.ok) {
				const errorText = await response.text();
				let errorMessage = `Vapi API Error (${response.status}): `;

				try {
					const errorData = JSON.parse(errorText);
					errorMessage += errorData.message || errorData.error || errorText;
				} catch {
					errorMessage += errorText;
				}

				throw new Error(errorMessage);
			}

			const data = await response.json();
			return data;
		},
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
}
