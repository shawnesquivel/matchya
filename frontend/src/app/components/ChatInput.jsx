const ChatInput = ({
  prompt,
  handlePromptChange,
  handleSubmit,
  placeHolderText,
  buttonText,
  error,
  disableButton,
  labelText,
}) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };
  return (
    <>
      <div className="flex items-center mt-2">
        {labelText && (
          <label htmlFor="" className="mr-4">
            {labelText}
          </label>
        )}

        <input
          type="text"
          value={prompt}
          onChange={handlePromptChange}
          onKeyDown={handleKeyDown}
          placeholder={placeHolderText || "Enter your prompt"}
          className="w-full mr-1 py-3 px-4 bg-white-light text-mblack placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-light rounded-full border border-grey-dark"
        />

        {!disableButton && (
          <button
            onClick={handleSubmit}
            className={`h-full aspect-square bg-purple text-gray-900 font-semibold rounded-full transition-colors duration-200 flex items-center justify-center`}
          >
            <svg
              width="8"
              height="18"
              viewBox="0 0 8 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.35355 0.646447C4.15829 0.451184 3.84171 0.451184 3.64645 0.646447L0.464467 3.82843C0.269205 4.02369 0.269205 4.34027 0.464467 4.53553C0.659729 4.7308 0.976311 4.7308 1.17157 4.53553L4 1.70711L6.82843 4.53553C7.02369 4.7308 7.34027 4.7308 7.53553 4.53553C7.7308 4.34027 7.7308 4.02369 7.53553 3.82843L4.35355 0.646447ZM4.5 17.125L4.5 1L3.5 1L3.5 17.125L4.5 17.125Z"
                fill="#2A1410"
              />
            </svg>
          </button>
        )}
      </div>
      <p className={`text-red-500 ${error ? "block" : "hidden"}`}>{error}</p>
    </>
  );
};

export default ChatInput;
