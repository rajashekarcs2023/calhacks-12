import { useMCPClient } from "@/hooks/use-mcp-client";
import { useQuery } from "@tanstack/react-query";

// MCP Response wrapper interface - MANDATORY
export interface MCPToolResponse {
	content: Array<{
		type: "text";
		text: string; // JSON string containing actual tool data
	}>;
}

/**
 * Input parameters for the get_call tool
 */
export interface GetCallInputParams {
	callId: string;
}

/**
 * Output data structure for the get_call tool
 */
export interface GetCallOutputData {
	id: string;
	status: string;
	duration: number;
	[key: string]: unknown; // Additional properties allowed
}

/**
 * React Query hook for fetching call details from Vapi MCP server
 *
 * @param callId - The ID of the call to retrieve
 * @param enabled - Whether the query should run automatically (default: true)
 * @returns TanStack Query result with call data
 */
export function useVapiGetCall(callId?: string, enabled = true) {
	const { callTool } = useMCPClient();

	return useQuery({
		queryKey: ["vapi-get-call", callId],
		queryFn: async () => {
			if (!callId) {
				throw new Error("callId is required for get_call MCP tool call");
			}

			const params: GetCallInputParams = { callId };

			// CRITICAL: Use MCPToolResponse and parse JSON response
			const mcpResponse = await callTool<MCPToolResponse, GetCallInputParams>(
				"https://mcp.vapi.ai/mcp",
				"68fd899c61e4e60b74bce282",
				"get_call",
				params,
			);

			if (!mcpResponse.content?.[0]?.text) {
				throw new Error("Invalid MCP response format: missing content[0].text");
			}

			try {
				const toolData: GetCallOutputData = JSON.parse(
					mcpResponse.content[0].text,
				);
				return toolData;
			} catch (parseError) {
				throw new Error(
					`Failed to parse MCP response JSON: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
				);
			}
		},
		enabled: enabled && !!callId,
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
}
