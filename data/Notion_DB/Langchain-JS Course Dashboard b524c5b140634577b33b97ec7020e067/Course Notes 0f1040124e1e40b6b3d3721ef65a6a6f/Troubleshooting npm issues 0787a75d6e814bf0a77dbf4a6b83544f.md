# Troubleshooting npm issues

Last Updated: April 5, 2024 1:05 PM

- **Error: `node-gyp error` or most `npm install` errors on Windows**
    - Reason - we need node-gyp installed to run hnswlib-node
        - E.g. if you remove hnswlib-node from the `package.json` it will run just fine
    - `node-gyp` allows you to run add-on modules that are written in C/C++,
        - C++ is faster than JavaScript which is important for algorithms
    
    ![Untitled](Troubleshooting%20npm%20issues%200787a75d6e814bf0a77dbf4a6b83544f/Untitled.png)
    
- **FIX: Add C++ Packages**
    - Simple Fix (Windows Only)
        - Open Powershell in adminstrator
        
        ```markdown
        npm install windows-build-tools
        ```
        
        - Close your VS Code and restart the terminal
        - Delete `node_modules` and `package-lock.json` and try running this again:
        
        ```markdown
        npm install
        ```
        
        ```markdown
        npm run dev
        ```
        
    - **If above doesn’t work, download C++ packages**
        - If that doesn’t work, then we may need ALL the  C++ packages from Microsoft Visual Studio Community 2022
            - [https://learn.microsoft.com/en-us/cpp/build/vscpp-step-0-installation?view=msvc-170](https://learn.microsoft.com/en-us/cpp/build/vscpp-step-0-installation?view=msvc-170)
            - Close your VS Code and restart the terminal
            - Delete `node_modules` and `package-lock.json` and try running this again:
            
            ```markdown
            npm install
            ```
            
            ```markdown
            npm run dev
            ```
            

### Troubleshooting that worked for @mute8 (student)

[https://discord.com/channels/1109163589375373472/1110318485470466078/1125730767192985620](https://discord.com/channels/1109163589375373472/1110318485470466078/1125730767192985620)

Further I rebooted my computer and reinstalled everything.

- FIRST, Reinstall Visual studio 2022, make sure to include the C++ for desktop development (this box needs to be manually ticket)
    1. Install Visual Studio C/C++ from microsoft free version
    2. [https://code.visualstudio.com/docs/cpp/config-msvc](https://code.visualstudio.com/docs/cpp/config-msvc)
- Delete the node modules and the package lock.
    
    ![Untitled](Troubleshooting%20npm%20issues%200787a75d6e814bf0a77dbf4a6b83544f/Untitled%201.png)
    
    ![Untitled](Troubleshooting%20npm%20issues%200787a75d6e814bf0a77dbf4a6b83544f/Untitled%202.png)
    
- Restart your computer
- Make sure virus program is turned into a mode not blocking the traffic
    1. [https://support.microsoft.com/en-us/windows/add-an-exclusion-to-windows-security-811816c0-4dfd-af4a-47e4-c301afe13b26](https://support.microsoft.com/en-us/windows/add-an-exclusion-to-windows-security-811816c0-4dfd-af4a-47e4-c301afe13b26)
- In VS Code, you need to re-install packages
    
    ```jsx
    npm install -S HNSWLib-node
    ```
    
    ```jsx
    npm install
    ```
    

### Sources

- [https://stackoverflow.com/questions/60419160/why-i-can-not-run-npm-run-dev](https://stackoverflow.com/questions/60419160/why-i-can-not-run-npm-run-dev)
- [https://www.google.com/search?q=node-gyp+error&oq=node-gyp+error&aqs=chrome..69i57j69i61.1427j0j1&sourceid=chrome&ie=UTF-8](https://www.google.com/search?q=node-gyp+error&oq=node-gyp+error&aqs=chrome..69i57j69i61.1427j0j1&sourceid=chrome&ie=UTF-8)