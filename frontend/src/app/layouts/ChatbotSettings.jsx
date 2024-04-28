import React from "react";

const ChatbotSettings = ({
  promptTemplate,
  setPromptTemplate,
  model,
  setModel,
  temperature,
  setTemperature,
}) => {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-white shadow rounded-lg">
        <label
          htmlFor="prompt-template"
          className="block text-lg  text-gray-800 mb-3"
        >
          Choose Your Character
        </label>
        <select
          id="prompt-template"
          className="w-full p-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          value={promptTemplate}
          onChange={(e) => {
            console.log(e.target.value);
            setPromptTemplate(e.target.value);
          }}
        >
          <option value="girlfriend">🙋‍♀️ Girlfriend</option>
          <option value="trainer">🏋️ Trainer</option>
          <option value="therapist">🧑‍💼 Therapist</option>
        </select>
      </div>

      <div className="p-4 bg-white shadow rounded-lg">
        <label
          htmlFor="model"
          className="text-lg text-gray-800 mb-3 flex items-center gap-2"
        >
          Model
        </label>
        <select
          id="model"
          className="w-full p-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          value={model}
          onChange={(e) => {
            console.log(e.target.value);
            setModel(e.target.value);
          }}
        >
          <option value="gpt-3.5-turbo">⚡️ GPT-3.5-Turbo</option>
          <option value="gpt-4">🧠 GPT-4</option>
        </select>
      </div>

      <div className="p-4 bg-white shadow rounded-lg">
        <label
          htmlFor="temperature"
          className="text-lg text-gray-800 mb-3 flex items-center gap-2"
        >
          Temperature:
          <span className="text-base font-normal underline underline-offset-2">
            {temperature}
          </span>{" "}
        </label>
        <input
          id="temperature"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" // Basic styling for the slider track
        />
      </div>
    </div>
  );
};

export default ChatbotSettings;
