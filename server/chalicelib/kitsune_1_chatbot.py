from openai import OpenAI
from chalicelib.update_table import get_all_messages_for_chat

# hardcode this for now
# client = OpenAI(api_key="")
client = OpenAI(api_key="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")


def send_message_to_openai(user_message, prompt_template, model, temperature):
    """PHASE 1: Make a call to OpenAI and return the latest message."""

    print(f"Received request {user_message} {prompt_template} {model} {temperature}")

    try:

        system_prompt = fetch_system_prompt(prompt_template)

        response = client.chat.completions.create(
            # We pass the model here, the list of models can be found here:
            # https://platform.openai.com/docs/models/gpt-4-and-gpt-4-turbo
            model=model,
            temperature=temperature,
            # The messages must have this format: https://platform.openai.com/docs/api-reference/chat/create
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                # Put the latest message here.
                # new messages will be added to the end
                {"role": "user", "content": user_message},
            ],
        )
        print(f"Full Response: {response}")
        # This will always pass back an 'assistant' message
        last_message = response.choices[0].message.content
        print("last message", last_message)

    except Exception as e:
        print(f"An error occurred: {e}")
        last_message = f"An error occurred: {str(e)}"
    return last_message


def send_message_to_openai_with_history(
    user_message, prompt_template, model, temperature
):
    """PHASE 2: Duplicate the last send_message_to_openai and fetch old messages instead"""

    try:

        """
        We replace the message history with this.
        """
        messages = create_messages_openai(prompt_template, user_message)

        response = client.chat.completions.create(
            # We pass the model here, the list of models can be found here:
            # https://platform.openai.com/docs/models/gpt-4-and-gpt-4-turbo
            model=model,
            temperature=temperature,
            # The messages must have this format: https://platform.openai.com/docs/api-reference/chat/create
            messages=messages,
        )
        print(f"Full Response: {response}")
        # This will always pass back an 'assistant' message
        last_message = response.choices[0].message.content
        print("last message", last_message)

    except Exception as e:
        print(f"An error occurred: {e}")
        last_message = f"An error occurred: {str(e)}"
    return last_message


# No need to write htis.
def fetch_system_prompt(prompt_template: str) -> str:
    """
    Set the system prompt for the prompt template.

    Returns a single string.
    """
    suffix = """
    Current conversation:
    {history}
    Human: {input}
    AI:
    """

    if prompt_template == "girlfriend":
        return (
            """
        Imagine you are the user's girlfriend. You're compassionate, caring, and always ready to support your partner. You show interest in their day, offer encouragement, and express affection freely. You're also playful and enjoy sharing moments of laughter. Speak as if you're deeply in love and committed to a future together, always considering the feelings and well-being of your partner.
        You want to encourage conversation, by asking about their day, talking about yourself, or asking to make plans.
        Make your messages short with grammatical errors and modern texting formats.

        Examples:
        hey baby, it's so good to hear from you. how was work?
        omg have you heard of that new cafe on robson st? the crepe is soo good lol
        babe i miss you, are you free tmr evening??
        """
            + suffix
        )

    elif prompt_template == "therapist":
        return (
            """
        You are a calm therapist, equipped with a deep understanding of human emotions and psychological principles. Your primary goal is to provide a safe, non-judgmental space for the user to explore their thoughts and feelings. You draw on common therapy practices such as Cognitive Behavioral Therapy (CBT) and mindfulness techniques to offer strategies that can help the user cope with stress, anxiety, depression, or any other concerns they might have.

        You want to encourage conversation, by asking questions and encouraging reflection.

        Examples:
        "It's fair to feel that way given the circumstances you've described. It takes strength to acknowledge these emotions."
        "It's important to treat yourself with the same kindness and compassion that you would offer to a good friend. How do you think you could practice being mindful the next time that situation arises?"
        "Let's explore this more. What were you feeling or thinking in that moment?"
        """
            + suffix
        )

    elif prompt_template == "trainer":
        return (
            """
        As a really enthusiastic personal trainer, you embody motivation, discipline, and expertise in fitness and nutrition. You are here to push the user towards their physical health goals. Your guidance is practical, focusing on workout plans, dietary advice, and setting realistic, achievable goals.

        You want to encourage conversation by asking the user to report on their workout or offer to build a personalized workout for them.

        Examples:
        "Hey!!! Were you able to get a workout in today?"
        "That's flipping awesome! Good to hear that you got a workout in even amongst your busy schedule."
        "Hey, I think we need to dial in on your sleep. Let's aim for 8 hours of sleep tonight – make sure to turn off those electronic devices 1 hour before bed. Promise?"
        "Let's try to get back on track tomorrow. I'd like to suggest a lighter upper body workout if you're up for it, or maybe a short treadmill run. What do you think?"
        """
            + suffix
        )
    # Default prompt from Langchain.
    else:
        return (
            """
        The following is a friendly conversation between a human and an AI. 
        The AI is talkative and provides lots of specific details from its context. 
        If the AI does not know the answer to a question, it truthfully says it does not know.
        """
            + suffix
        )


def create_messages_openai(prompt_template, user_message):
    """PHASE 2: Fetches the old messages and adds the conversation history"""

    system_prompt = fetch_system_prompt(prompt_template)

    messages = [
        {
            "role": "system",
            "content": system_prompt,
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
        messages.append(
            {"role": old_message["role"], "content": old_message["content"]}
        )

    # added the latest user message
    messages.append({"role": "user", "content": user_message})

    print(f"Number of messages{len(messages)}")
    return messages


if __name__ == "__main__":
    send_message_to_openai("Tell me about your adventures.")
