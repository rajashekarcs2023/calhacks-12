#!/usr/bin/env node

/**
 * Custom MCP Server Template for Civic AI
 *
 * This is a template for creating your own MCP (Model Context Protocol) server
 * that can be integrated with your Civic AI application.
 *
 * Usage:
 * 1. Copy this file to your project
 * 2. Customize the tools below
 * 3. Add to .claude.user/settings.json:
 *    {
 *      "mcpServers": {
 *        "my-custom-server": {
 *          "command": "node",
 *          "args": ["/path/to/this/file.js"]
 *        }
 *      }
 *    }
 * 4. Run: node mcp-server-template.js
 */

import { createServer } from 'http';

// Configuration
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.API_KEY || 'default-api-key';

/**
 * Define your custom tools here
 */
const TOOLS = [
  {
    name: 'civic_create_ticket',
    description: 'Create a new civic ticket (parking, legal, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['parking', 'legal', 'public-works', 'social-services'],
          description: 'Ticket category'
        },
        description: {
          type: 'string',
          description: 'Ticket description'
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Ticket priority'
        }
      },
      required: ['category', 'description']
    }
  },
  {
    name: 'civic_get_user_tickets',
    description: 'Get all tickets for a user',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'User ID'
        },
        status: {
          type: 'string',
          enum: ['pending', 'in-progress', 'resolved'],
          description: 'Filter by status'
        }
      },
      required: ['userId']
    }
  },
  {
    name: 'civic_send_notification',
    description: 'Send notification to user',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'User ID'
        },
        message: {
          type: 'string',
          description: 'Notification message'
        },
        type: {
          type: 'string',
          enum: ['email', 'sms', 'push'],
          description: 'Notification type'
        }
      },
      required: ['userId', 'message', 'type']
    }
  }
];

/**
 * Tool implementations
 */
async function executeTool(toolName, args) {
  switch (toolName) {
    case 'civic_create_ticket':
      return createTicket(args);

    case 'civic_get_user_tickets':
      return getUserTickets(args);

    case 'civic_send_notification':
      return sendNotification(args);

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

/**
 * Example tool implementation: Create ticket
 */
async function createTicket({ category, description, priority = 'medium' }) {
  // TODO: Replace with actual database logic
  const ticketId = `TICKET-${Date.now()}`;

  console.log(`[MCP] Creating ticket: ${category} - ${description}`);

  // Simulate database save
  const ticket = {
    id: ticketId,
    category,
    description,
    priority,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  return {
    success: true,
    ticket,
    message: `Ticket ${ticketId} created successfully`
  };
}

/**
 * Example tool implementation: Get user tickets
 */
async function getUserTickets({ userId, status }) {
  // TODO: Replace with actual database query
  console.log(`[MCP] Getting tickets for user: ${userId}, status: ${status || 'all'}`);

  // Simulate database query
  const tickets = [
    {
      id: 'TICKET-001',
      category: 'parking',
      description: 'Parking ticket appeal',
      priority: 'high',
      status: 'pending',
      createdAt: new Date().toISOString()
    },
    {
      id: 'TICKET-002',
      category: 'public-works',
      description: 'Pothole on Main Street',
      priority: 'medium',
      status: 'in-progress',
      createdAt: new Date().toISOString()
    }
  ];

  const filtered = status
    ? tickets.filter(t => t.status === status)
    : tickets;

  return {
    success: true,
    tickets: filtered,
    count: filtered.length
  };
}

/**
 * Example tool implementation: Send notification
 */
async function sendNotification({ userId, message, type }) {
  // TODO: Replace with actual notification service
  console.log(`[MCP] Sending ${type} notification to user ${userId}: ${message}`);

  // Simulate notification send
  return {
    success: true,
    notificationId: `NOTIF-${Date.now()}`,
    type,
    sentAt: new Date().toISOString()
  };
}

/**
 * Handle MCP JSON-RPC requests
 */
async function handleMCPRequest(request) {
  const { method, params, id } = request;

  try {
    if (method === 'tools/list') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools: TOOLS
        }
      };
    }

    if (method === 'tools/call') {
      const { name: toolName, arguments: args } = params;

      const result = await executeTool(toolName, args);

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result)
            }
          ]
        }
      };
    }

    throw new Error(`Unknown method: ${method}`);
  } catch (error) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32603,
        message: error.message,
        data: {
          stack: error.stack
        }
      }
    };
  }
}

/**
 * HTTP Server
 */
const server = createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // Parse request body
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { transportType, serverUrl, request } = JSON.parse(body);

      console.log(`[MCP] Received ${request.method} request`);

      // Handle MCP request
      const response = await handleMCPRequest(request);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    } catch (error) {
      console.error('[MCP] Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }));
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║  Custom MCP Server for Civic AI                        ║
╚════════════════════════════════════════════════════════╝

✅ Server running on http://localhost:${PORT}
🔧 API Key: ${API_KEY}

Available tools:
${TOOLS.map(t => `  • ${t.name} - ${t.description}`).join('\n')}

Test with curl:
  curl -X POST http://localhost:${PORT}/execute-mcp/v2 \\
    -H "Content-Type: application/json" \\
    -d '{
      "transportType": "streamable_http",
      "serverUrl": "http://localhost:${PORT}",
      "request": {
        "jsonrpc": "2.0",
        "id": "test-1",
        "method": "tools/list"
      }
    }'

Press Ctrl+C to stop
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down MCP server...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});
