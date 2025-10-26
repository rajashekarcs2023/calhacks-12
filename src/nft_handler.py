"""
NFT Handler for minting document certificates on XRPL.
"""

import json
from typing import Dict, Any
from xrpl.models.transactions import NFTokenMint
from xrpl.transaction import submit_and_wait
from xrpl.utils import str_to_hex


class NFTHandler:
    """Handler for XRPL NFT operations."""
    
    def __init__(self, xrpl_client):
        """
        Initialize NFT handler.
        
        Args:
            xrpl_client: Instance of XRPLClient
        """
        self.client = xrpl_client
    
    def encode_nft_uri(self, data: dict) -> str:
        """
        Encode metadata into compact JSON for NFT URI.
        
        Args:
            data: Dictionary with NFT metadata
            
        Returns:
            Hex-encoded URI string
            
        Raises:
            ValueError: If URI exceeds XRPL size limit
        """
        # Create compact JSON
        compact_json = json.dumps(data, separators=(',', ':'))
        
        # Convert to hex
        uri_hex = str_to_hex(compact_json)
        
        # XRPL URI field limit is 512 bytes (256 hex characters)
        if len(uri_hex) > 512:
            raise ValueError(f"URI too large: {len(uri_hex)} bytes (max 512)")
        
        return uri_hex
    
    def mint_document_nft(self, cid: str, metadata: dict) -> Dict[str, Any]:
        """
        Mint an NFT representing a government document certificate.
        
        Args:
            cid: Content identifier (IPFS CID or URL)
            metadata: Additional metadata (sha256, title, caseId, etc.)
            
        Returns:
            Dictionary with NFT mint details
        """
        self.client.connect()
        
        try:
            # Build URI payload
            uri_data = {
                "cid": cid,
                "metadata": metadata
            }
            
            uri_hex = self.encode_nft_uri(uri_data)
            
            print(f"🎨 Minting NFT certificate...")
            print(f"   CID: {cid}")
            print(f"   Metadata: {metadata}")
            
            # Create NFTokenMint transaction
            mint_tx = NFTokenMint(
                account=self.client.wallet.address,
                uri=uri_hex,
                flags=8,  # tfTransferable (can be transferred)
                transfer_fee=0,  # No transfer fee
                nftoken_taxon=0  # Taxon for categorization
            )
            
            # Submit and wait - handles autofill and signing automatically
            response = submit_and_wait(mint_tx, self.client.client, self.client.wallet)
            
            result = response.result
            tx_hash = result.get("hash")
            
            # Extract NFT ID from metadata
            nft_id = None
            if "meta" in result:
                meta = result["meta"]
                # Look for nftoken_id in meta
                if "nftoken_id" in meta:
                    nft_id = meta["nftoken_id"]
                # Also check AffectedNodes for CreatedNode with NFTokenPage
                elif "AffectedNodes" in meta:
                    for node in meta["AffectedNodes"]:
                        if "CreatedNode" in node:
                            created = node["CreatedNode"]
                            if created.get("LedgerEntryType") == "NFTokenPage":
                                # NFT ID might be in NewFields
                                if "NewFields" in created and "NFTokens" in created["NewFields"]:
                                    nfts = created["NewFields"]["NFTokens"]
                                    if nfts and len(nfts) > 0:
                                        nft_id = nfts[0].get("NFToken", {}).get("NFTokenID")
            
            print(f"✅ NFT minted successfully!")
            print(f"   TX Hash: {tx_hash}")
            if nft_id:
                print(f"   NFT ID: {nft_id}")
            else:
                print(f"   NFT ID: (check transaction for details)")
            
            return {
                "nftId": nft_id,
                "txHash": tx_hash,
                "explorerUrl": f"{self.client.explorer_base}/transactions/{tx_hash}",
                "uri": uri_data
            }
            
        except Exception as e:
            print(f"❌ NFT minting failed: {str(e)}")
            raise Exception(f"Failed to mint NFT: {str(e)}")