"""
Main Chatbot Class for FinSight
"""

from typing import List, Dict, Any, Optional
from .commands import CommandHandler


class FinSightBot:
    """
    Main chatbot class for FinSight
    Handles conversation flow and command processing
    """
    
    def __init__(self, use_ollama: bool = True):
        self.command_handler = CommandHandler()
        self.conversation_history: List[Dict[str, str]] = []
        self.system_prompt = self._load_system_prompt()
        
        # Ollama client
        self.use_ollama = use_ollama
        self.ollama_client = None
        
        if use_ollama:
            try:
                from .ollama_client import OllamaClient
                self.ollama_client = OllamaClient()
                print(f"FinSight initialized with Ollama model: {self.ollama_client.model}")
                print("Ollama connection will be checked on first request.")
            except Exception as e:
                print(f"Warning: Could not initialize Ollama client: {e}")
    
    def _load_system_prompt(self) -> str:
        """Load the system prompt"""
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
    
    def process_message(self, user_message: str) -> str:
        """Process a user message and return response"""
        user_message = user_message.strip()
        
        if not user_message:
            return "Hello! I'm FinSight, your Financial Officer assistant. How can I help you today?"
        
        # Check if it's a command
        if user_message.startswith("/"):
            response = self.command_handler.process_command(user_message)
            if response == "__EXIT__":
                return response
            return response
        
        # Use Ollama for general conversation
        return self._handle_conversation(user_message)
    
    def _handle_conversation(self, message: str) -> str:
        """Handle general conversation using Ollama LLM"""
        
        # Check if Ollama is available - dynamic check on each request
        if self.use_ollama and self.ollama_client:
            try:
                # Dynamic check - reconnect if needed
                if not self.ollama_client.check_connection():
                    # Try to reconnect
                    from .ollama_client import OllamaClient
                    self.ollama_client = OllamaClient()
                    if not self.ollama_client.check_connection():
                        # Still not available, fall back
                        return self._handle_basic_conversation(message)
                
                # Add user message to history
                self.ollama_client.add_to_history("user", message)
                
                # Generate response
                response = self.ollama_client.generate(message)
                
                # Add assistant response to history
                self.ollama_client.add_to_history("assistant", response)
                
                return response
            except Exception as e:
                return f"Error generating response: {e}"
        
        # Fallback to basic responses if Ollama not available
        return self._handle_basic_conversation(message)
    
    def _handle_basic_conversation(self, message: str) -> str:
        """Handle basic conversation without LLM"""
        message_lower = message.lower()
        
        # Simple keyword-based responses
        greetings = ["hello", "hi", "hey", "good morning", "good afternoon"]
        if any(greet in message_lower for greet in greetings):
            return """Hello! I'm FinSight, your AI assistant for KPMG Financial Officers.

I can help you with:
- Financial calculations (depreciation, NPV, ROI, etc.)
- IFRS/GAAP compliance information
- Tax regulations and deadlines
- Report templates and checklists
- Audit preparation

Type `/help` to see all available commands, or just ask me a question!

Note: For full AI-powered conversation, please start Ollama with 'ollama serve'"""
        
        thanks = ["thank", "thanks", "appreciate"]
        if any(thank in message_lower for thank in thanks):
            return "You're welcome! Feel free to ask if you need anything else."
        
        # Default response
        return f"""I understand you're asking about: "{message}"

For specific assistance, you can:

1. **Use a command:**
   - `/calculate depreciation 10000 5` - Calculate depreciation
   - `/compliance IFRS 16` - Get compliance info
   - `/tax VAT` - Tax information
   - `/help` - See all commands

2. **Ask me a question** - (Ollama LLM not connected)

To enable AI conversation, run: `ollama serve` and restart the bot.

What would you like to do?"""
    
    def clear_history(self) -> None:
        """Clear conversation history"""
        self.conversation_history = []
        if self.ollama_client:
            self.ollama_client.clear_history()
    
    def add_to_history(self, role: str, content: str) -> None:
        """Add a message to conversation history"""
        self.conversation_history.append({
            "role": role,
            "content": content
        })
        if self.ollama_client:
            self.ollama_client.add_to_history(role, content)
    
    def get_history(self) -> List[Dict[str, str]]:
        """Get conversation history"""
        return self.conversation_history.copy()
    
    def is_ollama_connected(self) -> bool:
        """Check if Ollama is connected"""
        return self.use_ollama and self.ollama_client is not None
    
    def get_welcome_message(self) -> str:
        """Return welcome message"""
        ollama_status = "AI-powered" if self.is_ollama_connected() else "📋 Command-based"
        
        return f"""
Mode: {ollama_status}

Welcome to FinSight! I'm here to help KPMG Financial Officers with:

   Financial Calculations
   • Depreciation, Amortization, Accruals
   • NPV, IRR, ROI
   • Financial Ratios

   Compliance & Regulations
   • IFRS Standards (15, 16, 9, etc.)
   • GAAP Information
   • Audit Checklists

   Tax Support
   • VAT, Corporate Tax
   • Transfer Pricing
   • Filing Deadlines

   Reporting
   • Financial Statements
   • Templates
   • Best Practices

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Type `/help` to see all available commands
Or ask me a question about finance!
"""
