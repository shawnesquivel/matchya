# Setting API Keys for Windows

Last Updated: April 5, 2024 1:05 PM

**Link to Troubleshooting Channel:** [https://discord.com/channels/1109163589375373472/1110318485470466078/1114639359476502641](https://discord.com/channels/1109163589375373472/1110318485470466078/1114639359476502641)

- Error Message
    
    (base) ➜  yt-script-generator git:(main) ✗ export OPENAI_API_KEY=sk-uOMT2kBe
    
    What's a workaround for this if I get the error:
    
    "The term export is not recognized as the name of a cmdlet function script file or operable program. Check the spelling of the name or if a path was included. Verify that the path is correct and try again
    
    - export OPENAI_API_KEY=sk
- Fix: `export` only works for MacOS/Linux, for Windows, use these commands:
    
    **For Mac:**
    
    ```tsx
    export OPENAI_API_KEY = sk-12345
    ```
    
    **For command shell (WINDOWS)**
    
    ```
    set OPENAI_API_KEY=sk-12345
    ```
    
    **For Powershell (WINDOWS):**
    
    ```
    $env:OPENAI_API_KEY="sk-12345"
    ```