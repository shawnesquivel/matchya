import boto3

"""
OVERVIEW
--------
- This Python script uses the boto3 library to interact with AWS DynamoDB. 
- It includes a function to create a DynamoDB table specifically designed to store chat messages, using "chat_id" as the primary key and "timestamp" as the sort key. 
- The script also demonstrates how to initiate table creation with this function.

PRE-REQUISITES:
---------------
1. Your AWS account is set up.
2. `boto3` is installed in your Virtual Environment: `pip install boto3`
3. Permissions: Ensure the IAM user has DynamoDBFullAccess or a custom IAM policy 
   that allows dynamodb:CreateTable actions.
4. Change the `region_name` parameter to match your AWS region (e.g., us-east-1, us-west-2, etc.).
"""

# Initialize a DynamoDB client with boto3
# This allows us to interact with the DynamoDB service
dynamodb = boto3.resource("dynamodb", region_name="us-west-2")


# Function to create a DynamoDB table for storing chat messages
def create_chat_table(table_name):
    # Create a new DynamoDB table with the provided name and schema
    table = dynamodb.create_table(
        TableName=table_name,
        KeySchema=[
            {
                # Defines the primary key, also known as the partition key
                # Each item in the table must have a unique ChatID
                "AttributeName": "chat_id",
                "KeyType": "HASH",  # Partition key is represented by 'HASH'
            },
            {
                # Defines the sort key
                # Items with the same ChatID can be sorted or queried by timestamp
                "AttributeName": "timestamp",
                "KeyType": "RANGE",  # Sort key is represented by 'RANGE'
            },
        ],
        AttributeDefinitions=[
            {
                # The data type of ChatID is specified as a string (S)
                "AttributeName": "chat_id",
                "AttributeType": "S",
            },
            {
                # The data type of timestamp is specified as a number (N)
                "AttributeName": "timestamp",
                "AttributeType": "N",
            },
        ],
        ProvisionedThroughput={
            # Specifies the read and write capacity units
            # This affects billing and how many operations per second your table can handle
            "ReadCapacityUnits": 5,
            "WriteCapacityUnits": 5,
        },
    )

    # DynamoDB table creation is asynchronous
    # Wait until the table exists before proceeding, ensuring the table was created successfully
    table.meta.client.get_waiter("table_exists").wait(TableName=table_name)

    print(f"Table {table_name} created successfully.")
    return table


# Example usage of the create_chat_table function
# Note: DynamoDB table creation can take 15-30 seconds
# Replace "ChatMessages" with your desired table name
"""
Note: You only need to run this once! Takes 30-60 sec.

From your server directory, run:
python3 chalicelib/create_table.py

"""
chat_table = create_chat_table("Messages")
