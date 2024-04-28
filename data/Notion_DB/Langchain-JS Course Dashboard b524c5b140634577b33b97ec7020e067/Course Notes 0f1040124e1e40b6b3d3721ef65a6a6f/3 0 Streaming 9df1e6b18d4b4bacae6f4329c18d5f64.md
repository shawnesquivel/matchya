# 3.0 Streaming:

Module: Module 3
Type: Dashboard
Last Updated: April 5, 2024 1:05 PM

### Overview

In this code, you are using Server-Sent Events (SSE), a technology that allows a server to send updates to a web page over HTTP. It's commonly used for real-time applications like live updates or chatbots.

Here is how it works in this code:

**Frontend:**

1. On submission of the form (when **`handleSubmit`** is called), a **`POST`** request is made to the **`/api/streaming`** endpoint with the user's input (**`prompt`**) as the payload.
2. Then, an **`EventSource`** is initialized on the same **`/api/streaming`** endpoint. **`EventSource`** is a built-in web API for receiving server-sent events. It keeps an open connection to the server, allowing the server to push updates to the client.
3. Two event listeners are attached to the **`EventSource`**: **`newToken`** and **`end`**. The **`newToken`** event is triggered every time a new token (part of the chatbot's response) is received from the server. The **`end`** event is triggered when the chatbot finishes generating the response.
4. When a **`newToken`** event is received, the event's data (the token) is processed and added to the existing response data.
5. When the **`end`** event is received, the connection to the server is closed.

**Backend:**

1. The **`POST`** request triggers the OpenAI **`call`** method. It starts the process of generating a response based on the input received. The OpenAI instance is configured to stream the response and to send each new token to the client as soon as it's generated. This is done via the **`handleLLMNewToken`** callback, which sends a **`newToken`** event to the client with the new token as the data.
2. Once the OpenAI **`call`** method finishes generating the response, it sends an **`end`** event to the client, signaling that the response is complete.
3. The **`GET`** request initializes the **`EventSource`** on the server side with the **`sse.init(req, res)`** command. This is essential for the server to start sending events to the client.

So, in essence, the chatbot response is streamed to the client by sending each part of the response (token) as a separate server-sent event as soon as it's generated. The client then assembles these parts into a complete response.