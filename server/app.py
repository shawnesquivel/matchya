from chalice import Chalice, CORSConfig, Response
from chalice import BadRequestError
import logging
from chalicelib.chatbot import text_generation_with_function_call
from chalicelib.kitsune_1_chatbot import send_message_to_openai
from chalicelib.utils import current_epoch_time
from chalicelib.update_table import store_message

app = Chalice(app_name="mimir-backend")

cors_config = CORSConfig(
    # allow_origin="http://localhost:3000",
    # wildcard: testing only
    allow_origin="*",
    allow_headers=["X-Special-Header"],
    max_age=600,
    allow_credentials=True,
)


@app.route("/")
def index():
    """
    Verify the server status by going to http://127.0.0.1:8000/

    Documentation: https://aws.github.io/chalice/quickstart.html
    """
    return {"Welcome": "to the future!"}


@app.route("/hello/{name}")
def hello_name(name):
    """
    Receives the value after the /hello/{VALUE} does something to it.

    Examples
    --------
    http://127.0.0.1:8000/hello/elon

    http://127.0.0.1:8000/hello/sam
    """
    # '/hello/james' -> {"hello": "james"}

    return {"message": f"Welcome to the course, {name.upper()}!"}


# @app.route('/users', methods=['POST'])
# def create_user():
#     # This is the JSON body the user sent in their POST request.
#     user_as_json = app.current_request.json_body
#     # We'll echo the json body back to the user in a 'user' key.
#     return {'user': user_as_json}
#
# See the README documentation for more examples.
#


# @app.route("/chat", methods=["POST"], cors=cors_config)
# def kitsune_chatbot_1():
#     """Kitsune 1: Chatbot"""
#     try:
#         user_message = app.current_request.json_body["message"]
#         # Add more settings from the frontend
#         user_temperature = app.current_request.json_body["temperature"]
#         user_model = app.current_request.json_body["model"]
#         user_prompt_template = app.current_request.json_body["prompt_template"]

#         bot_response = send_message_to_openai(
#             user_message, user_prompt_template, user_model, user_temperature
#         )

#         # We will continue adding keys here later, for now it will simply be the bot_response
#         response_object = {
#             "message": bot_response,
#             "timestamp": current_epoch_time(),
#             "chatId": app.current_request.json_body["chat_id"],
#         }

#         print(f"Returning object: {response_object}")
#         return Response(
#             body=response_object,
#             status_code=200,
#         )

#     except Exception as e:
#         logging.error(f"An error occurred: {str(e)}")
#         return Response(body={"error": str(e)}, status_code=500)


@app.route("/chat", methods=["POST"], cors=cors_config)
def kitsune_chatbot_2():
    """Kitsune 2: Messages"""
    try:
        user_message = app.current_request.json_body["message"]
        """
        TUTORIAL: Store the user message in the backend.
        1. Get chat ID
        2. Store message as user
        """
        user_chat_id = app.current_request.json_body["chat_id"]
        store_message(chat_id=user_chat_id, content=user_message, role="user")

        """
        TUTORIAL: Fetch old messages
        """

        # Add more settings from the frontend
        user_temperature = app.current_request.json_body["temperature"]
        user_model = app.current_request.json_body["model"]
        user_prompt_template = app.current_request.json_body["prompt_template"]

        bot_response = send_message_to_openai(
            user_message, user_prompt_template, user_model, user_temperature
        )
        """
        TUTORIAL: Store the bot resposne in the backend.
        """

        bot_message, bot_storage_response = store_message(
            chat_id=user_chat_id, content=bot_response, role="assistant"
        )
        print(f"bot storage response {bot_storage_response}")

        # We will continue adding keys here later, for now it will simply be the bot_response

        print(f"Returning object: {bot_message}")
        return Response(
            body=bot_message,
            status_code=200,
        )

    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return Response(body={"error": str(e)}, status_code=500)


# @app.route("/chat", methods=["POST", "GET"], cors=cors_config)
# def tutorial_chat_endpoint():
#     """
#     Test endpoint for NextJS tutorial.

#     To Test:
#     curl -X POST http://127.0.0.1:8000/chat \
#         -H "Content-Type: application/json" \
#         -d '{
#                 "message": "What is a Large Language Model?"
#     }'
#     """
#     try:
#         user_message = app.current_request.json_body["message"]
#         user_api_key = app.current_request.json_body["apiKey"]

#         if not user_api_key:
#             user_api_key = "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"
#         print(f"received user message: {user_message}")
#         messages = text_generation_with_function_call(
#             user_message, api_key=user_api_key
#         )
#         # Assume messages is a list and we need the last message which is a dictionary containing 'choices'
#         last_message = messages[-1]
#         print(f"LAST MESSAGE: {last_message}")
#         if hasattr(last_message, "choices") and last_message.choices:
#             print("choices Present")
#             result_content = last_message.choices[-1].message.content
#         else:
#             print("choices not present")
#             result_content = last_message.content
#             print(result_content)
#         return Response(body={"data": {"response": result_content}}, status_code=200)
#     except Exception as e:
#         logging.error(f"An error occurred: {str(e)}")
#         return Response(body={"error": str(e)}, status_code=500)


# @app.route("/agents", methods=["POST", "GET"], cors=cors_config)
# def agents_endpoint():
#     """
#     Test endpoint for NextJS tutorial.

#     To Test:
#     curl -X POST http://127.0.0.1:8000/chat \
#         -H "Content-Type: application/json" \
#         -d '{
#                 "message": "What is a Large Language Model?"
#     }'
#     """
#     try:
#         # TODO Use the request body from user
#         # user_message = app.current_request.json_body["message"]
#         user_message = "Make a tweet about AI agents"

#         user_api_key = app.current_request.json_body["apiKey"]

#         if not user_api_key:
#             user_api_key = "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"
#         result_content = {" "}
#         return Response(body={"data": {"response": result_content}}, status_code=200)
#     except Exception as e:
#         logging.error(f"An error occurred: {str(e)}")
#         return Response(body={"error": str(e)}, status_code=500)
