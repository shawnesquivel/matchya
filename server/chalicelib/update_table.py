import boto3
import logging

# Initialize a DynamoDB client. Ensure the region matches.
dynamodb = boto3.resource("dynamodb", region_name="us-west-2")
# Connect to the DynamoDB Table. Make sure this matches the table name on AWS.
table = dynamodb.Table("Messages")


def store_message(
    chat_id,
    content,
    role,
    timestamp,
    audio_file_url=None,
):
    """
    Stores a message in a DynamoDB table.

    Parameters
    -----------
    chat_id - unique identifier for the chat

    timestamp - epoch time

    role - 'user', 'assistant'

    audio_file_url - optional, link to audio

    """
    # We upload objects to DynamoDB. Required: chat_id/timestamp.
    message = {
        "chat_id": str(chat_id),  # unique id
        "timestamp": timestamp,  # current time stamp
        "content": content,  # message from openai
        "role": role,  # 'user' or 'assistant'
        "audio_file_url": audio_file_url,  # used in the next phase
    }
    response = table.put_item(Item=message)  # AWS method to add the item

    logging.info(f"Creating item: {message}")
    logging.info("========================")
    print(f"message stored: {response}")

    return (message, response)


def get_all_messages_for_chat(chat_id):
    """
    Retrieve chat messages from DynamoDB.
    """
    response = table.query(
        KeyConditionExpression=boto3.dynamodb.conditions.Key("chat_id").eq(chat_id)
    )
    return response["Items"]


# Example
# store_message("abc123", "hello world", 'user', 1234, None)
# print(get_all_messages_for_chat("abc123"))