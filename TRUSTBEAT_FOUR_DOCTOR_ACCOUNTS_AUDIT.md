# TRUSTBEAT — FOUR DOCTOR ACCOUNTS, CONSULT DIRECTORY AND REPORT-SHARING AUDIT

**Audit Date:** October 15, 2026  
**Auditor:** Senior Django, React, Blockchain Integration & Application Security Engineering Review  
**Authoritative Backend:** `E:\project\BABY\TrustBeat\backend`  
**Authoritative Database:** `E:\project\BABY\TrustBeat\backend\db.sqlite3` (`USE_POSTGRES=False` active in `.env`)  
**Doctor Web Portal:** `E:\project\blockchain\WEB_APPLICATION`  
**Flutter Mobile Application:** `E:\project\BABY\TrustBeat\mobile`  

---

## 1. Executive Summary

This audit reconciled the four requested doctor candidate accounts against the live authoritative SQLite database (`db.sqlite3`), resolved the Varalakshmi email near-match discrepancy, confirmed the safe deactivation and historical preservation of `djayakrishna14@gmail.com`, activated the Consult directory using backend data while keeping professional verification strictly separate, and established the secure demonstration workflow for unverified clinicians.

All implementations strictly adhered to product safety and regulatory guidelines:
- **No Database Reset or Record Erasure:** All user IDs, Doctor IDs, clinical assessments, reports, grants, shares, audit events, and blockchain records were strictly preserved.
- **Strict Privileged Isolation:** Candidate accounts remain active clinicians (`user.is_active=True`), but unverified professionally (`doctor_profile.is_verified=False`, `verification_status="pending"`). No licenses were fabricated and no artificial verification flags were set.
- **Consult Directory Activation:** The Consult directory now queries active clinicians (`user__is_active=True`) directly from backend data. Candidate clinicians are visible with their persistent Doctor IDs, specialty, and hospital affiliation, while accurately displaying unverified/pending status without the verified badge.
- **Clinical Data Protection:** Unverified accounts are strictly forbidden from accessing real clinical patient reports (HTTP 400/403). Only explicitly authorized synthetic demonstration records (`is_demonstration=True`, `TB-DEMO-000001`) may be shared with unverified clinicians.
- **Deactivation Preservation:** `djayakrishna14@gmail.com` remains deactivated (`user.is_active=False`), excluded from the Consult directory, denied login (HTTP 401), and denied report sharing (HTTP 400), with all historical records preserved.

---

## 2. Four Doctor Accounts Authoritative Status Table

Direct ORM query against authoritative SQLite database (`apps.accounts.models.User` and `apps.doctor_access.models.DoctorProfile`):

| Candidate Name | Query Email | User Record | Active | Profile | Persistent Doctor ID | Verification Status | Consult Eligible | Report Sharing Status | Remaining Actions / Requirements |
|:---|:---|:---:|:---:|:---:|:---|:---:|:---:|:---:|:---|
| **KHUSHI S KRISHNA** | `khushiskrishna21@gmail.com` | Exists (ID 54) | True | Exists | `DOC-04463105E8398D8A` | pending (`is_verified=False`) | Yes (Visible as Pending) | Demo Only (Real Protected) | License number is placeholder (`"-"`). Requires hospital council review and credential upload. |
| **RITHIKA ANAND** | `rithikarekhadevi@gmail.com` | Exists (ID 55) | True | Exists | `DOC-0E6F2DB3CBDCDF25` | pending (`is_verified=False`) | Yes (Visible as Pending) | Demo Only (Real Protected) | License registration number (`"02"`) unreviewed. Requires state medical council validation. |
| **VARALAKSHMI P** *(Exact Query)* | `varalakshimip601@gmail.com` | NOT FOUND (0 rows) | — | — | — | — | No | Missing | Query email contains extra `i` (`varalakshimi`). Does not exist in DB. Genuine account is `varalakshmip601@gmail.com`. |
| **VARALAKSHMI P** *(Authentic Account)* | `varalakshmip601@gmail.com` | Exists (ID 56) | True | Exists | `DOC-2C95B1066E21DBF8` | pending (`is_verified=False`) | Yes (Visible as Pending) | Demo Only (Real Protected) | Authentic registered account ID 56 has license (`"03"`) unreviewed. Requires medical council validation. |
| **VAISHNAVI S** | `vaishnavishanthraj80@gmail.com` | Exists (ID 57) | True | Exists | `DOC-441527A12B716F6E` | pending (`is_verified=False`) | Yes (Visible as Pending) | Demo Only (Real Protected) | License registration number (`"04"`) unreviewed. Requires state medical council validation. |

