from chalicelib.mimir_embeddings import (
    therapist_similarity_search,
)
from openai import OpenAI
import json
import os
import logging
from chalicelib.utils_s3 import get_ssm_parameter

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=get_ssm_parameter("OPENAI_API_KEY"))
"""
Helper Functions
"""


class MessageError(Exception):
    """Custom exception for message errors."""

    def __init__(self, message, original_exception=None):
        super().__init__(message)
        self.original_exception = original_exception


def determine_assistant_tool_messages(messages: str):
    """Helper Function: For function calling, determines the correct message to return."""
    try:
        last_message = messages[-1]
        print(f"last message: {last_message}")

        # Check if last_message has 'choices'
        if hasattr(last_message, "choices"):
            print(f"choices")
            tool_message = messages[-2]["content"]
            message_content = str(last_message.choices[0].message.content)
        # Check if last_message has 'content'
        elif hasattr(last_message, "content"):
            print(f"content")
            message_content = str(last_message.content)
            tool_message = None
        else:
            print(f"error finding message: {last_message}")
            raise MessageError("Error finding message format", last_message)

        return (message_content, tool_message)
    except Exception as e:
        # Log the error message and return a tuple indicating the error
        error_message = f"An error occurred: {str(e)}"
        print(error_message)
        raise MessageError(error_message, e) from e


def chat_function_call(
    user_msg,
    model="gpt-4",
):
    """
    Simple text generation with OpenAI

    Support models: https://platform.openai.com/docs/guides/function-calling/supported-models
    """
    format_system_msg = f"""
        You are `matchya`, a helpful receptionist who helps users find their ideal therapist.

        Your first questions should inquire about the user's preferences. Use open ended questions. Don't be pushy. All lower case! 
        (1) hihi. i'm matchya, and i'm here to match you with your ideal therapist. but first, i need your help. the more details you can provide, the better match i can find you. and don't worry - everything is 100% confidential, all chats are deleted after 24h. 
        (2) do you have a preferred gender for your therapist?  
        (3) can you tell me a little about why you're looking for a therapist? 

        Good Match Example: 
        User: Help me find a therapist who specializes in holistic approaches"
        Response: here are 2 therapists who specialize in holistic approaches. you also mentioned 

        [SUMMARY OF RESULTS]

        No Match Example: 
        User: help me find a therapist who specialize in sexual abuse.
        Response: sorry, I the closest match I found is a therapist who has. is that alright? let me know if you have other preferences and i can try to match you better.
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
    tools = [
        {
            "type": "function",
            "function": {
                "name": "therapist_similarity_search",
                "description": "",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_msg": {
                            "type": "string",
                            "description": "A search to the therapist database with the user's request, cleaned for grammatical errors.",
                        },
                    },
                    "required": ["user_msg"],
                },
            },
        },
    ]

    try:
        response = client.chat.completions.create(
            model=model, messages=messages, tools=tools, tool_choice="auto"
        )
        # print(format_system_msg)
        print(f"OpenAI: {response}")
        response_message = response.choices[0].message
        print(response_message)
        tool_calls = response_message.tool_calls
        print("tools", tool_calls)

        if tool_calls:
            print(f"tool requested")
            available_functions = {
                "therapist_similarity_search": therapist_similarity_search,
            }
            messages.append(
                response_message
            )  # extend conversation with assistant's reply

            for tool_call in tool_calls:
                function_name = tool_call.function.name
                function_to_call = available_functions[function_name]
                function_args = json.loads(tool_call.function.arguments)
                function_response = function_to_call(**function_args)
                messages.append(
                    {
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": function_response,
                    }
                )  # extend conversation with function response
            second_response = client.chat.completions.create(
                model="gpt-3.5-turbo-0125",
                messages=messages,
            )  # get a new response from the model where it can see the function response
            print(f"second response: {second_response}")
            messages.append(second_response)
        else:
            print("no tool requested")
            messages.append(response_message)

    except Exception as e:
        error_message = f"Function Call: There was an error {e}"
        messages.append({"role": "assistant", "content": error_message})
        logging.info(error_message)
        raise ValueError

    return messages
