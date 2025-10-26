# XRPL Proof & Certificates MCP Server

A Model Context Protocol (MCP) server that provides tamper-proof document proofs and NFT certificates on the XRP Ledger testnet.

## 🎯 Purpose

This MCP enables government service platforms to:
- Create immutable, timestamped proofs of document submissions
- Verify document authenticity via blockchain
- Issue NFT certificates for official records
- Process service fee payments

**Privacy-First**: No personal data or document content is stored on-chain, only SHA-256 hashes.

## 🚀 Quick Start

### 1. Create XRPL Testnet Wallet

Visit: https://xrpl.org/xrp-testnet-faucet

- Generate a new testnet wallet
- Copy your seed/secret (starts with 's')
- Save it securely

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your testnet seed
# XRPL_TESTNET_SEED=sYourSeedHere
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Server
```bash
python server.py
```

## 🛠️ Available Tools

### 1. `xrpl_timestamp`

Record a document hash on the blockchain.
```python
xrpl_timestamp(
    sha256_hex_str="a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
    meta={
        "serviceId": "passport-renewal",
        "caseId": "CR-2024-001"
    }
)
```

**Returns:**
```json
{
    "txHash": "ABC123...",
    "explorerUrl": "https://testnet.xrpl.org/transactions/ABC123...",
    "ledgerIndex": 12345
}
```

### 2. `verify`

Verify if a document proof exists.
```python
# With hash
verify("a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a")

# With Base64 PDF
verify("JVBERi0xLjQKJeLjz9MK...")
```

**Returns:**
```json
{
    "sha256": "a7ffc6f8...",
    "found": true,
    "txHash": "ABC123...",
    "explorerUrl": "https://testnet.xrpl.org/transactions/ABC123...",
    "timestamp": "2025-10-25T10:30:00Z"
}
```

### 3. `xrpl_mint_document_nft`

Mint an NFT certificate.
```python
xrpl_mint_document_nft(
    cid="QmX7ffc6f8bf1ed76651c14756a061d662",
    meta={
        "sha256": "a7ffc6f8...",
        "title": "Passport Certificate",
        "caseId": "CR-2024-001"
    }
)
```

### 4. `pay_fee`

Process a payment (testnet).
```python
pay_fee(
    amount_minor=1000000,  # 1 XRP
    destination="rN7n7otQDd6FczFgLdlqtyMVrn3S9gcWjQ",
    memo="Service fee"
)
```

## 🏗️ Architecture
```
xrpl-proof-mcp/
├── server.py              # Main MCP server with tools
├── src/
│   ├── xrpl_client.py    # XRPL connection & transactions
│   ├── hash_utils.py     # SHA-256 utilities
│   ├── nft_handler.py    # NFT minting
│   └── verification.py   # Proof verification
└── .env                  # Configuration
```

## 🔒 Security

- **Testnet Only**: Never use mainnet credentials
- **No PII On-Chain**: Only hashes are recorded
- **Environment Variables**: Keep `.env` secure and never commit

## 📚 Integration with Creao

This MCP server is designed to be used by the Creao platform. Once running, Creao can call these tools to:

1. Generate document PDFs
2. Hash them with SHA-256
3. Record proofs on XRPL
4. Verify submissions
5. Issue NFT certificates

## 🧪 Testing
```bash
# Test hash computation
python -c "from src.hash_utils import compute_sha256_from_bytes; print(compute_sha256_from_bytes(b'test'))"

# Test XRPL connection
python -c "from src.xrpl_client import XRPLClient; import os; from dotenv import load_dotenv; load_dotenv(); client = XRPLClient(os.getenv('XRPL_TESTNET_SEED'), os.getenv('XRPL_NETWORK')); client.connect(); client.disconnect()"
```

## 📖 Documentation

- XRPL Docs: https://xrpl.org/docs
- FastMCP: https://github.com/jlowin/fastmcp
- Testnet Explorer: https://testnet.xrpl.org

## 🎉 Demo Flow

1. User submits form → Platform generates PDF
2. Platform calls `xrpl_timestamp(hash)` → Gets blockchain proof
3. User can download certificate with proof link
4. Anyone can call `verify(pdf)` → Confirms authenticity

## 📝 License

Built for hackathon purposes - XRP Ledger track requirement.