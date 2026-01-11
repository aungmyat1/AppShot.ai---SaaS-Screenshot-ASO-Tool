from fastapi import HTTPException


class AppError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def http_error(status_code: int, message: str) -> HTTPException:
    return HTTPException(status_code=status_code, detail=message)

