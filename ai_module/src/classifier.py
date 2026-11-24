import re

# CyberFirstAid incident categories and their matching keywords.
CATEGORY_KEYWORDS = {

    "financial_fraud": [
        "financial fraud", "online financial fraud", "bank fraud",
        "payment fraud", "upi fraud", "upi scam", "banking scam",
        "credit card fraud", "debit card fraud", "card fraud",
        "unauthorized transaction", "unauthorised transaction",
        "unauthorized payment", "unauthorised payment",
        "money transferred without permission",
        "money deducted without permission",
        "money stolen", "stole my money", "money disappeared",
        "money missing from account", "unexpected bank deduction",
        "unknown bank transaction", "unknown transaction", "unrecognized transaction", "unrecognised transaction", "unknown transaction in my bank account", "unknown upi transaction",
        "fraudulent transaction", "fraudulent payment",
        "unauthorized bank transfer", "unauthorised bank transfer",
        "payment made without my knowledge",
        "someone took money from my account",
        "someone transferred my money",
        "someone accessed my bank account",
        "bank account emptied", "account balance reduced",
        "fake refund", "refund scam", "cashback scam",
        "investment scam", "loan scam", "job payment scam",
        "otp fraud", "upi pin fraud", "atm fraud",
        "card details stolen", "bank details stolen",
        "gpay fraud", "google pay fraud", "phonepe fraud",
        "paytm fraud", "bhim fraud",
        "shared my otp", "shared bank details",
        "shared my upi pin", "entered my card details",
        "money deducted from my account",
        "money transferred from my account",
        "stole money",
        "shared an otp",
        "bank account fraud",
        "money taken from bank account",
    ],

    "phishing": [
        "phishing", "phishing attack", "phishing message",
        "phishing email", "phishing website", "phishing link",
        "suspicious link", "malicious link", "unknown link",
        "clicked a suspicious link", "opened a suspicious link",
        "fake website", "fake login page", "fake login",
        "fake banking website", "fake payment page",
        "fake email", "fake sms", "fake text message",
        "fraudulent website", "fraudulent email",
        "fraudulent message", "deceptive website",
        "login details stolen", "password stealing website",
        "website asking for otp", "message asking for otp",
        "suspicious attachment", "unknown attachment",
        "email asking for password", "message asking for password",
        "fake customer support link", "fake kyc link",
        "fake delivery link", "fake tracking link",
        "clicked an unknown link", "entered details on a fake website",
        "entered my password on a website",
        "entered my details on a suspicious website",
        "received a suspicious email",
        "received a suspicious sms",
        "received a suspicious message"
    ],

    "social_media_hacking": [
        "social media hacking", "social media account hacked",
        "social media account compromised",
        "social media account stolen",
        "instagram hacked", "facebook hacked",
        "whatsapp hacked", "telegram hacked",
        "snapchat hacked", "twitter hacked",
        "x account hacked", "social account hacked",
        "account taken over", "profile hacked",
        "someone hacked my account",
        "someone took over my account",
        "someone accessed my social media",
        "someone is using my account",
        "unauthorized access to instagram",
        "unauthorized access to facebook",
        "unauthorised access to instagram",
        "unauthorised access to facebook",
        "logged out of my account",
        "cannot access my instagram", "unable to access my instagram account", "unable to access instagram account",
        "cannot access my facebook",
        "cannot access my social account",
        "password changed without permission",
        "unknown posts on my profile",
        "unknown messages sent from my account",
        "messages sent without my permission",
        "fake profile using my name",
        "social media impersonation",
        "recovery email changed",
        "social media account recovery",
        "instagram account hacked",
        "hacked my instagram account",
        "someone hacked my instagram account",
        "someone hacked my instagram account and changed my password",
        "facebook account hacked",
        "someone hacked my facebook account",
        "account hacked",
        "someone took over my instagram account",
        "took over my instagram account",
        "someone took over my facebook account",
        "took over my facebook account",
        "someone took over my whatsapp account",
        "took over my whatsapp account",
        "whatsapp account taken over",
        "someone hacked my whatsapp account",
    ],

    "email_compromise": [
        "email hacked", "email account hacked",
        "email account compromised", "email compromised",
        "gmail hacked", "gmail account hacked",
        "outlook hacked", "yahoo mail hacked",
        "mailbox hacked", "inbox hacked",
        "unauthorized email access", "unauthorised email access",
        "someone accessed my email",
        "someone hacked my email",
        "someone is using my email",
        "email password changed",
        "email password stolen",
        "email account stolen",
        "cannot access my email",
        "cannot log in to my email",
        "locked out of my email",
        "unknown emails sent from my account",
        "emails sent without my permission",
        "unknown messages sent from my email",
        "email recovery details changed",
        "email recovery phone changed",
        "email recovery address changed",
        "suspicious email login",
        "unknown login to my email",
        "unauthorized login to gmail",
        "unauthorised login to gmail",
        "email account taken over",
        "email forwarding changed",
        "unknown email forwarding rule",
        "sending emails from my gmail",
        "someone is sending emails from my gmail without permission",
        "emails sent from my gmail without permission",
        "gmail account compromised",
        "someone hacked my email account",
    ],

    "identity_theft": [
        "identity theft", "identity stolen",
        "identity fraud", "identity misuse",
        "identity misused", "personal details stolen",
        "personal information stolen",
        "personal information misused",
        "aadhaar misuse", "aadhaar misused",
        "aadhaar details stolen", "aadhaar fraud",
        "pan card misuse", "pan card misused",
        "pan details stolen", "pan card fraud",
        "someone using my identity",
        "someone using my personal details",
        "someone pretending to be me",
        "someone impersonating me",
        "identity impersonation",
        "fake identity created",
        "fake account in my name",
        "loan taken in my name",
        "unknown loan in my name",
        "unknown account in my name",
        "account created using my details",
        "personal documents stolen",
        "identity documents stolen",
        "identity details exposed",
        "aadhaar number exposed",
        "pan number exposed",
        "documents misused",
        "someone misused my documents",
        "unauthorized use of my identity",
        "unauthorised use of my identity",
        "took a loan using my aadhaar details",
        "loan using my aadhaar",
        "loan taken using my aadhaar",
        "someone took a loan using my identity",
    ],

    "online_harassment": [
        "online harassment", "cyber harassment",
        "cyberbullying", "online bullying",
        "cyber stalking", "online stalking",
        "threatening messages", "threat messages",
        "abusive messages", "abusive comments",
        "online threats", "physical threats online",
        "blackmail", "online blackmail",
        "sextortion", "online intimidation",
        "repeated unwanted messages",
        "repeated threatening messages",
        "someone is threatening me", "threatening to share my private photos", "someone is threatening to share my private photos",
        "someone is blackmailing me",
        "someone is stalking me online",
        "someone is harassing me online",
        "private photos shared without permission",
        "personal photos leaked",
        "private information leaked",
        "personal information posted online",
        "someone spreading rumours online",
        "fake profile harassing me",
        "threatening calls and messages",
        "unwanted messages on social media",
        "abusive content posted about me",
        "online humiliation",
        "morphed photos shared online",
        "non consensual image sharing",
        "repeated online abuse"
    ],

    "lost_stolen_devices": [
        "phone lost", "mobile lost", "smartphone lost",
        "phone stolen", "mobile stolen", "smartphone stolen",
        "laptop stolen", "laptop lost",
        "device stolen", "device lost",
        "stolen device", "lost device",
        "lost my phone", "stolen my phone",
        "someone stole my phone",
        "someone took my phone",
        "phone missing", "mobile missing",
        "laptop missing", "tablet stolen",
        "tablet lost", "computer stolen",
        "computer lost", "stolen laptop",
        "lost my mobile phone",
        "my phone is missing",
        "my device is missing",
        "phone snatched", "mobile snatched",
        "phone misplaced", "device misplaced",
        "sim card in stolen phone",
        "phone stolen with sim card",
        "lost phone with banking apps",
        "stolen phone with personal data",
        "device stolen with private information",
        "mobile phone was snatched",
        "my mobile phone was snatched",
        "phone was snatched",
        "my phone was stolen",
    ]
}



