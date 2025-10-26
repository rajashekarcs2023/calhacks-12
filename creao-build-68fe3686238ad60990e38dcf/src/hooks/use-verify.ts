import { type MCPToolResponse, useMCPClient } from "@/hooks/use-mcp-client";
import { useQuery } from "@tanstack/react-query";

const MCP_SERVER_URL = "https://xrpledger-mcp.fastmcp.app/mcp";
const MCP_ID = "68fdc0a9bc26c8c446520035";
const TOOL_NAME = "verify";

/**
 * Input parameters for verifying a document proof on blockchain
 */
export interface VerifyInput {
	/** Either a 64-character SHA-256 hash or Base64-encoded PDF */
	hash_or_pdf_b64: string;
}

/**
 * Output data from verifying a document proof
 */
export interface VerifyOutput {
	/** The SHA-256 hash that was searched for */
	sha256: string;
	/** Whether the proof was found on the blockchain */
	found: boolean;
	/** Transaction hash where proof was found (if found) */
	txHash?: string;
	/** URL to view the transaction (if found) */
	explorerUrl?: string;
	/** ISO 8601 timestamp when proof was created (if found) */
	timestamp?: string;
	/** Metadata stored with the proof (if found) */
	metadata?: Record<string, unknown>;
	/** Ledger index of the transaction (if found) */
	ledgerIndex?: number;
	/** Message explaining why proof was not found (if not found) */
	message?: string;
}

/**
 * React query hook for verifying if a document proof exists on the XRPL blockchain.
 *
 * This hook checks whether a document hash (or PDF) has been previously timestamped
 * on the XRP Ledger and returns the associated transaction details if found.
 *
 * @param params - Verification parameters containing hash or Base64-encoded PDF
 * @param enabled - Whether the query should execute (default: true)
 *
 * @example
 * const { data, isLoading } = useVerify({
 *   hash_or_pdf_b64: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
 * });
 *
 * if (data?.found) {
 *   console.log("Proof found at:", data.explorerUrl);
 * }
 */
export function useVerify(params?: VerifyInput, enabled = true) {
	const { callTool } = useMCPClient();

	return useQuery({
		queryKey: ["xrpl-verify", params],
		queryFn: async () => {
			if (!params || !params.hash_or_pdf_b64) {
				throw new Error("hash_or_pdf_b64 is required for verification");
			}

			// CRITICAL: Use MCPToolResponse and parse JSON response
			const mcpResponse = await callTool<MCPToolResponse, VerifyInput>(
				MCP_SERVER_URL,
				MCP_ID,
				TOOL_NAME,
				params,
			);

			if (!mcpResponse.content?.[0]?.text) {
				throw new Error("Invalid MCP response format: missing content[0].text");
			}

			try {
				const toolData: VerifyOutput = JSON.parse(mcpResponse.content[0].text);
				return toolData;
			} catch (parseError) {
				throw new Error(
					`Failed to parse MCP response JSON: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
				);
			}
		},
		enabled: enabled && !!params?.hash_or_pdf_b64,
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
}
