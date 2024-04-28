from chalicelib.loaders import (
    youtube_to_docs,
    website_to_docs,
    # pdf_folder_to_docs,
    # notion_to_docs,
    # github_files_to_docs,
)
from chalicelib.vector_db import (
    # initialize_pinecone_index,
    # upload_documents_to_pinecone,
    # check_pinecone_index,
    pinecone_similarity_search,
    pinecone_youtube_upload,
    pinecone_website_upload,
)
from openai import OpenAI
import json


def text_generation_with_function_call(
    user_msg,
    api_key,
    model="gpt-4",
):
    """
    Simple text generation with OpenAI

    Support models: https://platform.openai.com/docs/guides/function-calling/supported-models
    """
    print(f"User API KEY : {api_key}")
    client = OpenAI(api_key=api_key)

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

    tools = [
        {
            "type": "function",
            "function": {
                "name": "pinecone_similarity_search",
                "description": "Add additional context to the user query",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_msg": {
                            "type": "string",
                            "description": "The user's message to query to the database",
                        },
                        "index_name": {
                            "type": "string",
                            "description": "Hardcoded to 'langchain-ai41'",
                        },
                    },
                    "required": ["user_msg"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "pinecone_youtube_upload",
                "description": "Given a youtube URL, it will add its transcript to the Pinecone vector store.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "youtube_url": {
                            "type": "string",
                            "description": "A youtube url, should start with:  https://www.youtube.com/watch?v=",
                        },
                    },
                    "required": ["youtube_url"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "pinecone_website_upload",
                "description": "Given a website URL that is NOT youtube, it will load its HTML into the Pinecone vector store.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "website_url": {
                            "type": "string",
                            "description": "A website url.",
                        },
                    },
                    "required": ["website_url"],
                },
            },
        },
    ]

    response = client.chat.completions.create(
        model=model, messages=messages, tools=tools, tool_choice="auto"
    )
    # print(format_system_msg)
    print(f"OpenAI: {response}")
    response_message = response.choices[0].message
    print(response_message)
    tool_calls = response_message.tool_calls
    print(tool_calls)

    if tool_calls:
        print(f"tool requested")
        available_functions = {
            "pinecone_similarity_search": pinecone_similarity_search,
            "pinecone_youtube_upload": pinecone_youtube_upload,
            "pinecone_website_upload": pinecone_website_upload,
        }  # only one function in this example, but you can have multiple
        messages.append(response_message)  # extend conversation with assistant's reply

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
        print(f"returning messages: {messages}")
        return messages
    else:
        print("no tool requested")
        messages.append(response_message)
        return messages
