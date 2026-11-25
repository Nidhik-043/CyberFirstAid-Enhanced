
"""
CyberFirstAid Enhanced
Member 2 - Personalized Cyber Emergency Assistant

Rule-based personalized recovery recommendations.
"""


def action(task_id, title, description, priority, reason,
           url=None, phone=None):

    return {
        "id": task_id,
        "title": title,
        "description": description,
        "priority": priority,
        "reason": reason,
        "url": url,
        "phone": phone,
        "completed": False
    }


def generate_recovery_actions(category: str, answers: dict) -> list:

    actions = []

    def answer(key):
        return answers.get(key, "unsure")

    def add(task_id, title, description, priority, reason,
            url=None, phone=None):

        actions.append(
            action(
                task_id, title, description,
                priority, reason, url, phone
            )
        )

    # ==========================================
    # 1. FINANCIAL FRAUD
    # ==========================================

    if category == "financial_fraud":

        if (
            answer("money_lost") != "no"
            or answer("shared_credentials") != "no"
            or answer("ongoing_transactions") != "no"
        ):

            if answer("bank_contacted") == "yes":
                add(
                    "contact_bank",
                    "Follow up with your bank immediately",
                    "Use official banking channels to confirm that "
                    "affected accounts and payment services are protected. "
                    "Report any continuing unauthorized transactions.",
                    "immediate",
                    "Contacting the bank does not guarantee account protection."
                )
            elif answer("bank_contacted") == "no":
                add(
                    "contact_bank",
                    "Contact your bank immediately",
                    "Use the official banking app or verified "
                    "customer care number. Request protection "
                    "of affected accounts and payment services.",
                    "immediate",
                    "Financial information or funds may be at risk."
                )
            else:
                add(
                    "contact_bank",
                    "Verify bank notification immediately",
                    "Check whether your bank has been notified through "
                    "official channels. If uncertain, contact the bank "
                    "immediately and request account protection.",
                    "immediate",
                    "Bank notification and account protection are not confirmed."
                )

        if (
            answer("money_lost") != "no"
            or answer("ongoing_transactions") != "no"
        ):

            add(
                "call_1930",
                "Call the cyber fraud helpline",
                "If financial cyber fraud has occurred, "
                "call 1930 as soon as possible.",
                "immediate",
                "Early reporting may help limit financial loss.",
                phone="1930"
            )

        if answer("shared_credentials") != "no":

            add(
                "secure_payment_credentials",
                "Secure payment credentials",
                "Change exposed passwords or payment PINs "
                "through official banking services. "
                "Never share another OTP or PIN.",
                "immediate",
                "Payment credentials may have been exposed."
            )

        if answer("ongoing_transactions") != "no":

            add(
                "stop_transactions",
                "Request transaction protection",
                "Ask your bank to restrict affected cards, "
                "UPI services or accounts as appropriate.",
                "immediate",
                "Further unauthorized transactions may occur."
            )

        if answer("fraud_reported") != "yes":

            add(
                "report_financial_fraud",
                "Report financial fraud",
                "Submit the incident through the official "
                "National Cyber Crime Reporting Portal.",
                "high",
                "An official complaint supports investigation.",
                url="https://cybercrime.gov.in/"
            )

        add(
            "save_transactions",
            "Preserve transaction records",
            "Save transaction IDs, receipts, messages "
            "and relevant screenshots securely.",
            "high",
            "Transaction records may support investigation."
        )

        add(
            "monitor_bank",
            "Monitor bank activity",
            "Check account statements and transaction alerts "
            "for further unauthorized activity.",
            "follow_up",
            "Additional suspicious transactions may appear."
        )

    # ==========================================
    # 2. PHISHING
    # ==========================================

    elif category == "phishing":

        add(
            "stop_interaction",
            "Stop interacting with the suspicious message",
            "Do not reopen the link, reply to the sender "
            "or provide additional information.",
            "immediate",
            "Further interaction may increase exposure."
        )

        if answer("clicked_link") != "no":

            add(
                "close_website",
                "Close the suspicious website",
                "Close the website and check whether "
                "any unexpected downloads occurred.",
                "high",
                "The suspicious website may have been accessed."
            )

        if answer("entered_password") != "no":

            add(
                "change_password",
                "Secure exposed account credentials",
                "Using a trusted device, change any exposed "
                "password through the official website. "
                "Revoke unfamiliar sessions and enable MFA.",
                "immediate",
                "Login credentials may have been compromised."
            )

        if (
            answer("shared_financial_details") != "no"
            or answer("money_lost") != "no"
        ):

            add(
                "contact_bank",
                "Contact your bank",
                "Inform your bank about possible financial "
                "information exposure and request protection.",
                "immediate",
                "Banking information or funds may be at risk."
            )

        if answer("money_lost") != "no":

            add(
                "call_1930",
                "Report suspected financial cyber fraud",
                "If unauthorized transactions have occurred, "
                "call 1930 immediately.",
                "immediate",
                "Financial loss may require urgent reporting.",
                phone="1930"
            )

        if answer("downloaded_file") != "no":

            add(
                "check_device",
                "Check the affected device",
                "If a suspicious file was opened or an app "
                "was installed, disconnect the affected device "
                "from the network and seek trusted technical "
                "assistance. Do not open suspicious files.",
                "immediate",
                "The device may have been exposed to malware."
            )

        add(
            "save_phishing_evidence",
            "Preserve phishing evidence",
            "Save the original message, sender details "
            "and screenshots without reopening the link.",
            "high",
            "Evidence can support reporting."
        )

        add(
            "report_phishing",
            "Report the phishing attempt",
            "Report the suspicious message to the platform "
            "or the appropriate official reporting channel.",
            "high",
            "Reporting may help prevent further harm.",
            url="https://cybercrime.gov.in/"
        )

    # ==========================================
    # 3. SOCIAL MEDIA HACKING
    # ==========================================

    elif category == "social_media_hacking":

        if answer("account_access") == "yes":

            add(
                "change_social_password",
                "Change your social media password",
                "Use a trusted device and the platform's "
                "official security settings.",
                "immediate",
                "You still have access to the affected account."
            )

        else:

            add(
                "recover_social_account",
                "Start official account recovery",
                "Use the platform's official hacked-account "
                "or account recovery process.",
                "immediate",
                "Access to the affected account may be lost."
            )

        if answer("recovery_details_changed") != "no":

            add(
                "restore_recovery_details",
                "Review account recovery information",
                "Use official account recovery tools to restore "
                "your authorized email and phone number.",
                "immediate",
                "Recovery information may have been changed."
            )

        if answer("linked_email_compromised") != "no":

            add(
                "secure_linked_email",
                "Secure the linked email account",
                "Recover the linked email account and change "
                "its password using a trusted device.",
                "immediate",
                "The linked email may allow further account access."
            )

        if answer("unauthorized_activity") != "no":

            add(
                "warn_contacts",
                "Warn your contacts",
                "Inform contacts that suspicious messages "
                "from your account may not be genuine.",
                "high",
                "The compromised account may be misused."
            )

        if answer("mfa_enabled") != "yes":

            add(
                "enable_social_mfa",
                "Enable two-factor authentication",
                "After recovering the account, enable "
                "two-factor authentication.",
                "high",
                "Additional account protection is needed."
            )

        add(
            "remove_social_sessions",
            "Review active sessions",
            "Sign out unfamiliar devices and revoke "
            "suspicious third-party application access.",
            "high",
            "Unauthorized sessions may remain active."
        )

        add(
            "save_social_evidence",
            "Preserve account evidence",
            "Save screenshots of unauthorized activity "
            "and account recovery notifications.",
            "high",
            "Evidence may support account recovery."
        )

    # ==========================================
    # 4. EMAIL COMPROMISE
    # ==========================================

    elif category == "email_compromise":

        if answer("account_access") == "yes":

            add(
                "change_email_password",
                "Change your email password",
                "Use the official email service from "
                "a trusted device.",
                "immediate",
                "Your email account may be compromised."
            )

        else:

            add(
                "recover_email",
                "Recover your email account",
                "Use the email provider's official "
                "account recovery process.",
                "immediate",
                "Access to the email account may be lost."
            )

        if answer("recovery_details_changed") != "no":

            add(
                "restore_email_recovery",
                "Review email recovery details",
                "Restore authorized recovery email addresses "
                "and phone numbers after recovering access.",
                "immediate",
                "Recovery details may have been altered."
            )

        if answer("suspicious_forwarding") != "no":

            add(
                "remove_forwarding",
                "Review forwarding rules",
                "Inspect forwarding rules and filters. "
                "Remove unauthorized settings.",
                "high",
                "Messages may be redirected without permission."
            )

        if answer("password_reused") != "no":

            add(
                "secure_other_accounts",
                "Secure other affected accounts",
                "Change reused passwords on other services "
                "and use unique passwords.",
                "immediate",
                "Password reuse may expose multiple accounts."
            )

        if answer("unauthorized_activity") != "no":

            add(
                "warn_email_contacts",
                "Warn email contacts",
                "Inform contacts about suspicious emails "
                "sent from your account.",
                "high",
                "Others may receive fraudulent messages."
            )

        if answer("mfa_enabled") != "yes":

            add(
                "enable_email_mfa",
                "Enable two-factor authentication",
                "Enable MFA after securing your email account.",
                "high",
                "Stronger authentication reduces future risk."
            )

        add(
            "remove_email_sessions",
            "Review active email sessions",
            "Sign out unfamiliar devices and review "
            "connected applications.",
            "high",
            "Unauthorized access may continue."
        )

    # ==========================================
    # 5. IDENTITY THEFT
    # ==========================================

    elif category == "identity_theft":

        if answer("documents_exposed") != "no":

            add(
                "protect_identity",
                "Protect exposed identity information",
                "Contact the relevant issuing authority "
                "through its official support channels.",
                "high",
                "Identity documents may have been exposed."
            )

        if answer("financial_misuse") != "no":

            add(
                "contact_bank",
                "Contact affected financial institutions",
                "Report suspected identity-related financial "
                "misuse and request account protection.",
                "immediate",
                "Identity information may be used financially."
            )

            add(
                "call_1930",
                "Report financial cyber fraud",
                "If unauthorized financial transactions "
                "have occurred, call 1930.",
                "immediate",
                "Financial misuse may require urgent reporting.",
                phone="1930"
            )

        if answer("fake_account") != "no":

            add(
                "report_impersonation",
                "Report impersonation",
                "Use the affected platform's official "
                "impersonation reporting process.",
                "high",
                "Someone may be misusing your identity."
            )

        if answer("service_provider_contacted") != "yes":

            add(
                "contact_provider",
                "Contact the affected service provider",
                "Request assistance through verified "
                "customer support channels.",
                "high",
                "The provider may help restrict identity misuse."
            )

        if answer("incident_reported") != "yes":

            add(
                "report_identity_theft",
                "Report identity theft",
                "Submit an official cybercrime complaint.",
                "high",
                "Identity misuse should be documented.",
                url="https://cybercrime.gov.in/"
            )

        add(
            "monitor_identity",
            "Monitor accounts and identity misuse",
            "Review financial and online accounts for "
            "unfamiliar activity.",
            "follow_up",
            "Identity misuse may continue over time."
        )

    # ==========================================
    # 6. ONLINE HARASSMENT
    # ==========================================

    elif category == "online_harassment":

        if answer("physical_threat") != "no":

            add(
                "physical_safety",
                "Prioritize your physical safety",
                "Move to a safe place if needed. "
                "If you are in immediate danger in India, "
                "contact emergency services on 112.",
                "immediate",
                "There may be a threat to physical safety.",
                phone="112"
            )

        if answer("ongoing_harassment") != "no":

            add(
                "stop_harassment_contact",
                "Limit contact with the harasser",
                "Avoid engaging with threatening messages. "
                "Block or restrict the account when safe.",
                "high",
                "Continued interaction may increase harm."
            )

        if answer("blackmail") != "no":

            add(
                "blackmail_response",
                "Seek help for blackmail",
                "Avoid sending money or additional personal "
                "information. Seek trusted support and "
                "report threats through official channels.",
                "immediate",
                "Blackmail may involve escalating threats."
            )

        if answer("personal_information_exposed") != "no":

            add(
                "protect_privacy",
                "Protect your personal information",
                "Review privacy settings and request removal "
                "of exposed information through the platform.",
                "high",
                "Private information may have been exposed."
            )

        if answer("evidence_saved") != "yes":

            add(
                "save_harassment_evidence",
                "Preserve harassment evidence",
                "Safely preserve relevant messages, dates "
                "and account details without increasing risk.",
                "high",
                "Evidence may support official reporting."
            )

        if answer("incident_reported") != "yes":

            add(
                "report_harassment",
                "Report online harassment",
                "Use official platform reporting tools "
                "and appropriate cybercrime channels.",
                "high",
                "Official reporting may support intervention.",
                url="https://cybercrime.gov.in/"
            )

    # ==========================================
    # 7. LOST OR STOLEN DEVICES
    # ==========================================

    elif category == "lost_stolen_devices":

        if answer("remote_lock_available") != "no":

            add(
                "remote_lock",
                "Locate or remotely lock the device",
                "Use the manufacturer's official device "
                "location and remote locking service. "
                "Do not confront a suspected thief.",
                "immediate",
                "Remote locking may protect device information."
            )

        if answer("sim_active") != "no":

            add(
                "block_sim",
                "Contact your mobile operator",
                "Request suspension of the missing device's "
                "SIM through official customer support.",
                "immediate",
                "The SIM may be used without authorization."
            )

        if answer("banking_apps") != "no":

            add(
                "contact_bank",
                "Protect banking and payment accounts",
                "Contact your bank and request protection "
                "of payment services on the missing device.",
                "immediate",
                "Banking applications may be accessible."
            )

        if (
            answer("device_locked") != "yes"
            or answer("unauthorized_activity") != "no"
        ):

            add(
                "secure_device_accounts",
                "Secure important accounts",
                "From a trusted device, change important "
                "passwords and revoke missing-device sessions.",
                "immediate",
                "Personal accounts may be exposed."
            )

        if answer("incident_reported") != "yes":

            add(
                "report_device",
                "Report the missing device",
                "Report the loss or theft to the police. "
                "For a missing mobile phone in India, "
                "use the official Sanchar Saathi service.",
                "high",
                "Official reporting may support device recovery.",
                url="https://www.sancharsaathi.gov.in/"
            )

        add(
            "monitor_device_accounts",
            "Monitor account activity",
            "Review account alerts and unfamiliar "
            "login attempts.",
            "follow_up",
            "Unauthorized access may occur later."
        )

    # ==========================================
    # 8. UNKNOWN INCIDENT
    # ==========================================

    else:

        if answer("physical_threat") != "no":

            add(
                "physical_safety",
                "Prioritize physical safety",
                "If you are in immediate danger in India, "
                "contact emergency services on 112.",
                "immediate",
                "Physical safety risks cannot be ruled out.",
                phone="112"
            )

        if answer("money_lost") != "no":

            add(
                "contact_bank",
                "Check and protect financial accounts",
                "Contact your bank if you suspect financial "
                "misuse. Call 1930 if financial cyber fraud "
                "has occurred.",
                "immediate",
                "Financial exposure cannot be ruled out.",
                phone="1930"
            )

        if answer("account_compromised") != "no":

            add(
                "secure_accounts",
                "Secure potentially affected accounts",
                "Use a trusted device and official recovery "
                "channels to protect affected accounts.",
                "high",
                "Unauthorized account access may have occurred."
            )

        if answer("personal_information_exposed") != "no":

            add(
                "protect_information",
                "Protect personal information",
                "Avoid sharing additional information and "
                "contact affected service providers.",
                "high",
                "Personal information may be exposed."
            )

        add(
            "manual_review",
            "Request further incident review",
            "Provide a clearer description or seek assistance "
            "from a verified cybersecurity support channel.",
            "high",
            "The incident type has not been confirmed."
        )

    # ==========================================
    # COMMON RECOVERY ACTIONS
    # ==========================================

    add(
        "preserve_evidence",
        "Organize relevant digital evidence",
        "Safely preserve relevant screenshots, messages "
        "and incident records. Do not delay urgent safety "
        "actions to collect evidence.",
        "high",
        "Evidence may support investigation and reporting."
    )

    add(
        "official_reporting",
        "Review official reporting options",
        "Use the appropriate official cybercrime reporting "
        "channel if the incident has not already been reported.",
        "high",
        "Official reporting may support incident investigation.",
        url="https://cybercrime.gov.in/"
    )

    add(
        "monitor_recovery",
        "Continue monitoring your recovery",
        "Monitor affected accounts and follow up on "
        "official complaints. Completing the checklist "
        "does not guarantee successful recovery.",
        "follow_up",
        "Some cybersecurity risks may continue after recovery."
    )

    return actions
