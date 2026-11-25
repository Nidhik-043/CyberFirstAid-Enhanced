# CyberFirstAid - Core Intelligence Module

## 1. Purpose

The Core Intelligence module analyses a user's cyber incident description and provides an initial assessment.

It supports:
- Incident classification
- Risk scoring and risk-level assessment
- Incident-specific questions
- Matched keyword information
- Immediate safety recommendations
- Follow-up recommendations
- Human-review flags for uncertain cases

This module provides preliminary guidance. It does not replace cybersecurity professionals, banks, law enforcement or official reporting channels.

## 2. Supported Incident Categories

The module supports seven incident categories:

1. financial_fraud
2. phishing
3. social_media_hacking
4. email_compromise
5. identity_theft
6. online_harassment
7. lost_stolen_devices

It also supports the `unknown` category when an incident cannot be identified reliably.

## 3. Classification Approach

The module uses a hybrid approach:

### Rule-Based Classification

The primary classifier uses keyword and phrase matching to identify the incident category.

If no suitable category is identified, or the result is uncertain, the incident is marked for review.

### Machine-Learning Suggestion

A prototype machine-learning model uses:
- TF-IDF for text feature extraction
- Logistic Regression for category prediction
- Seven incident categories

The ML model provides an unconfirmed suggestion when rule-based classification returns `unknown`. It does not automatically replace the final incident category.

The model was trained using 42 synthetic examples. Its preliminary 3-fold cross-validation accuracy was 59.52%. This small dataset is not sufficient to establish real-world accuracy or reliability.

## 4. Risk Assessment

The risk assessor calculates a preliminary risk score using incident details and questionnaire answers.

It considers relevant risk factors and avoids counting the same risk factor twice.

The risk levels are:
- Critical
- High
- Medium
- Low

The score and risk level are intended for initial prioritisation, not as a verified measure of actual damage.

## 5. Incident-Specific Questions

The module provides four questions for each supported incident category.

Answer options:
- Yes
- No
- Not sure

Answers can affect the risk assessment. Uncertain answers can also trigger a review requirement.

Use:

```python
from ai_module.src.incident_questions import get_incident_questions

questions = get_incident_questions("financial_fraud")
```

## 6. Main Integration

Import the assessment function:

```python
from ai_module.src.assessment import assess_incident
```

Example:

```python
description = "Someone stole money from my bank account after I shared an OTP"

result = assess_incident(description)

print(result)
```

Questionnaire answers can also be supplied:

```python
answers = {
    "money_lost": "Yes",
    "bank_details_shared": "Yes",
    "remote_access": "No",
    "bank_access": "Not sure"
}

result = assess_incident(description, answers)
```

## 7. Output Format

The assessment function returns a dictionary containing:

- `incident_category`: Identified category or `unknown`
- `matched_keywords`: Keywords or phrases matched by the rule-based classifier
- `classification_needs_review`: Whether classification needs review
- `ml_suggestion`: Optional machine-learning suggestion
- `classification_source`: Source of the classification
- `risk_score`: Preliminary numerical risk score
- `risk_level`: Preliminary risk level
- `risk_reasons`: Reasons contributing to the risk score
- `immediate_actions`: Recommended immediate actions
- `follow_up_actions`: Recommended follow-up actions
- `needs_review`: Whether the overall assessment requires review

The ML suggestion is not a confirmed classification. When the category is `unknown`, it must be treated as an unconfirmed suggestion.

## 8. Dataset and Model Training

The module includes a synthetic dataset:

`ai_module/datasets/cyberfirstaid_synthetic_incidents_7_categories.csv`

It contains 42 examples across seven incident categories.

To train the machine-learning model, run this command from the repository root:

```powershell
python -m ai_module.src.train_model
```

The trained model is saved at:

`ai_module/models/incident_classifier.joblib`

The current dataset is small and synthetic. More diverse, independently collected and reviewed examples are needed before making real-world performance claims.

The rule-based classifier matched all 42 current development examples during testing. These examples were also used while developing the matching phrases, so this result is not an independent accuracy measurement.

## 9. Integration Notes

- Pass the incident description as a string.
- Pass questionnaire answers as a dictionary when available.
- Return the assessment dictionary through the backend API.
- Display immediate actions and follow-up actions separately.
- Check `needs_review` and communicate uncertainty to the user.
- Treat ML suggestions as unconfirmed.
- Validate user input before calling the module.
- Never expose passwords, OTPs, API keys or other secrets.
- Keep emergency guidance available without depending on an external AI service.

## 10. Testing

The module currently has 12 automated unit tests.

Run all tests from the repository root:

```powershell
python -m unittest discover -s ai_module/tests -t . -v
```

The current test suite covers:
- Incident assessment
- Risk scoring
- Duplicate risk-factor prevention
- Questionnaire answers
- Empty input
- Unknown incidents and review requirements
- Machine-learning prediction output

Latest test result: 12 tests passed.

