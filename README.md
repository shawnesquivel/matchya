Here's a beginner-friendly README for your project that includes all the necessary steps to get started with both the frontend and backend:

# Project Organization

Welcome to our project! Below you'll find step-by-step instructions to set up and run the frontend and backend components.

## Frontend Setup

Our frontend is built with NextJS, a powerful framework for building web applications. To get started:

1. Open your terminal.
2. Change directory to the frontend folder:
   ```
   cd app
   ```
3. Install all the necessary dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```
5. Open your web browser and go to [http://localhost:3000](http://localhost:3000) to see the application running.

To provide a command for users to test their AWS CLI configuration and link the AWS setup credentials section if they encounter an error, you can modify the README as follows:

## Backend Setup

Our backend is a Chalice project, which is a framework for writing serverless apps in Python. Follow these steps to set it up:

1. **Test AWS CLI Configuration**:
   - Open your terminal and run:
     ```
     aws configure list
     ```
   - If you see an error or if your credentials are not displayed correctly, refer to the [Setup AWS Credentials](#setup-aws-credentials) section below.
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Create a new virtual environment named `env`:
   ```
   python -m venv env
   ```
4. Activate the virtual environment:
   ```
   source env/bin/activate  # On Unix/macOS
   env\Scripts\activate  # On Windows
   ```
5. Install all the required dependencies:
   ```
   pip install -r requirements.txt
   ```
6. To run the backend locally:
   ```
   chalice local
   ```
7. Go to the link provided, usually, http://127.0.0.1:8000/

   You should see this response:

   ```
   {"hello": "world"}
   ```

## Setup AWS Credentials

To set up your AWS credentials for deploying the backend:

1. Follow the guide here: [Chalice Quickstart Credentials](https://aws.github.io/chalice/quickstart.html#credentials)
2. If you do not have an AWS account, create one here: [AWS Management Console](https://aws.amazon.com/marketplace/management/signin)
3. Set up your AWS credentials:
   - Open your terminal.
   - Run the following commands to create the AWS credentials file:
     ```
     mkdir ~/.aws
     cat >> ~/.aws/config
     ```
   - Input the following details:
     ```
     [default]
     aws_access_key_id=YOUR_ACCESS_KEY_HERE
     aws_secret_access_key=YOUR_SECRET_ACCESS_KEY
     region=YOUR_REGION (such as us-west-2, us-west-1, etc)
     ```
4. Verify that AWS CLI is configured correctly by running `aws configure list`.

This README is structured to guide even beginners through the setup and deployment process. Good luck with your project!

## Deploy Backend

Before deploying, ensure you have set up an AWS account and configured your credentials as described below.

## URLs

Local Host

```
http://127.0.0.1:8000/
```

Tutorial

```
https://jk88xtfj1j.execute-api.us-west-2.amazonaws.com/api
```

Production (Example)

```
https://dm9k979b9h.execute-api.us-west-2.amazonaws.com/api
```

const getBackendBaseUrl = (mode) => {
/\*_ Switches the endpoint for various routes. No leading slash. _/
let endpoint;
if (mode === "local") {
endpoint = "http://127.0.0.1:8000";
} else if (mode === "tutorial") {
endpoint = "";
} else if (mode === "production") {
endpoint = "";
} else {
console.log("could not find endpoint, using local");
endpoint = "http://127.0.0.1:8000";
}

if (debug) {
console.log({ endpoint });
}

return endpoint;

};