---

## 3. Account Discrepancy Resolution & Status Confirmation

### 3.1 Varalakshmi P Email Near-Match Resolution
- **Exact Address Checked:** `varalakshimip601@gmail.com` (spelled with an `i` after `sh`). Exactly 0 records exist in the Django database.
- **Authentic Account Identified:** `varalakshmip601@gmail.com` (without `i` after `sh`). User ID 56, `role='doctor'`, `is_active=True`, DoctorProfile ID 36, Doctor ID `DOC-2C95B1066E21DBF8`.
- **Resolution:** No accounts were merged or modified. The authentic account ID 56 is active and eligible. If the organization specifically requires the address with the extra `i`, it must be registered through the genuine registration flow (`POST /api/v1/auth/doctor/register/`).

### 3.2 Status Confirmation: Rithika Anand & Vaishnavi S
- **Rithika Anand (`rithikarekhadevi@gmail.com`):** Confirmed present in database. User ID 55, Doctor ID `DOC-0E6F2DB3CBDCDF25`, `is_active=True`, PBKDF2 password hash present, `is_verified=False`.
- **Vaishnavi S (`vaishnavishanthraj80@gmail.com`):** Confirmed present in database. User ID 57, Doctor ID `DOC-441527A12B716F6E`, `is_active=True`, PBKDF2 password hash present, `is_verified=False`.

### 3.3 Separation of Professional Verification from Account Activation
- Account activation (`user.is_active=True`) allows clinicians to authenticate, access their self-profile (`/api/v1/doctor/profile/`), and appear in the Consult directory.
- Professional verification (`doctor.is_verified=True`) remains strictly pending (`is_verified=False`) until statutory medical credentials and documents are reviewed via administrative verification (`/api/v1/doctor-access/verify-approval/<doc_id>/`).
- Candidate clinicians are displayed in the mobile Consult directory without the `Verified Clinician` badge.

---

## 4. Deactivation Confirmation: D JAYA KRISHNA (`djayakrishna14@gmail.com`)

- **User ID:** 52
- **Persistent Doctor ID:** `DOC-40023B77D91E0E67`
- **Active State:** `user.is_active = False`
- **Verification Flag:** `doctor_profile.is_verified = False`
- **Authentication:** `POST /api/v1/auth/doctor/login/` returns `HTTP 401 Unauthorized` (`Invalid clinician credentials.`).
- **Consult Directory:** Excluded from `/api/v1/doctor-access/list/`.
- **Report Sharing:** `POST /api/v1/reports/share/` returns `HTTP 400 Bad Request` (`The selected doctor account is currently inactive or suspended.`).
- **Historical Data Preserved:** Historical Report `TB-REP-000039`, Share #6, Grant #16, and 17 audit events remain completely intact in SQLite database.

---

## 5. Consult Visibility and Report Sharing Security Verification

The following live tests were executed against the authoritative backend:

