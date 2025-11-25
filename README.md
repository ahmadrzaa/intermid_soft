# INTERMID Cheque Software

**Cloud cheque creation, approval, and printing (BBK layout).**
🔗 **Live:** [https://intermid-frontend.onrender.com/](https://intermid-frontend.onrender.com/)

---

## Overview

INTERMID is a cloud-based cheque system for teams. Users can prepare cheques on the official BBK layout, send them for manager approval, print or download them, and maintain beneficiary records with full history tracking. An optional AI Agent and WhatsApp quick-contact are included for support.

---

## Features

* **Cheque Builder (BBK Layout)**  Amount-to-words (BHD), fils support, calibration saved locally, print/PNG export, optional hidden payee name.
* **Approval Flow** – Roles: **Admin, Manager, Staff** → Draft → Approve → Print.
* **Beneficiaries** – CRUD for payees used on cheques.
* **History** – Track created, approved, and printed cheques.
* **Extras** – WhatsApp button, AI Agent bubble, Light/Dark mode, JWT auth persistence.

---

## User Flow

1. Login/Register
2. Create new cheque
3. Manager approves
4. Print / Download
5. View history and manage beneficiaries

---

## Tech Stack

**Frontend:** React (Vite)
**Backend:** Express (Node ESM)
**Database:** MongoDB (Mongoose)

---

