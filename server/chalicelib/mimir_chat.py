from chalicelib.mimir_embeddings import (
    pinecone_similarity_search,
    pinecone_youtube_upload,
    pinecone_website_upload,
)
from openai import OpenAI
import json
import os
import logging

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
"""
Helper Functions
"""

def determine_assistant_tool_messages(messages: str):
    """Helper Function: For function calling, determines the correct message to return."""
    last_message = messages[-1]

    # there was a function call    
    if hasattr(last_message, "choices"):
        tool_message = messages[-2]["content"]
        message_content = str(last_message.choices[0].message.content)
    # there was no function call
    elif hasattr(last_message, "content"):
        message_content = str(last_message.content)
        tool_message = None
    else: 
        message_content = "Error finding message"
        tool_message = None

    return (message_content, tool_message)

"""
Write these functions
"""

def chat_function_call(
    user_msg,
    model="gpt-4",
):
    """
    Simple text generation with OpenAI

    Support models: https://platform.openai.com/docs/guides/function-calling/supported-models
    """
    format_system_msg = f"""You are a helpful assistant. Mention the user's query, then answer the question solely in the context. Reference the source of your answer.

        If there is no context provided, you can search it up using piencone_similarity_search.
        
        If it you still can't answer, say why you don't know.

        Example: 
        User: How do I create a NextJS Project?
        Context: Step 1, Step 2, Step 3. Metadata = "pdf/NextJS Instructions"
        Answer: To connect to Next JS, follow step 1, then step 2, then step 3.
        This is outlined in Page 35 of the document 'Next JS Instructions.' This is also referenced in Page 2 of 'Next JS Basics'
        """

    format_user_msg = f"""
            {user_msg}
        """
    messages = [
        {
            "role": "system",
            "content": format_system_msg,
        },
        {"role": "user", "content": format_user_msg},
    ]
    # Write this
    tools = []

    try:
      print("Attempting function call")
    except Exception as e:
        error_message=f"Function Call: There was an error {e}"
        messages.append({
            "role": "assistant",
            "content": error_message
        })
        logging.info(error_message)

    return messages

