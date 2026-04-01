"""
Ollama Client for FinSight
Handles communication with local Ollama LLM
"""

import os
import requests
import json
from typing import Generator, Optional, List, Dict


class OllamaClient:
    """Client for interacting with Ollama API"""
    
    def __init__(
        self,
        model: str = None,
        base_url: str = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ):
        # Load from environment variables or use defaults
        self.model = model or os.environ.get("OLLAMA_MODEL", "mistral-nemo")
        self.base_url = base_url or os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.conversation_history: List[Dict[str, str]] = []
    
    def _load_system_prompt(self) -> str:
        """Load the FinSight system prompt"""
        return """You are FinSight, an AI assistant specialized in supporting KPMG Financial Officers.

Your role is to help with:
- Compliance questions (IFRS, GAAP, regulatory requirements)
- Financial calculations (depreciation, amortization, NPV, IRR, etc.)
- Tax regulations and deadlines
- Financial reporting and templates
- Audit preparation checklists
- General financial guidance

Guidelines:
1. Always be professional and accurate
2. Provide clear, concise responses
3. Use tables and structured formats for complex information
4. Remind users to verify critical information with appropriate sources
5. If unsure, say so rather than providing potentially incorrect information

When users ask for calculations, you can provide the formula and explain how to compute them.
For compliance questions, cite the relevant standard (IFRS/GAAP) where applicable.
For tax questions, note that rates vary by jurisdiction and users should verify with local authorities.

You can suggest these commands when users want specific calculations:
- /calculate depreciation <cost> <life> [salvage] [method]
- /calculate amortization <principal> <rate> <periods>
- /calculate npv <cash_flows> <rate>
- /calculate irr <cash_flows>
- /calculate roi <investment> <final_value> [years]
- /compliance <standard>
- /tax <topic>

Remember: You are a professional assistant for finance professionals."""
    
    def check_connection(self) -> bool:
        """Check if Ollama is running and accessible"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except Exception:
            return False
    
    def list_models(self) -> List[str]:
        """List available models"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                data = response.json()
                return [m["name"] for m in data.get("models", [])]
            return []
        except Exception:
            return []
    
    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        stream: bool = False
    ) -> str:
        """Generate a response from the model"""
        if system_prompt is None:
            system_prompt = self._load_system_prompt()
        
        messages = [
            {"role": "system", "content": system_prompt},
            *self.conversation_history,
            {"role": "user", "content": prompt}
        ]
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "stream": stream
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=120
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("message", {}).get("content", "")
            else:
                return f"Error: Ollama returned status {response.status_code}"
                
        except requests.exceptions.ConnectionError:
            return "Error: Cannot connect to Ollama. Make sure Ollama is running (run 'ollama serve')"
        except requests.exceptions.Timeout:
            return "Error: Request timed out. Try a shorter prompt."
        except Exception as e:
            return f"Error: {str(e)}"
    
    def generate_streaming(self, prompt: str) -> Generator[str, None, None]:
        """Generate streaming response"""
        system_prompt = self._load_system_prompt()
        
        messages = [
            {"role": "system", "content": system_prompt},
            *self.conversation_history,
            {"role": "user", "content": prompt}
        ]
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "stream": True
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/chat",
                json=payload,
                stream=True,
                timeout=120
            )
            
            for line in response.iter_lines():
                if line:
                    data = json.loads(line)
                    content = data.get("message", {}).get("content", "")
                    if content:
                        yield content
                        
        except Exception as e:
            yield f"Error: {str(e)}"
    
    def add_to_history(self, role: str, content: str) -> None:
        """Add message to conversation history"""
        self.conversation_history.append({"role": role, "content": content})
        
        # Keep history manageable (last 10 messages)
        if len(self.conversation_history) > 10:
            self.conversation_history = self.conversation_history[-10:]
    
    def clear_history(self) -> None:
        """Clear conversation history"""
        self.conversation_history = []
    
    def get_history(self) -> List[Dict[str, str]]:
        """Get conversation history"""
        return self.conversation_history.copy()
