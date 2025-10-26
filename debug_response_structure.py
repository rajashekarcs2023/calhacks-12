"""Screenshot 1: Show transaction response structure with tx_json"""
import os
import json
from dotenv import load_dotenv
from src.xrpl_client import XRPLClient

load_dotenv()

client = XRPLClient(
    seed=os.getenv("XRPL_TESTNET_SEED"),
    network_url=os.getenv("XRPL_NETWORK")
)

# Use the transaction hash from your test
tx_hash = "6D0C04191C39251D7ECF480316188908CFE2C45ACD79CE2B993961BC226E4E78"

print("=" * 70)
print("TRANSACTION RESPONSE STRUCTURE - SHOWING THE ISSUE")
print("=" * 70)
print("\nFetching transaction...")
tx_details = client.get_transaction_details(tx_hash)

print("\n✓ Full Response Keys:", list(tx_details.keys()))
print("\n⚠️  NOTICE: Memos are in 'tx_json', NOT in 'tx' (which doesn't exist)")

print("\n" + "=" * 70)
print("ACTUAL LOCATION OF MEMOS:")
print("=" * 70)
if "tx_json" in tx_details:
    print("✓ tx_json EXISTS")
    if "Memos" in tx_details["tx_json"]:
        print("✓ tx_json['Memos'] EXISTS ← This is where memos actually are!")
        print("\nMemos content:")
        print(json.dumps(tx_details["tx_json"]["Memos"], indent=2))
        
if "tx" in tx_details:
    print("\n✓ tx EXISTS")
else:
    print("\n✗ tx DOES NOT EXIST (common pattern tx.get('tx', tx) fails!)")

print("\n" + "=" * 70)
print("WHAT DEVELOPERS EXPECT vs REALITY:")
print("=" * 70)
print("Expected pattern:  tx.get('tx', tx)")
print("Actual location:   tx.get('tx_json', tx.get('tx', tx))")
print("\n↑ This difference breaks memo parsing!")

client.disconnect()