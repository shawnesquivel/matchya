import boto3

"""
This tutorial is part of Kitsune Phase 2: Memory.

It demonstrates creating a system prompt object (blank).

Then it puts in previous messages.

Then it puts in our new message.
"""

# Initialize a DynamoDB client. Ensure the region matches.
dynamodb = boto3.resource("dynamodb", region_name="us-west-2")
# Connect to the DynamoDB Table. Make sure this matches the table name on AWS.
table = dynamodb.Table("Messages")


def get_all_messages_for_chat(chat_id):
    """
    Retrieve chat messages from DynamoDB.
    """
    response = table.query(
        KeyConditionExpression=boto3.dynamodb.conditions.Key("chat_id").eq(chat_id)
    )
    return response["Items"]


messages = [
    {
        "role": "system",
        "content": "yo",
    },
    # we need to add the old messages here
    # then the new messages
]

# mock conversaiton history from dynamdodb
old_messages = get_all_messages_for_chat("o8045x2mfcapik2b6ebzu")


for old_message in old_messages:
    # print(old_message)
    # print(f"old_message: {old_message['content']} {old_message['role']}")

    # we dont need the full response, just the role and content, for OpenAI
    messages.append({"role": old_message["role"], "content": old_message["content"]})

# added the latest user message
messages.append({"role": "user", "content": "This is the latest message"})


# verify that we added the new messages.
print(messages)
