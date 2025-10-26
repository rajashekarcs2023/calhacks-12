import { type MCPToolResponse, useMCPClient } from "@/hooks/use-mcp-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const MCP_SERVER_URL = "https://xrpledger-mcp.fastmcp.app/mcp";
const MCP_ID = "68fdc0a9bc26c8c446520035";
const TOOL_NAME = "xrpl_mint_document_nft";

/**
 * Input parameters for minting a document NFT on XRPL
 */
export interface XrplMintDocumentNftInput {
	/** Content identifier (IPFS CID, URL, or document reference) */
	cid: string;
	/** Optional metadata such as sha256, title, and caseId */
	meta?: {
		sha256?: string;
		title?: string;
		caseId?: string;
	};
}

/**
 * Output data from minting a document NFT
 */
export interface XrplMintDocumentNftOutput {
	/** The unique NFT token ID */
	nftId: string;
	/** XRPL transaction hash for the NFT mint */
	txHash: string;
	/** URL to view transaction on XRPL testnet explorer */
	explorerUrl: string;
	/** URI data embedded in the NFT */
	uri: {
		cid: string;
		metadata?: Record<string, unknown>;
	};
}

/**
 * React mutation hook for minting document NFTs on the XRPL blockchain.
 *
 * This hook creates a unique, non-fungible token (NFT) representing a document
 * on the XRP Ledger, with embedded content identifier and optional metadata.
 *
 * @example
 * const mintNft = useXrplMintDocumentNft();
 *
 * mintNft.mutate({
 *   cid: "QmX7Zd9fjkL3vN2kQ8pRxM1wYv4nF5hJ2gK9tP6sE8aB",
 *   meta: {
 *     sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
 *     title: "Legal Document 2024",
 *     caseId: "case-456"
 *   }
 * });
 */
export function useXrplMintDocumentNft() {
	const { callTool } = useMCPClient();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: XrplMintDocumentNftInput) => {
			if (!params || !params.cid) {
				throw new Error("cid is required for minting document NFT");
			}

			// CRITICAL: Use MCPToolResponse and parse JSON response
			const mcpResponse = await callTool<
				MCPToolResponse,
				XrplMintDocumentNftInput
			>(MCP_SERVER_URL, MCP_ID, TOOL_NAME, params);

			if (!mcpResponse.content?.[0]?.text) {
				throw new Error("Invalid MCP response format: missing content[0].text");
			}

			try {
				const toolData: XrplMintDocumentNftOutput = JSON.parse(
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
			// Invalidate related queries to refresh NFT data
			queryClient.invalidateQueries({ queryKey: ["xrpl-nft"] });
		},
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
}