# Additional patterns to cover different descriptions of the seven incidents.
CATEGORY_KEYWORDS["financial_fraud"].extend([
    "caller pretending to be from my bank",
    "convinced me to share an otp",
    "money was transferred",
    "entered my upi pin",
    "needed to receive a refund",
    "money was deducted",
    "shopping seller",
    "pay outside the app",
    "seller disappeared",
    "card transaction i did not make",
    "fake customer support caller",
    "install a remote access app",
    "money was taken",
    "job recruiter demands another fee",
    "release my salary",
    "registration fee",
])

CATEGORY_KEYWORDS["phishing"].extend([
    "email says my bank account will be blocked",
    "sign in using its link",
    "won a prize",
    "provide bank details to claim it",
    "delivery sms",
    "pay a small fee",
    "shortened link",
    "opened an attachment from an unknown sender",
    "unusual pop-ups",
    "scan a qr code",
    "verify my social media account",
])

CATEGORY_KEYWORDS["social_media_hacking"].extend([
    "social media account posted advertisements",
    "advertisements that i did not create",
    "login from an unknown device on my social media account",
    "changed my social media password",
    "social media password and recovery email",
    "messaging account was linked to another device",
    "linked to another device without my permission",
    "social media profile is sending links to followers",
    "took over my social media account",
    "shared a verification code",
])

