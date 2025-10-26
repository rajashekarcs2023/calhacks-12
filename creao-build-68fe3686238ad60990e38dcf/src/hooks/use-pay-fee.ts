import { type MCPToolResponse, useMCPClient } from "@/hooks/use-mcp-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const MCP_SERVER_URL = "https://xrpledger-mcp.fastmcp.app/mcp";
const MCP_ID = "68fdc0a9bc26c8c446520035";
const TOOL_NAME = "pay_fee";

/**
 * Input parameters for making a payment on XRPL
 */
export interface PayFeeInput {
	/** Amount in drops (1 XRP = 1,000,000 drops) */
	amount_minor: number;
	/** Destination XRPL address (must be different from sender) */
	destination: string;
	/** Optional memo text for the payment */
	memo?: string;
}

/**
 * Output data from making a payment on XRPL
 */
export interface PayFeeOutput {
	/** XRPL transaction hash */
	txHash: string;
	/** URL to view transaction on XRPL testnet explorer */
	explorerUrl: string;
	/** Amount sent in drops */
	amount: number;
	/** Destination XRPL address that received the payment */
	destination: string;
}

/**
 * React mutation hook for making payments on the XRPL blockchain.
 *
 * This hook executes XRP payments to specified addresses with optional memo text,
 * supporting micropayments using drops (1 XRP = 1,000,000 drops).
 *
 * @example
 * const payment = usePayFee();
 *
 * payment.mutate({
 *   amount_minor: 1000000, // 1 XRP
 *   destination: "rN7n7otQDd6FczFgLdlqtyMVrn3yT9XRPX",
 *   memo: "Payment for services rendered"
 * });
 */
export function usePayFee() {
	const { callTool } = useMCPClient();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: PayFeeInput) => {
			if (!params || !params.amount_minor || !params.destination) {
				throw new Error(
					"amount_minor and destination are required for payment",
				);
			}

			// Validate amount is positive
			if (params.amount_minor <= 0) {
				throw new Error("amount_minor must be a positive number");
			}

			// Validate destination address format (basic XRPL address validation)
			if (!/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(params.destination)) {
				throw new Error(
					'destination must be a valid XRPL address starting with "r"',
				);
			}

			// CRITICAL: Use MCPToolResponse and parse JSON response
			const mcpResponse = await callTool<MCPToolResponse, PayFeeInput>(
				MCP_SERVER_URL,
				MCP_ID,
				TOOL_NAME,
				params,
			);

			if (!mcpResponse.content?.[0]?.text) {
				throw new Error("Invalid MCP response format: missing content[0].text");
			}

			try {
				const toolData: PayFeeOutput = JSON.parse(mcpResponse.content[0].text);
				return toolData;
			} catch (parseError) {
				throw new Error(
					`Failed to parse MCP response JSON: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
				);
			}
		},
		onSuccess: () => {
			// Invalidate related queries to refresh payment history
			queryClient.invalidateQueries({ queryKey: ["xrpl-payments"] });
		},
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
}
