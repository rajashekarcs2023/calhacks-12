"""Test the verify function"""
import os
from dotenv import load_dotenv
from src.xrpl_client import XRPLClient
from src.verification import ProofVerifier

# Load environment
load_dotenv()

# Initialize
client = XRPLClient(
    seed=os.getenv("XRPL_TESTNET_SEED"),
    network_url=os.getenv("XRPL_NETWORK")
)
verifier = ProofVerifier(client)

# This is the hash we submitted in the previous test
test_hash = "143862b7a0c09bf5582d33c4380660918684c78e2e2c02c14c54629f97f0b652"

print("🔍 Testing Verification...")
result = verifier.verify_proof(test_hash)

print("\n📊 Verification Result:")
print(f"   Hash: {result['sha256']}")
print(f"   Found: {result['found']}")
if result['found']:
    print(f"   TX Hash: {result['txHash']}")
    print(f"   Explorer: {result['explorerUrl']}")
    print(f"   Timestamp: {result['timestamp']}")
    print("✅ Verification successful!")
else:
    print("❌ Hash not found (this shouldn't happen)")

client.disconnect()