from chalice import Chalice, CORSConfig, Response
from chalice import BadRequestError
import logging

app = Chalice(app_name="kitsune-backend")

cors_config = CORSConfig(
    # allow_origin="http://localhost:3000",
    # wildcard: testing only
    allow_origin="*",
    allow_headers=["X-Special-Header"],
    max_age=600,
    allow_credentials=True,
)


@app.route("/", cors=cors_config)
def index():
    """
    Verify the server status by going to http://127.0.0.1:8000/

    Documentation: https://aws.github.io/chalice/quickstart.html
    """
    return {"Welcome": "to the future!"}


@app.route("/hello/{name}")
def hello_name(name):
    """
    Receives the value after the /hello/{VALUE} does something to it.

    Examples
    --------
    http://127.0.0.1:8000/hello/elon

    http://127.0.0.1:8000/hello/sam
    """
    # '/hello/james' -> {"hello": "james"}

    return {"message": f"Welcome to the course, {name.upper()}!"}


"""
Write more endpoints here...

- add functions in chalicelib file 
- grab the user's request from app.current_request.json_body
- return Response(body={},status_code=200)

Test with `chalice local`
Deploy with `chalice deploy`

"""
