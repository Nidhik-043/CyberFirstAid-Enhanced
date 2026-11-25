import re
import json
import ipaddress
from urllib.parse import urlsplit, unquote


SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co",
    "is.gd", "ow.ly", "cutt.ly", "rb.gy"
}

SUSPICIOUS_KEYWORDS = {
    "login", "verify", "update", "secure",
    "password", "account", "kyc", "otp",
    "urgent", "reward", "claim", "wallet"
}

BRANDS = {
    "paypal": "paypal.com",
    "google": "google.com",
    "microsoft": "microsoft.com",
    "amazon": "amazon.com",
    "facebook": "facebook.com",
    "netflix": "netflix.com",
    "apple": "apple.com",
    "sbi": "sbi.co.in",
    "hdfc": "hdfcbank.com",
    "icici": "icicibank.com"
}


def edit_distance(a, b):
    row = list(range(len(b) + 1))

    for i, x in enumerate(a, 1):
        new_row = [i]

        for j, y in enumerate(b, 1):
            new_row.append(min(
                new_row[j - 1] + 1,
                row[j] + 1,
                row[j - 1] + (x != y)
            ))

        row = new_row

    return row[-1]


def analyze_url(url: str) -> dict:

    original_url = url.strip()

    if not original_url:
        raise ValueError("URL cannot be empty")

    if any(c.isspace() for c in original_url):
        raise ValueError("URL contains whitespace")

    normalized_url = original_url

    if not re.match(
        r"^[a-zA-Z][a-zA-Z0-9+.-]*://",
        normalized_url
    ):
        normalized_url = "https://" + normalized_url

    parsed = urlsplit(normalized_url)
    hostname = (parsed.hostname or "").lower().rstrip(".")

    if parsed.scheme not in ("http", "https"):
        raise ValueError("Only HTTP and HTTPS URLs are supported")

    if not hostname:
        raise ValueError("Invalid URL")

    # Validate the port, if supplied.
    _ = parsed.port

    indicators = []

    def add_indicator(name, points, explanation):
        indicators.append({
            "indicator": name,
            "points": points,
            "explanation": explanation
        })

    # Rule 1: Unencrypted HTTP
    if parsed.scheme == "http":
        add_indicator(
            "Unencrypted HTTP", 10,
            "The URL does not use HTTPS encryption."
        )

    # Rule 2: IP address instead of domain
    try:
        ipaddress.ip_address(hostname)
        add_indicator(
            "IP-based URL", 25,
            "The URL uses an IP address instead of a domain."
        )
    except ValueError:
        pass

    # Rule 3: Excessive URL length
    if len(normalized_url) > 100:
        add_indicator(
            "Long URL", 10,
            "A long URL may conceal suspicious information."
        )

    # Rule 4: Excessive domain labels
    if hostname.count(".") >= 4:
        add_indicator(
            "Excessive domain labels", 15,
            "Multiple domain labels may obscure the destination."
        )

    # Rule 5: User information in URL
    if "@" in parsed.netloc:
        add_indicator(
            "Misleading URL structure", 20,
            "User information before @ can disguise the actual host."
        )

    # Rule 6: URL shortening services
    if hostname in SHORTENERS:
        add_indicator(
            "Shortened URL", 15,
            "A shortened URL hides its final destination."
        )

    # Rule 7: Suspicious keywords
    decoded_url = unquote(normalized_url).lower()

    found_keywords = sorted(
        word for word in SUSPICIOUS_KEYWORDS
        if word in decoded_url
    )

    if found_keywords:
        add_indicator(
            "Suspicious keywords",
            min(len(found_keywords) * 5, 20),
            "Keywords detected: " + ", ".join(found_keywords)
        )

    # Rule 8: Excessive hyphens
    if hostname.count("-") >= 3:
        add_indicator(
            "Excessive hyphens", 10,
            "The domain contains several hyphens."
        )

    # Rule 9: Encoded characters
    if re.search(r"%[0-9a-fA-F]{2}", normalized_url):
        add_indicator(
            "Encoded characters", 10,
            "Encoded characters may conceal parts of the URL."
        )

    # Rule 10: Possible brand impersonation
    for brand, official_domain in BRANDS.items():

        official = (
            hostname == official_domain
            or hostname.endswith("." + official_domain)
        )

        if brand in hostname and not official:
            add_indicator(
                "Possible brand impersonation", 25,
                f"The hostname mentions {brand} but does not "
                f"match the reference domain {official_domain}."
            )
            break

    # Rule 11: Possible typosquatting
    typo_found = False

    for label in hostname.split("."):
        for brand, official_domain in BRANDS.items():

            if len(brand) < 5:
                continue

            if (
                hostname == official_domain
                or hostname.endswith("." + official_domain)
            ):
                continue

            if edit_distance(label, brand) == 1:
                add_indicator(
                    "Possible typosquatting", 25,
                    f"The domain label {label} resembles {brand}."
                )
                typo_found = True
                break

        if typo_found:
            break

    # Rule 12: Internationalized domain warning
    if "xn--" in hostname or not hostname.isascii():
        add_indicator(
            "Internationalized domain", 15,
            "Unicode or Punycode may be used for lookalike domains."
        )

    risk_score = min(
        sum(item["points"] for item in indicators),
        100
    )

    if risk_score >= 60:
        classification = "High Risk"
    elif risk_score >= 30:
        classification = "Suspicious"
    else:
        classification = "Low Risk"

    recommendations = [
        "Verify the destination through an official source.",
        "Never enter passwords or OTPs on unverified websites."
    ]

    if risk_score >= 30:
        recommendations.extend([
            "Avoid opening this URL until verified.",
            "Do not download files or provide personal information.",
            "Report the suspicious link if appropriate."
        ])

    return {
        "original_url": original_url,
        "normalized_url": normalized_url,
        "hostname": hostname,
        "risk_score": risk_score,
        "classification": classification,
        "indicators": indicators,
        "recommendations": recommendations,
        "disclaimer": (
            "This is a rule-based URL analysis. "
            "A low risk score does not guarantee safety."
        )
    }


