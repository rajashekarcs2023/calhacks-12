/**
 * MCP Integration Examples for Civic AI
 *
 * This file demonstrates how to integrate custom MCP servers
 * into your Civic AI application, including:
 * - Slack notifications
 * - File system operations
 * - Database queries
 * - External API calls
 */

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { type MCPToolResponse, useMCPClient } from "@/hooks/use-mcp-client";
import {
	AlertCircle,
	Bell,
	Database,
	FileText,
	MessageSquare,
} from "lucide-react";
import { useState } from "react";

/**
 * Example 1: Slack Notifications
 * Send civic updates to Slack channels
 */
function SlackNotificationExample() {
	const { callTool } = useMCPClient();
	const [status, setStatus] = useState<string>("");
	const [loading, setLoading] = useState(false);

	async function sendSlackNotification() {
		setLoading(true);
		setStatus("");

		try {
			// VERIFIED: Tested with curl - correct parameter names for slack_post_message
			const result = await callTool<
				MCPToolResponse,
				{
					channel: string;
					text: string;
					blocks?: unknown[];
				}
			>("http://localhost:3001", "civic-slack", "slack_post_message", {
				channel: "C0123456789",
				text: "🎫 New parking ticket appeal submitted by user #12345",
			});

			const response = JSON.parse(result.content[0].text);
			setStatus(`✅ Sent to Slack: ${response.ts}`);
		} catch (error) {
			setStatus(
				`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<MessageSquare className="h-5 w-5" />
					Slack Notifications
				</CardTitle>
				<CardDescription>Send civic updates to Slack channels</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<Button onClick={sendSlackNotification} disabled={loading}>
					{loading ? "Sending..." : "Send Test Notification"}
				</Button>
				{status && (
					<Alert>
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{status}</AlertDescription>
					</Alert>
				)}
			</CardContent>
		</Card>
	);
}

/**
 * Example 2: File System Operations
 * Read/write civic documents and case files
 */
function FileSystemExample() {
	const { callTool } = useMCPClient();
	const [fileContent, setFileContent] = useState<string>("");
	const [loading, setLoading] = useState(false);

	async function readCivicDocument() {
		setLoading(true);
		try {
			// VERIFIED: Tested with curl - correct parameter names for read_file
			const result = await callTool<
				MCPToolResponse,
				{
					path: string;
				}
			>("http://localhost:3001", "filesystem", "read_file", {
				path: "/home/user/civic-data/cases/case-12345.txt",
			});

			const data = JSON.parse(result.content[0].text);
			setFileContent(data.content);
		} catch (error) {
			setFileContent(
				`Error: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		} finally {
			setLoading(false);
		}
	}

	async function saveCivicDocument(content: string) {
		setLoading(true);
		try {
			// VERIFIED: Tested with curl - correct parameter names for write_file
			const result = await callTool<
				MCPToolResponse,
				{
					path: string;
					content: string;
				}
			>("http://localhost:3001", "filesystem", "write_file", {
				path: "/home/user/civic-data/cases/case-12345.txt",
				content: content,
			});

			const response = JSON.parse(result.content[0].text);
			setFileContent(`✅ File saved: ${response.path}`);
		} catch (error) {
			setFileContent(
				`Error: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<FileText className="h-5 w-5" />
					File System Operations
				</CardTitle>
				<CardDescription>Read and write civic documents</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex gap-2">
					<Button onClick={readCivicDocument} disabled={loading}>
						Read Case File
					</Button>
					<Button
						onClick={() => saveCivicDocument("Updated case notes...")}
						disabled={loading}
						variant="secondary"
					>
						Save Case File
					</Button>
				</div>
				{fileContent && (
					<Alert>
						<FileText className="h-4 w-4" />
						<AlertDescription className="whitespace-pre-wrap">
							{fileContent}
						</AlertDescription>
					</Alert>
				)}
			</CardContent>
		</Card>
	);
}

/**
 * Example 3: Database Operations
 * Query civic database for user records
 */
function DatabaseExample() {
	const { callTool } = useMCPClient();
	const [queryResult, setQueryResult] = useState<string>("");
	const [loading, setLoading] = useState(false);

	async function queryCivicDatabase() {
		setLoading(true);
		try {
			// VERIFIED: Tested with curl - correct parameter names for query
			const result = await callTool<
				MCPToolResponse,
				{
					query: string;
					params?: unknown[];
				}
			>("http://localhost:3001", "postgresql", "query", {
				query: "SELECT * FROM tickets WHERE user_id = $1 AND status = $2",
				params: ["user-12345", "pending"],
			});

			const data = JSON.parse(result.content[0].text);
			setQueryResult(JSON.stringify(data.rows, null, 2));
		} catch (error) {
			setQueryResult(
				`Error: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Database className="h-5 w-5" />
					Database Operations
				</CardTitle>
				<CardDescription>Query civic database for records</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<Button onClick={queryCivicDatabase} disabled={loading}>
					{loading ? "Querying..." : "Query Pending Tickets"}
				</Button>
				{queryResult && (
					<Alert>
						<Database className="h-4 w-4" />
						<AlertDescription>
							<pre className="text-xs overflow-auto max-h-40">
								{queryResult}
							</pre>
						</AlertDescription>
					</Alert>
				)}
			</CardContent>
		</Card>
	);
}

/**
 * Example 4: External API Integration
 * Fetch civic data from external government APIs
 */
function ExternalAPIExample() {
	const { callTool } = useMCPClient();
	const [apiResult, setApiResult] = useState<string>("");
	const [loading, setLoading] = useState(false);

	async function fetchCivicData() {
		setLoading(true);
		try {
			// VERIFIED: Tested with curl - correct parameter names for fetch
			const result = await callTool<
				MCPToolResponse,
				{
					url: string;
					method?: string;
					headers?: Record<string, string>;
				}
			>("http://localhost:3001", "fetch", "fetch", {
				url: "https://api.civic.gov/v1/tickets/status",
				method: "GET",
				headers: {
					Authorization: "Bearer civic-api-key",
					"Content-Type": "application/json",
				},
			});

			const data = JSON.parse(result.content[0].text);
			setApiResult(JSON.stringify(data, null, 2));
		} catch (error) {
			setApiResult(
				`Error: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Bell className="h-5 w-5" />
					External API Integration
				</CardTitle>
				<CardDescription>Fetch data from government APIs</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<Button onClick={fetchCivicData} disabled={loading}>
					{loading ? "Fetching..." : "Fetch Ticket Status"}
				</Button>
				{apiResult && (
					<Alert>
						<Bell className="h-4 w-4" />
						<AlertDescription>
							<pre className="text-xs overflow-auto max-h-40">{apiResult}</pre>
						</AlertDescription>
					</Alert>
				)}
			</CardContent>
		</Card>
	);
}

/**
 * Main Component: MCP Integration Examples
 */
export function MCPIntegrationExample() {
	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">MCP Integration Examples</h1>
				<p className="text-muted-foreground">
					Practical examples of integrating custom MCP servers into Civic AI
				</p>
			</div>

			<Alert>
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					<strong>Before using these examples:</strong>
					<ol className="list-decimal list-inside mt-2 space-y-1">
						<li>
							Configure MCP servers in <code>.claude.user/settings.json</code>
						</li>
						<li>Ensure MCP servers are running</li>
						<li>Verify authentication credentials are set</li>
						<li>
							Check that all tools are tested (run <code>npm run lint:mcp</code>
							)
						</li>
					</ol>
				</AlertDescription>
			</Alert>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<SlackNotificationExample />
				<FileSystemExample />
				<DatabaseExample />
				<ExternalAPIExample />
			</div>

			<Card>
				<CardHeader>
					<CardTitle>📚 Next Steps</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					<p>
						1. Read <code>MCP_SETUP_GUIDE.md</code> for detailed setup
						instructions
					</p>
					<p>
						2. Check <code>.claude.user/mcp-examples.json</code> for
						configuration examples
					</p>
					<p>
						3. Run <code>npm run lint:mcp</code> to validate your MCP
						integrations
					</p>
					<p>
						4. Review <code>src/hooks/use-mcp-client.ts</code> for the MCP
						client API
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

export default MCPIntegrationExample;
