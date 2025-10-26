import { type MCPToolResponse, useMCPClient } from "@/hooks/use-mcp-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const MCP_SERVER_URL = "https://xrpledger-mcp.fastmcp.app/mcp";
const MCP_ID = "68fdc0a9bc26c8c446520035";
const TOOL_NAME = "xrpl_timestamp";

/**
 * Input parameters for timestamping a document hash on the XRPL blockchain
 */
export interface XrplTimestampInput {
	/** SHA-256 hash of the document (64 hexadecimal characters) */
	sha256_hex_str: string;
	/** Optional metadata such as serviceId and caseId */
	meta?: {
		serviceId?: string;
		caseId?: string;
	};
}

/**
 * Output data from timestamping a document on XRPL
 */
export interface XrplTimestampOutput {
	/** XRPL transaction hash */
	txHash: string;
	/** URL to view transaction on XRPL testnet explorer */
	explorerUrl: string;
	/** Ledger index where transaction was validated */
	ledgerIndex: number;
	/** Whether the transaction has been validated */
	validated: boolean;
}

/**
 * React mutation hook for timestamping document hashes on the XRPL blockchain.
 *
 * This hook allows you to create immutable proof-of-existence records on the XRP Ledger
 * by timestamping SHA-256 document hashes with optional metadata.
 *
 * @example
 * const timestamp = useXrplTimestamp();
 *
 * timestamp.mutate({
 *   sha256_hex_str: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
 *   meta: { serviceId: "doc-service", caseId: "case-123" }
 * });
 */
export function useXrplTimestamp() {
	const { callTool } = useMCPClient();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: XrplTimestampInput) => {
			if (!params || !params.sha256_hex_str) {
				throw new Error("sha256_hex_str is required for timestamping");
			}

			// Validate SHA-256 hash format (64 hexadecimal characters)
			if (!/^[a-fA-F0-9]{64}$/.test(params.sha256_hex_str)) {
				throw new Error(
					"sha256_hex_str must be a valid 64-character hexadecimal SHA-256 hash",
				);
			}

			// CRITICAL: Use MCPToolResponse and parse JSON response
			const mcpResponse = await callTool<MCPToolResponse, XrplTimestampInput>(
				MCP_SERVER_URL,
				MCP_ID,
				TOOL_NAME,
				params,
			);

			if (!mcpResponse.content?.[0]?.text) {
				throw new Error("Invalid MCP response format: missing content[0].text");
			}

			try {
				const toolData: XrplTimestampOutput = JSON.parse(
					mcpResponse.content[0].text,
				);
				return toolData;
			} catch (parseError) {
				throw new Error(
					`Failed to parse MCP response JSON: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
				);
			}
		},
		onSuccess: () => {
			// Invalidate related queries to refresh verification data
			queryClient.invalidateQueries({ queryKey: ["xrpl-verify"] });
		},
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
}
