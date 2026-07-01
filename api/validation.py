from fastapi import HTTPException


def validate_allowed_value(field_name: str, value, allowed_values: dict):
    valid_values = allowed_values.get(field_name, [])

    if value not in valid_values:
        raise HTTPException(
            status_code=422,
            detail={
                "error": "Invalid input value",
                "field": field_name,
                "received": value,
                "allowed_values": valid_values[:50],
                "message": "The received value was not found in the training dataset allowed values.",
            },
        )

    return value
