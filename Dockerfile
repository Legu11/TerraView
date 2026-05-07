FROM python:3.12-slim

WORKDIR /app

COPY database/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY database/ ./database/
COPY data/ ./data/

ENV PYTHONUNBUFFERED=1
ENV API_HOST=0.0.0.0
ENV API_PORT=5000

EXPOSE 5000

CMD ["python", "database/api.py"]
