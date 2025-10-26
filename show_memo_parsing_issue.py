"""Screenshot 2: Show code that fails vs code that works"""

print("=" * 70)
print("CODE COMPARISON: BROKEN vs WORKING MEMO PARSING")
print("=" * 70)

print("\n❌ BROKEN CODE (Following common pattern):")
print("─" * 70)
print("""
def parse_memo_from_transaction(tx: dict) -> Optional[dict]:
    # This pattern is shown in many examples but FAILS
    tx_data = tx.get("tx", tx)  # ❌ Doesn't check tx_json!
    
    if "Memos" not in tx_data:
        return None  # Returns None even when memos exist!
    
    memos = tx_data["Memos"]
    # ... rest of parsing
""")

print("\n✓ WORKING CODE (After discovering tx_json):")
print("─" * 70)
print("""
def parse_memo_from_transaction(tx: dict) -> Optional[dict]:
    # MUST check tx_json first, then fall back to tx
    tx_data = tx.get("tx_json", tx.get("tx", tx))  # ✓ Correct!
    
    if "Memos" not in tx_data:
        return None
    
    memos = tx_data["Memos"]
    # ... rest of parsing
""")

print("\n" + "=" * 70)
print("THE DIFFERENCE:")
print("=" * 70)
print("Broken:  tx.get('tx', tx)")
print("Working: tx.get('tx_json', tx.get('tx', tx))")
print("\nThis single line difference cost us 3+ hours of debugging!")
print("=" * 70)