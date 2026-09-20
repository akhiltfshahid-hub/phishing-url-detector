from urllib.parse import urlparse
import re


def analyze_url(url):
    url = url.strip()

    if not url:
        return {
            "risk": "No Risk",
            "score": 0,
            "reasons": ["No URL was entered."]
        }

    if not re.match(r"^https?://", url, re.IGNORECASE):
        url = "http://" + url

    parsed = urlparse(url)
    hostname = parsed.hostname or ""
    full_url = url.lower()

    score = 0
    reasons = []

    # 1. IP address instead of domain name
    if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", hostname):
        score += 30
        reasons.append("The URL uses an IP address instead of a normal domain.")

    # 2. Very long URL
    if len(url) > 100:
        score += 15
        reasons.append("The URL is unusually long.")

    # 3. @ symbol
    if "@" in url:
        score += 25
        reasons.append("The URL contains '@', which can hide the real destination.")

    # 4. Too many subdomains
    if hostname.count(".") >= 3:
        score += 15
        reasons.append("The domain contains many subdomains.")

    # 5. Suspicious words
    suspicious_words = [
        "login",
        "verify",
        "verification",
        "secure",
        "account",
        "update",
        "password",
        "free",
        "winner",
        "claim",
        "gift",
        "bank"
    ]

    found_words = [word for word in suspicious_words if word in full_url]

    if found_words:
        score += min(len(found_words) * 8, 30)
        reasons.append(
            "Suspicious keywords found: " + ", ".join(found_words)
        )

    # 6. HTTP instead of HTTPS
    if parsed.scheme.lower() == "http":
        score += 10
        reasons.append("The URL does not use HTTPS.")

    # 7. Hyphen-heavy hostname
    if hostname.count("-") >= 3:
        score += 10
        reasons.append("The domain contains several hyphens.")

    # Limit score
    score = min(score, 100)

    if score >= 60:
        risk = "High Risk"
    elif score >= 30:
        risk = "Medium Risk"
    elif score > 0:
        risk = "Low Risk"
    else:
        risk = "No Risk"

    if not reasons:
        reasons.append("No obvious suspicious patterns were detected.")

    return {
        "risk": risk,
        "score": score,
        "reasons": reasons
    }