if __name__ == "__main__":
    try:
        url = input("Enter a URL to analyze: ")
        result = analyze_url(url)
        print(json.dumps(result, indent=4))
    except ValueError as error:
        print("Error:", error)
import re
import ipaddress
from urllib.parse import urlsplit

TRUSTED_DOMAINS = {
    "google.com": "Google",
    "gmail.com": "Google Mail",
    "youtube.com": "YouTube",
    "amazon.com": "Amazon",
    "amazon.in": "Amazon India",
    "microsoft.com": "Microsoft",
    "apple.com": "Apple",
    "github.com": "GitHub",
    "paypal.com": "PayPal",
    "facebook.com": "Facebook",
    "instagram.com": "Instagram",
    "netflix.com": "Netflix",
    "linkedin.com": "LinkedIn",
    "sbi.co.in": "State Bank of India",
    "onlinesbi.sbi": "SBI Internet Banking",
    "bank.sbi": "State Bank of India",
    "hdfcbank.com": "HDFC Bank",
    "icicibank.com": "ICICI Bank",
    "axisbank.com": "Axis Bank",
    "rbi.org.in": "Reserve Bank of India",
    "uidai.gov.in": "UIDAI",
    "cybercrime.gov.in": "National Cyber Crime Portal",
    "digilocker.gov.in": "DigiLocker",
    "india.gov.in": "Government of India",
    "irctc.co.in": "IRCTC",
    "flipkart.com": "Flipkart",
    "phonepe.com": "PhonePe",
    "paytm.com": "Paytm",
    "openai.com": "OpenAI",
    "chatgpt.com": "ChatGPT"
}

