# Ethics Impact Assessment — FinSight

## 1. Introduction

### 1.1 Project Context

FinSight is an AI-powered chatbot designed to assist KPMG Financial Officers with:
- Financial calculations (depreciation, NPV, IRR, ROI, etc.)
- IFRS/GAAP compliance information
- Tax regulation guidance
- General financial Q&A

### 1.2 Purpose

This document outlines the ethical considerations incorporated into FinSight's design, following the ELIZA project requirements (Section 1.2). It provides a comprehensive ethical impact assessment to ensure responsible AI deployment.

---

## 2. Ethical Impact Assessment

### 2.1 Identified Risks

| Risk Category | Description | Mitigation Strategy |
|---------------|-------------|---------------------|
| **Privacy** | Handling sensitive financial data | Local storage only, JWT auth, no external APIs |
| **Misinformation** | Incorrect financial advice or outdated regulations | Sources cited, disclaimers, verification prompts |
| **Algorithmic Bias** | Biased responses or inaccurate calculations | Command-based calculations, knowledge base validation |
| **User Dependency** | Over-reliance on AI for financial decisions | Clear AI identification, professional verification reminders |
| **ELIZA Effect** | Anthropomorphization of the chatbot | Transparent AI identity in system prompts |

---

## 3. Privacy & Data Protection

### 3.1 Data Locality

- **All data stored on-premise**: PostgreSQL database runs locally within the organization's infrastructure
- **No external API calls**: Ollama LLM runs locally (Docker container)
- **No data leaves the system**: Complete isolation from external services

### 3.2 User Authentication

- **JWT-based authentication**: Secure token-based login
- **Bcrypt password hashing**: Passwords hashed with salt rounds of 10
- **User isolation**: Each user's chat history is separate and protected

### 3.3 Data Management

- Users can view their chat history via `/api/chat/history`
- Users can clear their chat history via `/api/chat/history`
- No anonymous data collection

### 3.4 GDPR Alignment

| GDPR Principle | FinSight Implementation |
|---------------|------------------------|
| Data Minimization | Only username and chat history stored |
| Purpose Limitation | Data used solely for session management |
| Storage Limitation | User can delete history on demand |
| Integrity & Confidentiality | JWT tokens, bcrypt, local storage |
| Accountability | Audit trail through chat history |

---

## 4. Fairness & Bias Prevention

### 4.1 Knowledge Base Sources

All financial information is sourced from official standards:

| Standard | Source |
|----------|--------|
| IFRS 9 | Financial Instruments |
| IFRS 15 | Revenue from Contracts with Customers |
| IFRS 16 | Leases |
| IAS 16 | Property, Plant & Equipment |
| US GAAP | Generally Accepted Accounting Principles |
| EU Tax | Official EU tax directives |

### 4.2 Tax Information Disclaimer

Every tax-related response includes:

```
Note: Tax regulations vary by jurisdiction. Please verify with local tax authorities 
for your specific situation. This information is for general guidance only.
```

### 4.3 Calculation Accuracy

Financial calculations use deterministic algorithms:

- **Depreciation**: Straight-line, declining balance, sum-of-years
- **NPV**: Standard time-value-of-money formula
- **IRR**: Newton-Raphson iterative method
- **ROI**: Direct percentage calculation

All formulas are implemented in code and verified against financial standards.

---

## 5. Transparency & Accountability

### 5.1 AI Identity

FinSight's system prompt clearly establishes its identity:

```
You are FinSight, an AI assistant specialized in supporting KPMG Financial Officers.
```

### 5.2 Source Attribution

Responses citing specific standards include references:

```
Based on IFRS 16 - Leases (effective January 1, 2019)
Source: International Accounting Standards Board (IASB)
```

### 5.3 Uncertainty Handling

When FinSight cannot provide a confident answer:

```
I don't have specific information on that topic. Please consult with your 
appropriate professional advisor or refer to official documentation.
```

---

## 6. Misinformation Prevention

### 6.1 Controlled Intelligence

- **Local LLM**: Ollama runs locally with Mistral Nemo model
- **No internet dependency**: Model cannot fetch external content
- **Deterministic fallback**: Commands (/calculate, /compliance, /tax) provide accurate responses

### 6.2 Knowledge Verification

- Knowledge base files are static markdown documents
- No dynamic content generation from unreliable sources
- Compliance information based on official IFRS/GAAP standards

### 6.3 Guardrails

System prompts include:
```
Guidelines:
1. Always be professional and accurate
2. Provide clear, concise responses
3. Use tables and structured formats for complex information
4. Remind users to verify critical information with appropriate sources
5. If unsure, say so rather than providing potentially incorrect information
```

---

## 7. User Dependency & Wellbeing

### 7.1 AI Tool Identification

FinSight consistently identifies as an AI assistant:

- Welcome message: "I'm FinSight, your AI assistant for KPMG Financial Officers"
- System prompt: "Remember: You are a professional assistant for finance professionals"

### 7.2 Professional Verification

Critical responses include verification prompts:

```
⚠️ Important: For financial decisions, please verify with your 
appropriate professional advisor.
```

### 7.3 No Manipulative Design

- **No dark patterns**: No deceptive UI/UX techniques
- **No addictive features**: No gamification or reward systems
- **No pressure tactics**: No urgency-inducing messages

---

## 8. Security

### 8.1 Infrastructure Security

| Layer | Measure |
|-------|---------|
| Network | Docker internal network (finsight-network) |
| Authentication | JWT tokens with expiration |
| Passwords | Bcrypt hashing (cost factor 10) |
| Database | PostgreSQL with local persistence |

### 8.2 Deployment Security

- All services run in isolated Docker containers
- No external ports exposed except: 3000 (web), 5000 (API), 5432 (DB), 11434 (Ollama)
- GPU acceleration runs locally (NVIDIA only)

### 8.3 No Sensitive Logs

- No passwords logged
- No sensitive user data in console output
- No external telemetry

---

## 9. Compliance & Governance

### 9.1 Internal Use Only

FinSight is designed for:
- Internal KPMG employee use
- Controlled environment deployment
- Professional financial assistance

### 9.2 Audit Trail

- Chat history stored in PostgreSQL
- Timestamps on all interactions
- User-specific records for accountability

### 9.3 Documentation

- All ethical considerations documented
- System prompt versioned
- Knowledge base files versioned

---

## 10. Summary

### 10.1 Ethical Principles Applied

| Principle | Status | Implementation |
|-----------|--------|----------------|
| Privacy | ✅ | Local storage, JWT auth, no external APIs |
| Fairness | ✅ | Official sources, verified calculations |
| Transparency | ✅ | AI identity, source citations, uncertainty handling |
| Accountability | ✅ | Audit trail, user isolation |
| Safety | ✅ | Disclaimers, verification prompts, no manipulation |

### 10.2 Continuous Improvement

This ethical assessment should be reviewed:
- When adding new features
- When updating the knowledge base
- When changing the LLM model
- Periodically (quarterly recommended)

---

## 11. References

- International Accounting Standards Board (IASB): https://www.iasplus.com/en IFRS Standards
- EU Corporate Tax Guidelines: https://taxation-customs.ec.europa.eu
- GDPR Regulation: https://gdpr.eu/
- ELIZA Effect: Weizenbaum, J. (1966) - "ELIZA — A Computer Program for the Study of Natural Language Communication Between Man and Machine"

---

*Document Version: 1.0*  
*Last Updated: April 2026*  
*Project: FinSight - AI Assistant for KPMG Financial Officers*
