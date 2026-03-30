"""
FinSight Chatbot - CLI Entry Point
Terminal-based interface for testing the chatbot
"""

import sys
import os

# Load environment variables from .env file
from dotenv import load_dotenv
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(dotenv_path)

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.chatbot.bot import FinSightBot


def main():
    """Main entry point for the CLI"""
    bot = FinSightBot()
    
    print(bot.get_welcome_message())
    
    while True:
        try:
            user_input = input("\n➤ ").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() in ["exit", "quit", "q"]:
                print("\nThank you for using FinSight! Goodbye! 👋\n")
                break
            
            response = bot.process_message(user_input)
            if response == "__EXIT__":
                print("\nThank you for using FinSight! Goodbye! 👋\n")
                break
            print(f"\n{response}")
            
        except KeyboardInterrupt:
            print("\n\nThank you for using FinSight! Goodbye! 👋\n")
            break
        except EOFError:
            break


if __name__ == "__main__":
    main()