def analyze_url_advanced(url):

    if len(url) > 8192:
        raise ValueError("URL exceeds maximum supported length")

    if any(ord(c) < 32 or ord(c) == 127 for c in url):
        raise ValueError("URL contains control characters")

    if "\\" in url:
        raise ValueError("URL contains ambiguous backslashes")

    result = analyze_url_basic(url)

    hostname = result["hostname"]
    parsed = urlsplit(result["normalized_url"])

    try:
        hostname = hostname.encode("idna").decode("ascii")
    except UnicodeError:
        raise ValueError("Invalid domain name")

    is_ip = False

    try:
        ipaddress.ip_address(hostname)
        is_ip = True
    except ValueError:
        pass

    if not is_ip:
        labels = hostname.split(".")

        if (
            len(hostname) > 253
            or len(labels) < 2
            or any(
                not re.fullmatch(
                    r"[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?",
                    label
                )
                for label in labels
            )
        ):
            raise ValueError("Invalid domain name")

    trusted_domain = None
    organization = None

    for domain, name in TRUSTED_DOMAINS.items():
        if hostname == domain or hostname == "www." + domain:
            trusted_domain = domain
            organization = name
            break

    indicators = result["indicators"]

    def add_indicator(name, points, explanation):
        indicators.append({
            "indicator": name,
            "points": points,
            "explanation": explanation
        })

    for item in indicators:

        if item["indicator"] == "Possible typosquatting":
            item["points"] = 60

        elif item["indicator"] == "Possible brand impersonation":
            item["points"] = 60

        elif item["indicator"] == "Misleading URL structure":
            item["points"] = 60

        elif item["indicator"] == "Shortened URL":
            item["points"] = 35

        elif item["indicator"] == "IP-based URL":
            item["points"] = 45

        elif item["indicator"] == "Internationalized domain":
            item["points"] = 30

    for domain in TRUSTED_DOMAINS:

        official = (
            hostname == domain
            or hostname.endswith("." + domain)
        )

        if domain in hostname and not official:
            add_indicator(
                "Trusted domain impersonation",
                60,
                f"The hostname contains {domain} but is not "
                "part of that official domain."
            )
            break

    if parsed.port not in (None, 80, 443):
        add_indicator(
            "Unusual port",
            15,
            "The URL uses a non-standard web port."
        )

    risk_score = min(
        sum(item["points"] for item in indicators),
        100
    )

    if risk_score >= 60:
        classification = "High Risk"
        verdict = "Potential phishing link"

    elif risk_score >= 30:
        classification = "Suspicious"
        verdict = "Suspicious link - verification required"

    elif (
        trusted_domain
        and parsed.scheme == "https"
        and risk_score == 0
        and re.match(r"^https://", url.strip(), re.I)
    ):
        classification = "Genuine"
        verdict = "Genuine - Trusted domain recognized"

    else:
        classification = "Low Risk"
        verdict = "Low Risk - Authenticity not verified"

    result["risk_score"] = risk_score
    result["classification"] = classification
    result["verdict"] = verdict
    result["trusted_domain"] = trusted_domain
    result["organization"] = organization
    result["domain_recognized"] = trusted_domain is not None
    result["indicator_count"] = len(indicators)
    result["analysis_method"] = "Offline rule-based analysis"
    result["live_verification"] = False

    if classification == "Genuine":
        result["recommendations"] = [
            "The hostname matches a recognized official domain.",
            "Check the page before entering sensitive information.",
            "Never share OTPs or passwords with unknown persons."
        ]

    elif classification in ("High Risk", "Suspicious"):
        result["recommendations"] = [
            "Do not open the link until independently verified.",
            "Do not enter passwords, OTPs or banking information.",
            "Visit the official website directly instead.",
            "Report suspected phishing through official channels."
        ]

    result["disclaimer"] = (
        "Domain recognition is based on a local trusted list. "
        "Website existence, ownership and live content "
        "have not been independently verified."
    )

    return result


analyze_url_basic = analyze_url
analyze_url = analyze_url_advanced
