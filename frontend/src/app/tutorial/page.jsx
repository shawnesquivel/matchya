"use client";
import React, { useState, useEffect } from "react";
import Button from "../components/Button";
const CHAT_LOCAL = "http://127.0.0.1:8000/tutorial";
const TEST_ENDPOINT =
  "https://jk88xtfj1j.execute-api.us-west-2.amazonaws.com/api/";
const CHAT_ENDPOINT =
  "https://jk88xtfj1j.execute-api.us-west-2.amazonaws.com/api/tutorial";

const ChatGPT = () => {
  const [userInput, setUserInput] = useState("who made langchain"); // Tracks the user's input
  const [response, setResponse] = useState(null); // Stores the chatbot's response
  const [isLoading, setIsLoading] = useState(false); // Tracks loading state

  useEffect(() => {
    // on page load, do something
    testEndpoint();
  }, []);

  const testEndpoint = async () => {
    try {
      // This is a test endpoint!
      const response = await fetch(
        "https://jk88xtfj1j.execute-api.us-west-2.amazonaws.com/api/chat",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const resJson = await response.json();
      console.log({ resJson });
    } catch (err) {
      console.error(err);
    }
  };

  // Function to handle the change in the input field
  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

  // Function to send the user's message to the chatbot and fetch the response
  const sendMessage = async () => {
    setIsLoading(true);
    try {
      const body = JSON.stringify({
        message: userInput,
      });

      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      const data = await response.json();

      console.log({ data });
      setResponse(data); // Assuming the API response is in a format that can be directly set
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching the response:", error);
      setIsLoading(false);
    }
  };

  // Function to handle the submit action
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent the default form submit behavior
    sendMessage();
  };
  return (
    <div className="max-w-md mx-auto my-10 p-5 border border-gray-200 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">ChatGPT</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="px-4 py-2 mb-4 border border-gray-300 rounded-lg w-full"
        />
        <div className="flex gap-4">
          <Button text="Send 1" onClick={handleSubmit} />
          <Button text="Send 2" onClick={handleSubmit} />
          <Button text="Send 3" onClick={handleSubmit} />
          <Button text="Send 4" onClick={handleSubmit} />
        </div>
      </form>
      {isLoading ? (
        <p className="text-gray-500">Sending message...</p>
      ) : (
        response && (
          <>
            <p className="text-gray-700 font-semibold">ChatGPT:</p>
            <pre className="bg-gray-100 rounded p-3 text-wrap">
              {JSON.stringify(response, null, 2)}
            </pre>
          </>
        )
      )}
      {/* && operator */}
      {true && <p>hello</p>}
      {false && <p>hello</p>}

      {/* ternary operator */}
      <p>
        what value will print?
        {true ? "hello" : "world"}
      </p>
    </div>
  );
};

export default ChatGPT;
