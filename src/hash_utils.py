"""
Hash utilities for document verification and proof generation.
Handles SHA-256 hashing from various input formats.
"""

import hashlib
import base64
import json
import re
from typing import Union


def compute_sha256_from_bytes(data: bytes) -> str:
    """
    Compute SHA-256 hash from raw bytes.
    
    Args:
        data: Raw byte data to hash
        
    Returns:
        Lowercase hexadecimal SHA-256 hash (64 characters)
    """
    return hashlib.sha256(data).hexdigest()


def compute_sha256_from_b64(b64_string: str) -> str:
    """
    Decode Base64 string and compute SHA-256 hash.
    
    Args:
        b64_string: Base64-encoded data
        
    Returns:
        Lowercase hexadecimal SHA-256 hash (64 characters)
        
    Raises:
        ValueError: If Base64 decoding fails
    """
    try:
        # Remove any whitespace or newlines
        b64_clean = b64_string.strip().replace('\n', '').replace('\r', '')
        
        # Decode Base64
        decoded_data = base64.b64decode(b64_clean)
        
        # Compute hash
        return compute_sha256_from_bytes(decoded_data)
    except Exception as e:
        raise ValueError(f"Failed to decode Base64 and compute hash: {str(e)}")


def is_valid_sha256(hash_str: str) -> bool:
    """
    Validate if a string is a valid SHA-256 hash.
    
    Args:
        hash_str: String to validate
        
    Returns:
        True if valid SHA-256 hash format, False otherwise
    """
    if not hash_str:
        return False
    
    # SHA-256 hash is 64 hexadecimal characters
    pattern = re.compile(r'^[a-fA-F0-9]{64}$')
    return bool(pattern.match(hash_str))


def encode_memo_data(data: dict) -> str:
    """
    Encode dictionary data as JSON string for XRPL memo.
    
    Args:
        data: Dictionary to encode
        
    Returns:
        JSON string representation
    """
    return json.dumps(data, separators=(',', ':'))  # Compact JSON


def decode_memo_data(memo_str: str) -> dict:
    """
    Decode JSON string from XRPL memo.
    
    Args:
        memo_str: JSON string from memo
        
    Returns:
        Parsed dictionary
        
    Raises:
        ValueError: If JSON parsing fails
    """
    try:
        return json.loads(memo_str)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to decode memo JSON: {str(e)}")


def detect_input_type(input_str: str) -> str:
    """
    Detect whether input is a SHA-256 hash or Base64 data.
    
    Args:
        input_str: Input string to analyze
        
    Returns:
        'hash' if valid SHA-256, 'base64' otherwise
    """
    if is_valid_sha256(input_str):
        return 'hash'
    return 'base64'