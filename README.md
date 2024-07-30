# Project Organization

Machya

## Table of Contents

1. [Frontend Setup](#frontend-setup)
2. [Backend Setup](#backend-setup)
3. [AWS Credentials Configuration](#aws-credentials-configuration)
4. [Backend Deployment](#backend-deployment)
5. [Important URLs](#important-urls)

## Frontend Setup

Our frontend is built with NextJS, a powerful and efficient framework for building modern web applications.

### Prerequisites

- Node.js (latest LTS version recommended)
- npm (comes with Node.js)

### Steps

1. Open your terminal.
2. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your web browser and visit [http://localhost:3000](http://localhost:3000) to view the application.

## Backend Setup

Our backend is developed using Chalice, a framework for creating serverless applications in Python.

### Prerequisites

- Python 3.7 or higher
- pip (Python package installer)
- AWS CLI (configured with valid credentials)

### Steps

1. Verify AWS CLI configuration:

   ```bash
   aws configure list
   ```

   If you encounter any issues, refer to the [AWS Credentials Configuration](#aws-credentials-configuration) section.

2. Navigate to the backend directory:

   ```bash
   cd server
   ```

3. Create a virtual environment:

   ```bash
   python -m venv env
   ```

   or

   ```bash
   python3 -m venv env
   ```

4. Activate the virtual environment:

   - On Unix/macOS:
     ```bash
     source env/bin/activate
     ```
   - On Windows:
     ```bash
     env\Scripts\activate
     ```

5. Install required dependencies:

   ```bash
   pip install -r requirements.txt
   ```

6. Run the backend locally:

   ```bash
   chalice local
   ```

7. Visit the provided link (usually http://127.0.0.1:8000/) in your browser. You should see:
   ```json
   { "hello": "world" }
   ```

## AWS Credentials Configuration

To deploy the backend, you need properly configured AWS credentials.

1. Follow the [Chalice Quickstart Credentials](https://aws.github.io/chalice/quickstart.html#credentials) guide.

2. If you don't have an AWS account, create one at [AWS Management Console](https://aws.amazon.com/marketplace/management/signin).

3. Set up your AWS credentials:

   ```bash
   mkdir ~/.aws
   cat >> ~/.aws/config
   ```

   Enter the following, replacing the placeholders with your actual credentials:

   ```
   [default]
   aws_access_key_id=YOUR_ACCESS_KEY_HERE
   aws_secret_access_key=YOUR_SECRET_ACCESS_KEY
   region=YOUR_REGION (e.g., us-west-2, us-west-1)
   ```

4. Verify the configuration:
   ```bash
   aws configure list
   ```

## Backend Deployment

Ensure you have set up an AWS account and configured your credentials before attempting to deploy the backend. The deployment process will be specific to your project and should be detailed here.

## Important URLs

- **Local Development**

  ```
  http://127.0.0.1:8000/
  ```

- **Tutorial API**

  ```
  https://jk88xtfj1j.execute-api.us-west-2.amazonaws.com/api
  ```

- **Production API** (Example)
  ```
  https://dm9k979b9h.execute-api.us-west-2.amazonaws.com/api
  ```

---

For any issues or additional information, please refer to the project documentation or contact the development team.
