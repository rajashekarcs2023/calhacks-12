import { useMCPClient } from "@/hooks/use-mcp-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// MCP Response wrapper interface - MANDATORY
export interface MCPToolResponse {
	content: Array<{
		type: "text";
		text: string; // JSON string containing actual tool data
	}>;
}

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
	customer?: Record<string, unknown>;

	/**
	 * Overrides for assistant configuration
	 */
	assistantOverrides?: Record<string, unknown>;

	/**
	 * Scheduled time for the call (ISO 8601 format)
	 */
	scheduledFor?: string;

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

/**
 * React hook for creating a Vapi call using the create_call MCP tool.
 *
 * This mutation hook allows you to initiate a new call through the Vapi service
 * with customizable assistant, phone number, customer details, and scheduling options.
 *
 * @returns TanStack Query mutation object for creating Vapi calls
 */
export function useVapiCreateCall() {
	const { callTool } = useMCPClient();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: CreateCallInputParams) => {
			if (!params) {
				throw new Error("Parameters are required for this MCP tool call");
			}

			// CRITICAL: Use MCPToolResponse and parse JSON response
			const mcpResponse = await callTool<
				MCPToolResponse,
				CreateCallInputParams
			>(
				"https://mcp.vapi.ai/mcp",
				"68fd899c61e4e60b74bce282",
				"create_call",
				params,
			);

			if (!mcpResponse.content?.[0]?.text) {
				throw new Error("Invalid MCP response format: missing content[0].text");
			}

			try {
				const toolData: CreateCallOutputData = JSON.parse(
					mcpResponse.content[0].text,
				);
				return toolData;
			} catch (parseError) {
				// Enhanced error handling: if parsing fails, include the raw text for debugging
				const rawText = mcpResponse.content[0].text;

				// Check if the response contains an error message
				if (rawText.includes("Error:") || rawText.includes("error")) {
					throw new Error(`Vapi API Error: ${rawText.substring(0, 200)}`);
				}

				throw new Error(
					`Failed to parse MCP response JSON: ${parseError instanceof Error ? parseError.message : "Unknown error"}. Raw response: ${rawText.substring(0, 100)}`,
				);
			}
		},
		onSuccess: () => {
			// Invalidate related queries to refresh data
			queryClient.invalidateQueries({ queryKey: ["vapi-list-calls"] });
		},
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
}
