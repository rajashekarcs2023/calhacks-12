"""
XRPL Client for interacting with the XRP Ledger testnet.
Handles connections, transactions, and queries.
"""

import json
from typing import Optional, Dict, List, Any
from datetime import datetime
from xrpl.clients import JsonRpcClient, WebsocketClient
from xrpl.wallet import Wallet
from xrpl.models.transactions import Payment, Memo, AccountSet
from xrpl.models.requests import AccountTx, Tx
from xrpl.transaction import submit_and_wait
from xrpl.utils import hex_to_str, str_to_hex


class XRPLClient:
    """Client for XRPL testnet operations."""
    
    def __init__(self, seed: str, network_url: str):
        """
        Initialize XRPL client.
        
        Args:
            seed: XRPL wallet seed/secret
            network_url: WebSocket URL for XRPL network
        """
        self.network_url = network_url
        self.wallet = Wallet.from_seed(seed)
        self.client: Optional[WebsocketClient] = None
        self.explorer_base = "https://testnet.xrpl.org"
        
    def connect(self):
        """Establish connection to XRPL network."""
        if self.client is None or not self.client.is_open():
            self.client = WebsocketClient(self.network_url)
            self.client.open()
            print(f"✅ Connected to XRPL testnet")
            print(f"📍 Wallet address: {self.wallet.address}")
    
    def disconnect(self):
        """Close connection to XRPL network."""
        if self.client and self.client.is_open():
            self.client.close()
            print("🔌 Disconnected from XRPL testnet")
    
    def submit_memo_transaction(self, memo_data: dict) -> Dict[str, Any]:
        """
        Submit an AccountSet transaction with memo data for timestamp proofs.
        
        Uses AccountSet instead of self-payment since XRPL no longer allows 
        transactions with the same sender and destination.
        
        Args:
            memo_data: Dictionary to include in memo
            
        Returns:
            Dictionary with transaction details
        """
        self.connect()
        
        try:
            # Convert memo data to hex-encoded JSON
            memo_json = json.dumps(memo_data, separators=(',', ':'))
            memo_hex = str_to_hex(memo_json)
            
            # Create memo object
            memo = Memo(
                memo_type=str_to_hex("gov-proof"),
                memo_data=memo_hex
            )
            
            # Create AccountSet transaction
            # This is a valid way to store memo data on XRPL without changing anything
            account_set = AccountSet(
                account=self.wallet.address,
                memos=[memo]
            )
            
            # Submit and wait - this handles autofill and signing automatically
            print("📤 Submitting transaction to XRPL...")
            response = submit_and_wait(account_set, self.client, self.wallet)
            
            result = response.result
            tx_hash = result.get("hash")
            ledger_index = result.get("ledger_index")
            
            print(f"✅ Transaction validated!")
            print(f"   TX Hash: {tx_hash}")
            print(f"   Ledger: {ledger_index}")
            
            return {
                "txHash": tx_hash,
                "explorerUrl": f"{self.explorer_base}/transactions/{tx_hash}",
                "ledgerIndex": ledger_index,
                "validated": result.get("validated", False)
            }
            
        except Exception as e:
            print(f"❌ Transaction failed: {str(e)}")
            raise Exception(f"Failed to submit memo transaction: {str(e)}")
    
    def query_account_transactions(self, limit: int = 50) -> List[Dict]:
        """
        Query recent transactions for the wallet.
        
        Args:
            limit: Maximum number of transactions to retrieve
            
        Returns:
            List of transaction dictionaries
        """
        self.connect()
        
        try:
            request = AccountTx(
                account=self.wallet.address,
                limit=limit
            )
            
            response = self.client.request(request)
            
            if response.is_successful():
                transactions = response.result.get("transactions", [])
                print(f"📊 Retrieved {len(transactions)} transactions")
                return transactions
            else:
                raise Exception(f"Failed to query transactions: {response.result}")
                
        except Exception as e:
            raise Exception(f"Failed to query account transactions: {str(e)}")
    
    def get_transaction_details(self, tx_hash: str) -> Dict:
        """
        Get details of a specific transaction.
        
        Args:
            tx_hash: Transaction hash to query
            
        Returns:
            Transaction details dictionary
        """
        self.connect()
        
        try:
            request = Tx(transaction=tx_hash)
            response = self.client.request(request)
            
            if response.is_successful():
                return response.result
            else:
                raise Exception(f"Transaction not found: {tx_hash}")
                
        except Exception as e:
            raise Exception(f"Failed to get transaction details: {str(e)}")
    
    def submit_payment(self, destination: str, amount_drops: int, memo: Optional[str] = None) -> Dict[str, Any]:
        """
        Submit a payment transaction.
        
        Args:
            destination: Destination XRPL address (must be different from sender)
            amount_drops: Amount in drops (1 XRP = 1,000,000 drops)
            memo: Optional memo text
            
        Returns:
            Dictionary with transaction details
        """
        self.connect()
        
        try:
            # Validate destination is different from sender
            if destination == self.wallet.address:
                raise ValueError("Destination cannot be the same as sender address")
            
            memos = []
            if memo:
                memos.append(Memo(
                    memo_type=str_to_hex("payment"),
                    memo_data=str_to_hex(memo)
                ))
            
            payment = Payment(
                account=self.wallet.address,
                destination=destination,
                amount=str(amount_drops),
                memos=memos if memos else None
            )
            
            print(f"💸 Sending {amount_drops} drops to {destination}...")
            # Submit and wait - handles autofill and signing automatically
            response = submit_and_wait(payment, self.client, self.wallet)
            
            result = response.result
            tx_hash = result.get("hash")
            
            print(f"✅ Payment successful: {tx_hash}")
            
            return {
                "txHash": tx_hash,
                "explorerUrl": f"{self.explorer_base}/transactions/{tx_hash}",
                "amount": amount_drops,
                "destination": destination
            }
            
        except Exception as e:
            raise Exception(f"Failed to submit payment: {str(e)}")