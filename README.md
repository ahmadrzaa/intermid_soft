# INTERMID Cheque Software

Cloud check-printing & approvals for teams. Prepare cheques on bank layouts (BBK-ready), route for Manager approval, print/download, and keep a full history. Includes beneficiaries management and an optional AI “Agent” helper bubble.

> **Stack**: React (Vite) + Express (Node/ESM) + MongoDB (Mongoose)  
> **Live/testing**: ngrok tunnel for Frontend & Backend

---

## 🔥 Features

- **Cheque Builder & Printer (BBK layout)**
  - Amount → **BHD words** (with 3-digit fils)  
  - Payee, date boxes, amount numeric box, calibration saved in `localStorage`
  - Download PNG / Print in-place
  - (Option) **Hide beneficiary name** on print

- **Approvals Flow & Roles**
  - **Admin / Manager / Staff** login
  - Save as Draft → Manager approves → Print

- **Beneficiaries**
  - CRUD for payees/beneficiaries used on cheques

- **History**
  - Track created/approved/printed cheques

- **Polish**
  - Floating **WhatsApp** CTA + **Agent** chat bubble
  - Light/Dark theme
  - Auth persistence (JWT)

---

## 🧭 User Journey (Happy Path)

1. **Landing (Home)** → user sees product & *Get Started*.
2. **Register** (first Admin) or **Login** (Admin/Manager/Staff).
3. **Dashboard** → **Cheques → New**.
4. Fill details → **Save** (Draft) → (Manager) **Approve** → **Print/Download**.
5. View all in **History**; maintain **Beneficiaries** as needed.
6. Use **WhatsApp** quick contact & **Agent** bubble for help.

---

## 🏗 Architecture


**Frontend**
- Vite React app under `frontend/`
- Pages: Home, Login, Register, Dashboard, Cheques (New), Approvals, History, Beneficiaries, Settings
- Auth context with JWT storage
- Floating tools component shows on every page (including Home/Login)

**Backend**
- Express ESM app under `backend/src`
- Routes
  - `/api/auth` – register, login, me
  - `/api/cheques` – CRUD (draft/approve/print status)
  - `/api/beneficiaries` – CRUD
  - `/api/agent` – *(optional)* chat with LLM; mount only if configured

**Database**
- MongoDB (local or Atlas), models for `User`, `Cheque`, `Beneficiary`

---

## 📂 Folder Structure (top-level)
<img width="1473" height="948" alt="Screenshot 2025-11-25 105935" src="https://github.com/user-attachments/assets/db5e5e86-3771-4899-a06e-029555d2ee63" /> <img width="1905" height="938" alt="Screenshot 2025-11-25 110043" src="https://github.com/user-attachments/assets/0baca143-593e-4140-81f6-f2e03d9818b5" /> <img width="571" height="851" alt="Screenshot 2025-11-25 110106" src="https://github.com/user-attachments/assets/0392d2db-606f-404b-a214-31ce1fd0cbd8" />