CATEGORY_KEYWORDS["email_compromise"].extend([
    "email password was changed",
    "email account is sending spam",
    "sending spam to people in my contact list",
    "unknown forwarding address to my email account",
    "unfamiliar sent messages",
    "login alerts in my email account",
    "colleague received an attachment from my email",
])

CATEGORY_KEYWORDS["identity_theft"].extend([
    "created a profile using my name and photo",
    "fake profile using my name and photo",
    "loan notice for a loan i never applied for",
    "using my personal details",
    "identity document photo",
    "open accounts in my name",
    "photograph and name in a fake profile",
    "verification email for an account i never created",
    "caller knows my identity details",
    "pretending to be me when contacting family",
])

CATEGORY_KEYWORDS["online_harassment"].extend([
    "unknown account repeatedly sends threats",
    "says it knows where i live",
    "insulting comments about me every day",
    "threatens to share private photographs",
    "unless i send money",
    "creates new accounts to contact me",
    "after i block them",
    "sharing edited pictures of me",
    "in a class group without permission",
])

CATEGORY_KEYWORDS["lost_stolen_devices"].extend([
    "left my laptop in a taxi",
    "saved browser sessions and personal documents",
    "sim stopped working",
    "replacement sim was activated",
    "lost a usb drive",
    "not encrypted",
    "my tablet was stolen",
])

def classify_incident(description: str) -> dict:
    """
    Identify the most likely cyber incident category
    using keyword matching.

    This is a rule-based prototype, not a trained ML model.
    """

    if not isinstance(description, str) or not description.strip():
        return {
            "category": "unknown",
            "matched_keywords": [],
            "needs_review": True
        }

    text = description.lower()
    scores = {}
    matched = {}

    for category, keywords in CATEGORY_KEYWORDS.items():
        found = []

        for keyword in keywords:
            pattern = r"(?<!\w)" + re.escape(keyword) + r"(?!\w)"

            if re.search(pattern, text):
                found.append(keyword)

        scores[category] = len(found)
        matched[category] = found

    best_category = max(scores, key=scores.get)
    best_score = scores[best_category]

    if best_score == 0:
        return {
            "category": "unknown",
            "matched_keywords": [],
            "needs_review": True
        }

    # Flag equal scores for human review.
    tied_categories = [
        category for category, score in scores.items()
        if score == best_score
    ]

    return {
        "category": best_category,
        "matched_keywords": matched[best_category],
        "needs_review": len(tied_categories) > 1,
        "score": best_score
    }


