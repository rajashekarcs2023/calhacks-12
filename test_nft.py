"""Test NFT minting"""
import os
from dotenv import load_dotenv
from src.xrpl_client import XRPLClient
from src.nft_handler import NFTHandler

load_dotenv()

client = XRPLClient(
    seed=os.getenv("XRPL_TESTNET_SEED"),
    network_url=os.getenv("XRPL_NETWORK")
)
nft_handler = NFTHandler(client)

print("🎨 Testing NFT Minting...")

result = nft_handler.mint_document_nft(
    cid="QmTestCID123456789",
    metadata={
        "sha256": "143862b7a0c09bf5582d33c4380660918684c78e2e2c02c14c54629f97f0b652",
        "title": "Test Government Certificate",
        "caseId": "TEST-001"
    }
)

print("\n🎉 NFT Minted!")
print(f"   NFT ID: {result.get('nftId', 'N/A')}")
print(f"   TX Hash: {result['txHash']}")
print(f"   Explorer: {result['explorerUrl']}")

client.disconnect()