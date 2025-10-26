"""Quick test script for MCP tools"""
import os
from dotenv import load_dotenv
from src.xrpl_client import XRPLClient
from src.hash_utils import compute_sha256_from_bytes

# Load environment
load_dotenv()

# Test 1: Connection
print("🧪 Test 1: XRPL Connection")
client = XRPLClient(
    seed=os.getenv("XRPL_TESTNET_SEED"),
    network_url=os.getenv("XRPL_NETWORK")
)
client.connect()
print(f"✅ Connected! Wallet: {client.wallet.address}\n")

# Test 2: Hash computation
print("🧪 Test 2: Hash Computation")
test_data = b"This is a test document for hackathon"
hash_result = compute_sha256_from_bytes(test_data)
print(f"✅ Hash: {hash_result}\n")

# Test 3: Timestamp (actual blockchain transaction)
print("🧪 Test 3: Timestamp on Blockchain")
result = client.submit_memo_transaction({
    "hash": hash_result,
    "metadata": {
        "serviceId": "test-service",
        "caseId": "TEST-001"
    },
    "timestamp": "2025-10-25T12:00:00Z"
})
print(f"✅ Transaction: {result['txHash']}")
print(f"🔗 Explorer: {result['explorerUrl']}\n")

client.disconnect()
print("✅ All tests passed!")