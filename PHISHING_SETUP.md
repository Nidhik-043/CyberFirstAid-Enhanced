# CyberFirstAid — Phishing Detection Setup

## 1. Detection Architecture

The phishing detection module uses four detection layers:

- Rule-Based URL Security Analysis
- OpenPhish Threat Intelligence
- Random Forest Machine Learning
- Tranco Domain Reputation

## 2. Install Backend Dependencies

From the project root, execute the following PowerShell commands:

    cd backend
    python -m venv venv
    .\venv\Scripts\python.exe -m pip install -r requirements.txt
    cd ..

## 3. Download Threat Intelligence Data

    New-Item -ItemType Directory -Force -Path ai_module/data

    Invoke-WebRequest -Uri "https://openphish.com/feed.txt" -OutFile "ai_module/data/phishing_urls.txt"

## 4. Download Tranco Domain Reputation Data

    New-Item -ItemType Directory -Force -Path ai_module/data/tranco

    Invoke-WebRequest -Uri "https://tranco-list.eu/top-1m.csv.zip" -OutFile "ai_module/data/tranco/tranco.zip"

    Expand-Archive -Path "ai_module/data/tranco/tranco.zip" -DestinationPath "ai_module/data/tranco" -Force

## 5. Machine Learning Model

The operational model is included in the repository:

    ai_module/models/phishing_model.joblib

No additional model training is required.

## 6. Start the Backend

    cd backend
    .\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000

API documentation:
http://127.0.0.1:8000/docs

## 7. Start the Frontend

Open a separate terminal from the project root:

    cd frontend
    npm ci
    npm run dev

Phishing scanner:
http://localhost:3000/phishing

## 8. Testing

From the project root:

    .\backend\venv\Scripts\python.exe -m ai_module.test_production

    .\backend\venv\Scripts\python.exe -m ai_module.test_resilience

## 9. Limitations

- Threat intelligence depends on the freshness of the downloaded OpenPhish feed.
- Domain popularity does not guarantee website safety.
- The system does not visit suspicious websites.
- Missing detection resources may reduce classification confidence.
- Machine learning predictions are not absolute proof of phishing.
- Experimental multiclass models are not required for the operational scanner.