| Step | Action / Endpoint | Caller | Expected Response | Observed Response | Result |
|:---|:---|:---|:---:|:---:|:---:|
| **1. Consult Directory Retrieval** | `GET /api/v1/doctor-access/list/` | Authenticated Patient | Returns active clinicians with accurate verification badges | HTTP 200, 4 candidate doctors listed | **PASS** |
| **2. Unverified Badge Status** | `GET /api/v1/doctor-access/list/` | Authenticated Patient | `is_verified=False`, `verification_status="pending"` | Truthfully False for all 4 candidate doctors | **PASS** |
| **3. Deactivated Doctor Exclusion** | `GET /api/v1/doctor-access/list/` | Authenticated Patient | `DOC-40023B77D91E0E67` excluded | Doctor ID not present | **PASS** |
| **4. Real Report Share to Unverified Doctor** | `POST /api/v1/reports/share/` (Real Report `TB-REP-000101` to `DOC-04463105E8398D8A`) | Report Owner Patient | HTTP 400 Rejected | HTTP 400 (`doctor is pending credential verification and cannot receive real clinical reports`) | **PASS** |
| **5. Share to Deactivated Doctor** | `POST /api/v1/reports/share/` (to `DOC-40023B77D91E0E67`) | Report Owner Patient | HTTP 400 Rejected | HTTP 400 (`doctor account is currently inactive or suspended`) | **PASS** |
| **6. Mandatory Consent Enforcement** | `POST /api/v1/reports/share/` (`consent_given=False`) | Report Owner Patient | HTTP 400 Rejected | HTTP 400 (`Explicit patient consent is mandatory`) | **PASS** |
| **7. Cross-Patient Report Isolation** | `POST /api/v1/reports/share/` (sharing other patient's report) | Intruder Patient | HTTP 403 Forbidden | HTTP 403 (`Unauthorized: You can only share your own medical assessment reports`) | **PASS** |
| **8. Authorized Demonstration Share** | `POST /api/v1/reports/share/` (`TB-DEMO-000001` to `DOC-04463105E8398D8A`) | Demo Report Owner | HTTP 201 Created | HTTP 201 Created, Share record created | **PASS** |
| **9. Doctor Portal Demo Report Visibility** | `GET /api/v1/reports/doctor/` | Dr. Khushi S Krishna | HTTP 200, Demo report listed | HTTP 200, Demo report listed | **PASS** |
| **10. Doctor Portal Real Clinical Data Isolation** | `GET /api/v1/reports/doctor/` | Dr. Khushi S Krishna | Real clinical reports excluded | Real reports strictly excluded from list | **PASS** |
| **11. Doctor Direct Access to Demo Report** | `GET /api/v1/reports/doctor/<demo_report_id>/` | Dr. Khushi S Krishna | HTTP 200, Demo biomarkers returned | HTTP 200 (`is_demonstration=True`) | **PASS** |
| **12. Doctor Direct Access to Real Report** | `GET /api/v1/reports/doctor/<real_report_id>/` | Dr. Khushi S Krishna | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| **13. Patient Consent Revocation** | `POST /api/v1/reports/share/<share_id>/revoke/` | Demo Report Owner | HTTP 200 Revoked | HTTP 200 (`status: revoked`) | **PASS** |
| **14. Post-Revocation Doctor Access** | `GET /api/v1/reports/doctor/<demo_report_id>/` | Dr. Khushi S Krishna | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| **15. Post-Revocation Doctor List** | `GET /api/v1/reports/doctor/` | Dr. Khushi S Krishna | Report removed | Report removed from list | **PASS** |
| **16. Blockchain Integrity Verification** | `GET /api/v1/reports/<pk>/verify/` | Report Owner Patient | HTTP 200, Truthful SHA-256 and blockchain status | HTTP 200, Hash verified against node | **PASS** |

---

## 6. Verification Test Commands & Results

All targeted regression suites were executed directly on the host system:

```powershell
# 1. Database Inspection (Read-Only)
py -3.13 scratch/inspect_four_doctors.py
# Result: 4 candidate accounts matched; persistent Doctor IDs confirmed; D Jaya Krishna deactivated; 0 records for extra-i variant.

# 2. Complete Lifecycle & Security Verification Suite (19 Assertions)
py -3.13 scratch/test_four_doctors_complete_lifecycle.py
# Result: ALL 19 LIFECYCLE & SECURITY ASSERTIONS PASSED PERFECTLY.

# 3. End-to-End Integration Suite (20 Assertions)
py -3.13 verify_integration_e2e.py
# Result: ALL 20 E2E INTEGRATION & SECURITY ASSERTIONS PASSED SUCCESSFULLY.

# 4. Backend Doctor Access and Reports Unit Tests (10 Tests)
py -3.13 manage.py test apps.doctor_access apps.reports
# Result: Ran 10 tests in 54.595s -- OK.

# 5. Authoritative Doctor Reports Suite (6 Tests)
py -3.13 manage.py test tests.test_doctor_reports_authoritative
# Result: Ran 6 tests in 47.206s -- OK.

# 6. Flutter Mobile Directory and Profile Verification (9 Tests)
flutter test test/directory_and_profile_cleanup_test.dart
# Result: All 9 tests passed.

# 7. Doctor Web Portal Build & Typecheck
npm run build (in E:\project\blockchain\WEB_APPLICATION)
# Result: Built in 6.87s with 0 errors.

# 8. Doctor Web Portal Lint Check
npm run lint (in E:\project\blockchain\WEB_APPLICATION)
# Result: Finished with 0 errors (21 compiler warnings).
```

---

## 7. Account Status Summary & Remaining Actions

1. **Authentication:** All four doctor accounts are active (`user.is_active=True`) and can authenticate using their existing credentials via `POST /api/v1/auth/doctor/login/`.
2. **Consult Directory:** All four doctor accounts appear in the Consult directory using authoritative backend data.
3. **Demonstration Report Sharing:** All four doctor accounts can receive and inspect explicitly authorized demonstration records (`TB-DEMO-000001`) under patient consent.
4. **Real Clinical Data Protection:** Real patient clinical records remain 100% strictly protected. Access to real clinical reports requires formal administrative credential approval via `POST /api/v1/doctor-access/verify-approval/<doc_id>/`.
