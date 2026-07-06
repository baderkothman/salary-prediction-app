# We import HTTPException so we can return a clear API error.
from fastapi import HTTPException


# This function checks if one input value is allowed.
def validate_allowed_value(field_name: str, value, allowed_values: dict):
    # Get the list of allowed values for this field.
    # If the field does not exist, use an empty list.
    valid_values = allowed_values.get(field_name, [])

    # Check if the user value is not inside the allowed values list.
    if value not in valid_values:
        # Stop the request and return a 422 validation error.
        raise HTTPException(
            status_code=422,  # 422 means the input format is valid, but the value is not accepted.
            detail={
                "error": "Invalid input value",                                  # Short error name.
                "field": field_name,                                             # The field that has the wrong value.
                "received": value,                                               # The value the user sent.
                "allowed_values": valid_values[:50],                             # Show the first 50 allowed values only.
                "message": "The received value was not found in the training dataset allowed values.",
            },
        )

    # If the value is valid, return it.
    return value
