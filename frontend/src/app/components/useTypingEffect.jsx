import { useState, useEffect, useRef } from "react";

const useTypingEffect = (text, isTyping, speed = 30) => {
  const [displayedText, setDisplayedText] = useState("");
  const indexRef = useRef(0);
  const wordsRef = useRef(text.split(" "));

  useEffect(() => {
    if (!isTyping) {
      setDisplayedText(text);
      return;
    }

    setDisplayedText("");
    indexRef.current = 0;
    wordsRef.current = text.split(" ");

    const intervalId = setInterval(() => {
      if (indexRef.current < wordsRef.current.length) {
        setDisplayedText((prev) => {
          const newText =
            prev + (prev ? " " : "") + wordsRef.current[indexRef.current];
          indexRef.current++;
          return newText;
        });
      } else {
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, isTyping, speed]);

  return displayedText;
};

export default useTypingEffect;
