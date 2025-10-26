"""Debug script to inspect transaction structure"""
import os
import json
from dotenv import load_dotenv
from src.xrpl_client import XRPLClient

load_dotenv()

client = XRPLClient(
    seed=os.getenv("XRPL_TESTNET_SEED"),
    network_url=os.getenv("XRPL_NETWORK")
)

# The transaction we submitted
tx_hash = "6D0C04191C39251D7ECF480316188908CFE2C45ACD79CE2B993961BC226E4E78"

print("🔍 Fetching transaction details...")
tx_details = client.get_transaction_details(tx_hash)

print("\n📦 Full Transaction Response:")
print(json.dumps(tx_details, indent=2))

print("\n\n🔎 Looking for Memos...")
if "Memos" in tx_details:
    print("Found Memos in root!")
    print(json.dumps(tx_details["Memos"], indent=2))
elif "meta" in tx_details and "Memos" in tx_details.get("meta", {}):
    print("Found Memos in meta!")
    print(json.dumps(tx_details["meta"]["Memos"], indent=2))
else:
    print("Checking all keys:", list(tx_details.keys()))

print("\n\n📊 Now checking account_tx response format...")
transactions = client.query_account_transactions(limit=5)

if transactions:
    print(f"\nFirst transaction structure:")
    print(json.dumps(transactions[0], indent=2))

client.disconnect()