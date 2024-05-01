import time
from datetime import datetime


def current_epoch_time():
    """Return current time in UNIX/epoch seconds."""
    return int(time.time())


def iso_to_epoch(timestamp):
    """
    Convert a timestamp to UNIX/epoch time. Adjusted to handle integers.
    """
    # If the timestamp is already an integer, no conversion is needed
    if isinstance(timestamp, int):
        return timestamp
    # If the timestamp is a string, convert it as originally intended
    elif isinstance(timestamp, str):
        dt = datetime.strptime(timestamp, "%Y-%m-%dT%H:%M:%SZ")
        return int(dt.timestamp())
