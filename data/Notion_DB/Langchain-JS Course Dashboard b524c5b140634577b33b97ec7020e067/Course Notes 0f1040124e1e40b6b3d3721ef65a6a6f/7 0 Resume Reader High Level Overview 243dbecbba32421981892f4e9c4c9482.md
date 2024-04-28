# 7.0 Resume Reader: High Level Overview

Module: Module 7
Type: Dashboard
Last Updated: April 5, 2024 1:05 PM

## High Level Overview

1. **Document Loading**: We begin by loading our documents (in this case, resumes) from a specified directory using DirectoryLoader and PDFLoader. These loaded resumes are then split into smaller chunks using a CharacterTextSplitter, making them easier to handle and query later.
2. **Document Summarization**: Each document is summarized using the OpenAI model. This step simplifies the information, providing us with a concise representation of each resume.
3. **Vector Embedding and Storage**: The resumes are then transformed into vector representations using the OpenAIEmbeddings. These vectors are stored in a Pinecone vector store, a type of database designed for vectorized data. It's like a library, but for vectors.
4. **Querying**: Now that our vector library is set up, we can ask questions! Queries are handled by using a preconfigured agent, created by the createVectorStoreAgent method. This agent interacts with the vector store to retrieve relevant information based on the input prompt.

## Troubleshooting Help

- SSL Error when trying to use youtube transcripts
    - error message
        
        ```tsx
        Traceback (most recent call last):
          File "/Users/shawnesquivel/GitHub/langchain/agents/agent_youtube_video.py", line 75, in <module>
            extract_youtube_transcript(youtube_url)
          File "/Users/shawnesquivel/GitHub/langchain/agents/agent_youtube_video.py", line 26, in extract_youtube_transcript
            summary = loader.load()
                      ^^^^^^^^^^^^^
          File "/Library/Frameworks/Python.framework/Versions/3.11/lib/python3.11/site-packages/langchain/document_loaders/youtube.py", line 141, in load
            video_info = self._get_video_info()
                         ^^^^^^^^^^^^^^^^^^^^^^
          File "/Library/Frameworks/Python.framework/Versions/3.11/lib/python3.11/site-packages/langchain/document_loaders/youtube.py", line 182, in _get_video_info
            "title": yt.title,
                     ^^^^^^^^
          File "/Library/Frameworks/Python.framework/Versions/3.11/lib/python3.11/site-packages/pytube/__main__.py", line 341, in title
            self._title = self.vid_info['videoDetails']['title']
                          ^^^^^^^^^^^^^
          File "/Library/Frameworks/Python.framework/Versions/3.11/lib/python3.11/site-packages/pytube/__main__.py", line 246, in vid_info
            innertube_response = innertube.player(self.video_id)
                                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
          File "/Library/Frameworks/Python.framework/Versions/3.11/lib/python3.11/site-packages/pytube/innertube.py", line 300, in player
            return self._call_api(endpoint, query, self.base_data)
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
          File "/Library/Frameworks/Python.framework/Versions/3.11/lib/python3.11/site-packages/pytube/innertube.py", line 242, in _call_api
            response = request._execute_request(
                       ^^^^^^^^^^^^^^^^^^^^^^^^^
          File "/Library/Frameworks/Python.framework/Versions/3.11/lib/python3.11/site-packages/pytube/request.py", line 37, in _execute_request
            return urlopen(request, timeout=timeout)  # nosec
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
          File "/Library/Frameworks/Python.framework/Versions/3.11/lib/python3.11/urllib/request.py", line 216, in urlopen
            return opener.open(url, data, timeout)
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
          File "/Library/Frameworks/Python.framework/Versions/3.11/lib/python3.11/urllib/request.py", line 519, in open
            response = self._open(req, data)
                       ^^^^^^^^^^^^^^^^^^^^^
          File "/Library/Frameworks/Python.framework/Versions/3.11/lib/python3.11/urllib/request.py", line 536, in _open
            result = self._call_chain(self.handle_open, protocol, protocol +
                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
          File "/Library/Frameworks/Python.framework/Versions/3.11/lib/python3.11/urllib/request.py", line 496, in _call_chain
            result = func(*args)
                     ^^^^^^^^^^^
          File "/Library/Frameworks/Python.framework/Versions/3.11/lib/python3.11/urllib/request.py", line 1391, in https_open
            return self.do_open(http.client.HTTPSConnection, req,
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
          File "/Library/Frameworks/Python.framework/Versions/3.11/lib/python3.11/urllib/request.py", line 1351, in do_open
            raise URLError(err)
        urllib.error.URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate (_ssl.c:992)>
        ```
        
        ![Untitled](7%200%20Resume%20Reader%20High%20Level%20Overview%20243dbecbba32421981892f4e9c4c9482/Untitled.png)
        
    - Rsource to Fix: [https://stackoverflow.com/questions/68275857/urllib-error-urlerror-urlopen-error-ssl-certificate-verify-failed-certifica](https://stackoverflow.com/questions/68275857/urllib-error-urlerror-urlopen-error-ssl-certificate-verify-failed-certifica)
        
        ![Untitled](7%200%20Resume%20Reader%20High%20Level%20Overview%20243dbecbba32421981892f4e9c4c9482/Untitled%201.png)
        
        ![Untitled](7%200%20Resume%20Reader%20High%20Level%20Overview%20243dbecbba32421981892f4e9c4c9482/Untitled%202.png)
        
    - Why is this happening?
        - The SSL certificate neds to be updated