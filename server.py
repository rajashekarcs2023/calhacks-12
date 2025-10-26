"""
XRPL Proof & Certificates MCP Server

This MCP server provides tools for creating tamper-proof document proofs
on the XRP Ledger testnet, verifying proofs, and minting NFT certificates.
"""

import os
from datetime import datetime
from typing import Optional
from dotenv import load_dotenv
from fastmcp import FastMCP

from src.xrpl_client import XRPLClient
from src.hash_utils import (
    compute_sha256_from_b64,
    is_valid_sha256,
    detect_input_type,
    encode_memo_data
)
from src.nft_handler import NFTHandler
from src.verification import ProofVerifier

# Load environment variables
load_dotenv()

# Initialize MCP server
mcp = FastMCP("XRPL Proof & Certificates")

# Initialize XRPL client (will be set up on first tool call)
xrpl_client = None
nft_handler = None
proof_verifier = None


def initialize_clients():
    """Initialize XRPL clients if not already initialized."""
    global xrpl_client, nft_handler, proof_verifier
    
    if xrpl_client is None:
        seed = os.getenv("XRPL_TESTNET_SEED")
        network = os.getenv("XRPL_NETWORK", "wss://s.altnet.rippletest.net:51233")
        
        if not seed:
            raise ValueError("XRPL_TESTNET_SEED not found in environment variables")
        
        xrpl_client = XRPLClient(seed=seed, network_url=network)
        nft_handler = NFTHandler(xrpl_client)
        proof_verifier = ProofVerifier(xrpl_client)
        
        print("🚀 XRPL MCP Server initialized")


@mcp.tool()
def xrpl_timestamp(sha256_hex_str: str, meta: Optional[dict] = None) -> dict:
    """
    Create a timestamped proof of a document on the XRP Ledger.
    
    Records a SHA-256 hash on XRPL testnet as an immutable, cryptographically 
    verifiable proof of document submission. No personal data is stored on-chain.
    
    Args:
        sha256_hex_str: SHA-256 hash of the document (64 hex characters)
        meta: Optional metadata dictionary (serviceId, caseId, etc.)
        
    Returns:
        Dictionary with transaction hash, explorer URL, and ledger index
        
    Example:
        >>> xrpl_timestamp(
        ...     "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
        ...     {"serviceId": "passport-renewal", "caseId": "CR-2024-001"}
        ... )
        {
            "txHash": "ABC123...",
            "explorerUrl": "https://testnet.xrpl.org/transactions/ABC123...",
            "ledgerIndex": 12345
        }
    """
    initialize_clients()
    
    # Validate hash format
    if not is_valid_sha256(sha256_hex_str):
        raise ValueError(f"Invalid SHA-256 hash format. Expected 64 hex characters, got: {sha256_hex_str}")
    
    # Build memo payload
    memo_data = {
        "hash": sha256_hex_str.lower(),
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    if meta:
        memo_data["metadata"] = meta
    
    # Submit transaction
    result = xrpl_client.submit_memo_transaction(memo_data)
    
    return result


@mcp.tool()
def verify(hash_or_pdf_b64: str) -> dict:
    """
    Verify if a document proof exists on the XRP Ledger.
    
    Accepts either a SHA-256 hash or a Base64-encoded PDF. If a PDF is provided,
    it computes the hash and then searches for it in recent blockchain transactions.
    
    Args:
        hash_or_pdf_b64: Either a 64-character SHA-256 hash or Base64-encoded PDF
        
    Returns:
        Dictionary with verification results including hash, found status, and details
        
    Example:
        >>> verify("a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a")
        {
            "sha256": "a7ffc6f8...",
            "found": true,
            "txHash": "ABC123...",
            "explorerUrl": "https://testnet.xrpl.org/transactions/ABC123...",
            "timestamp": "2025-10-25T10:30:00Z",
            "metadata": {"serviceId": "passport-renewal"}
        }
    """
    initialize_clients()
    
    # Detect input type
    input_type = detect_input_type(hash_or_pdf_b64)
    
    if input_type == "hash":
        # Already a hash
        sha256_hash = hash_or_pdf_b64.lower()
        print(f"📄 Input detected as SHA-256 hash")
    else:
        # Base64 PDF - compute hash
        print(f"📄 Input detected as Base64 data, computing hash...")
        sha256_hash = compute_sha256_from_b64(hash_or_pdf_b64)
        print(f"   Computed hash: {sha256_hash}")
    
    # Validate hash
    if not is_valid_sha256(sha256_hash):
        raise ValueError(f"Invalid or corrupted hash: {sha256_hash}")
    
    # Verify proof
    result = proof_verifier.verify_proof(sha256_hash)
    
    return result


@mcp.tool()
def xrpl_mint_document_nft(cid: str, meta: Optional[dict] = None) -> dict:
    """
    Mint an NFT certificate for a government document on the XRP Ledger.
    
    Creates a permanent blockchain certificate represented as an NFT with 
    embedded metadata referencing the document's CID and hash.
    
    Args:
        cid: Content identifier (IPFS CID, URL, or document reference)
        meta: Optional metadata (sha256, title, caseId, etc.)
        
    Returns:
        Dictionary with NFT ID, transaction hash, and explorer URL
        
    Example:
        >>> xrpl_mint_document_nft(
        ...     "QmX7ffc6f8bf1ed76651c14756a061d662",
        ...     {
        ...         "sha256": "a7ffc6f8...",
        ...         "title": "Passport Certificate",
        ...         "caseId": "CR-2024-001"
        ...     }
        ... )
        {
            "nftId": "000...",
            "txHash": "DEF456...",
            "explorerUrl": "https://testnet.xrpl.org/transactions/DEF456..."
        }
    """
    initialize_clients()
    
    # Prepare metadata
    metadata = meta or {}
    
    # Mint NFT
    result = nft_handler.mint_document_nft(cid=cid, metadata=metadata)
    
    return result


@mcp.tool()
def pay_fee(amount_minor: int, destination: str, memo: Optional[str] = None) -> dict:
    """
    Process a payment on the XRP Ledger testnet (simulates government service fees).
    
    Args:
        amount_minor: Amount in drops (1 XRP = 1,000,000 drops)
        destination: Destination XRPL address
        memo: Optional memo text for the payment
        
    Returns:
        Dictionary with transaction hash and explorer URL
        
    Example:
        >>> pay_fee(
        ...     1000000,  # 1 XRP
        ...     "rN7n7otQDd6FczFgLdlqtyMVrn3S9gcWjQ",
        ...     "Passport renewal fee"
        ... )
        {
            "txHash": "GHI789...",
            "explorerUrl": "https://testnet.xrpl.org/transactions/GHI789...",
            "amount": 1000000,
            "destination": "rN7n7otQDd6FczFgLdlqtyMVrn3S9gcWjQ"
        }
    """
    initialize_clients()
    
    # Validate amount
    if amount_minor <= 0:
        raise ValueError(f"Amount must be positive, got: {amount_minor}")
    
    # Submit payment
    result = xrpl_client.submit_payment(
        destination=destination,
        amount_drops=amount_minor,
        memo=memo
    )
    
    return result


# Server entry point
if __name__ == "__main__":
    print("=" * 60)
    print("🌟 XRPL Proof & Certificates MCP Server")
    print("=" * 60)
    print("\n📚 Available Tools:")
    print("  1. xrpl_timestamp    - Record document hash on blockchain")
    print("  2. verify            - Verify document proof exists")
    print("  3. xrpl_mint_document_nft - Mint NFT certificate")
    print("  4. pay_fee           - Process payment (testnet)")
    print("\n🚀 Starting server...\n")
    
    mcp.run()