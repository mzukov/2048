# base image
FROM python:3.10-slim-buster
# set working directory
WORKDIR /backend
# copy requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# copy application code
COPY . .
# expose port
EXPOSE 8000
# run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]