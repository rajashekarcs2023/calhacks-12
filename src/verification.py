"""
Verification logic for checking document proofs on XRPL.
"""

import json
from typing import Dict, Any, Optional, List
from xrpl.utils import hex_to_str
from datetime import datetime


class ProofVerifier:
    """Verifier for blockchain-based document proofs."""
    
    def __init__(self, xrpl_client):
        """
        Initialize proof verifier.
        
        Args:
            xrpl_client: Instance of XRPLClient
        """
        self.client = xrpl_client
    
    def parse_memo_from_transaction(self, tx: dict) -> Optional[dict]:
        """
        Extract and parse memo data from a transaction.
        
        Args:
            tx: Transaction dictionary
            
        Returns:
            Parsed memo dictionary or None if no valid memo
        """
        try:
            # Handle different transaction response formats
            # Try tx_json first (from account_tx and tx methods)
            # Then fall back to tx, then to root
            tx_data = tx.get("tx_json", tx.get("tx", tx))
            
            if "Memos" not in tx_data:
                return None
            
            memos = tx_data["Memos"]
            if not memos or len(memos) == 0:
                return None
            
            # Get first memo
            memo = memos[0].get("Memo", {})
            memo_data_hex = memo.get("MemoData")
            
            if not memo_data_hex:
                return None
            
            # Decode hex to string
            memo_str = hex_to_str(memo_data_hex)
            
            # Parse JSON
            memo_json = json.loads(memo_str)
            
            return memo_json
            
        except Exception as e:
            # Silently skip transactions with invalid memos
            return None
    
    def search_hash_in_transactions(self, target_hash: str, transactions: List[dict]) -> Optional[Dict[str, Any]]:
        """
        Search for a specific hash in transaction memos.
        
        Args:
            target_hash: SHA-256 hash to search for
            transactions: List of transaction dictionaries
            
        Returns:
            Dictionary with match details or None if not found
        """
        target_hash_lower = target_hash.lower()
        
        for tx in transactions:
            memo_data = self.parse_memo_from_transaction(tx)
            
            if memo_data and "hash" in memo_data:
                stored_hash = memo_data["hash"].lower()
                
                if stored_hash == target_hash_lower:
                    # Extract transaction details
                    # Try tx_json first, then tx, then root
                    tx_info = tx.get("tx_json", tx.get("tx", tx))
                    tx_hash = tx.get("hash") or tx_info.get("hash")
                    
                    # Get timestamp from close_time_iso or use current time
                    timestamp = tx.get("close_time_iso")
                    if not timestamp:
                        # Try date field (Ripple epoch)
                        date_field = tx_info.get("date") or tx.get("date")
                        if date_field and isinstance(date_field, int):
                            # Convert Ripple epoch to ISO format (Ripple epoch starts Jan 1, 2000)
                            timestamp = datetime.fromtimestamp(date_field + 946684800).isoformat() + "Z"
                        else:
                            timestamp = memo_data.get("timestamp", "")
                    
                    return {
                        "found": True,
                        "txHash": tx_hash,
                        "explorerUrl": f"{self.client.explorer_base}/transactions/{tx_hash}",
                        "timestamp": timestamp,
                        "metadata": memo_data.get("metadata", {}),
                        "ledgerIndex": tx.get("ledger_index")
                    }
        
        return None
    
    def verify_proof(self, sha256_hash: str, search_limit: int = 50) -> Dict[str, Any]:
        """
        Verify if a document hash exists on the blockchain.
        
        Args:
            sha256_hash: SHA-256 hash to verify
            search_limit: Number of recent transactions to search
            
        Returns:
            Verification result dictionary
        """
        print(f"🔍 Searching for hash: {sha256_hash}")
        print(f"   Checking last {search_limit} transactions...")
        
        try:
            # Query recent transactions
            transactions = self.client.query_account_transactions(limit=search_limit)
            
            # Search for hash
            match = self.search_hash_in_transactions(sha256_hash, transactions)
            
            if match:
                print(f"✅ Proof found on blockchain!")
                print(f"   TX: {match['txHash']}")
                print(f"   Timestamp: {match['timestamp']}")
                
                return {
                    "sha256": sha256_hash,
                    "found": True,
                    "txHash": match["txHash"],
                    "explorerUrl": match["explorerUrl"],
                    "timestamp": match["timestamp"],
                    "metadata": match["metadata"],
                    "ledgerIndex": match["ledgerIndex"]
                }
            else:
                print(f"❌ Proof not found in recent transactions")
                
                return {
                    "sha256": sha256_hash,
                    "found": False,
                    "message": f"Hash not found in last {search_limit} transactions"
                }
                
        except Exception as e:
            raise Exception(f"Verification failed: {str(e)}")