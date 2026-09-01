"""
Anicca Trust Layer - PII Masking/Demasking

Module:    apps.api.src.infrastructure.trust_layer.masking
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

import re
from typing import Dict, Tuple

# Simple regex patterns for PII masking (MVP level)
CPF_PATTERN = re.compile(r'\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b')
PHONE_PATTERN = re.compile(r'\+?\b\d{2,3}?\s?\(?\d{2}\)?\s?\d{4,5}-?\d{4}\b')
EMAIL_PATTERN = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b')

class PIIMasker:
    """Masks and unmasks Personal Identifiable Information (PII)."""

    def __init__(self):
        # We store original values mapped to their placeholders to unmask later.
        self._mapping: Dict[str, str] = {}
        self._counter = 0

    def mask(self, text: str) -> str:
        """Finds PII in text and replaces it with placeholders."""
        if not text:
            return text
            
        masked_text = text
        
        # Mask CPF
        for match in CPF_PATTERN.finditer(masked_text):
            val = match.group(0)
            token = f"[CPF_{self._counter}]"
            self._mapping[token] = val
            masked_text = masked_text.replace(val, token)
            self._counter += 1

        # Mask Phone
        for match in PHONE_PATTERN.finditer(masked_text):
            val = match.group(0)
            token = f"[PHONE_{self._counter}]"
            self._mapping[token] = val
            masked_text = masked_text.replace(val, token)
            self._counter += 1
            
        # Mask Email
        for match in EMAIL_PATTERN.finditer(masked_text):
            val = match.group(0)
            token = f"[EMAIL_{self._counter}]"
            self._mapping[token] = val
            masked_text = masked_text.replace(val, token)
            self._counter += 1

        return masked_text

    def unmask(self, text: str) -> str:
        """Replaces placeholders with original PII values."""
        if not text:
            return text
            
        unmasked_text = text
        for token, original_val in self._mapping.items():
            unmasked_text = unmasked_text.replace(token, original_val)
            
        return unmasked_text

