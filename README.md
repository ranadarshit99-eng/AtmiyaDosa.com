# 🍽️ Restaurant POS & Smart QR Ordering Suite

An enterprise-grade, modern Restaurant Management System, Kitchen Display System (KDS), and touchless Table QR Ordering Portal. Built with **React 18**, **Vite**, **Tailwind CSS**, and **Appwrite Cloud**.

---

## 📁 Senior-Level Folder Structure

```
HOTEL MANAGE MENT/
│
├── frontend/                      # React 18 + Vite Frontend Application
│   ├── public/                    # Static favicon and assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/             # 10 Dedicated Restaurant Admin Modules
│   │   │   │   ├── ExecutiveDashboard.jsx   # Exact match to reference UI (KPIs, Charts, Orders)
│   │   │   │   ├── OrdersView.jsx           # Order audit, statuses, bill printing
│   │   │   │   ├── KitchenPanelView.jsx     # Kitchen Display System (KDS) with audio chimes
│   │   │   │   ├── TablesView.jsx           # Visual table occupancy & zones
│   │   │   │   ├── MenuManagementView.jsx   # Recipe catalog & dish image uploader
│   │   │   │   ├── EmployeesView.jsx        # Staff roster & shifts
│   │   │   │   ├── ReportsAnalytics.jsx     # Daily sales & 5% GST tax audit ledger
│   │   │   │   ├── OffersView.jsx           # Promo discount coupon engine
│   │   │   │   ├── QRManagementView.jsx     # Scannable QR code generator & acrylic standee
│   │   │   │   ├── SettingsView.jsx         # Universal restaurant profile settings
│   │   │   │   └── PetpoojaSync.jsx         # Aggregator POS integration (Zomato/Swiggy)
│   │   │   ├── auth/
│   │   │   │   └── AuthPage.jsx             # Staff Login & Sign Up Gate
│   │   │   └── CustomerMenu.jsx             # Mobile touchless ordering menu (Bypasses Login)
│   │   ├── lib/
│   │   │   ├── appwrite.js        # Appwrite Cloud SDK & state persistence layer
│   │   │   ├── translations.js    # 4-Language Translation (EN, HI, GU, Hinglish)
│   │   │   └── sound.js           # Web Audio API KOT chime synthesizer
│   │   ├── App.jsx                # Application Master Router
│   │   ├── index.css              # Custom styling, print format & fonts
│   │   └── main.jsx               # React DOM Entry
│   ├── index.html                 # HTML entry with Outfit & Inter fonts
│   ├── package.json               # Frontend dependencies
│   ├── vite.config.js             # Vite configuration
│   └── .env.example               # Frontend environment template
│
├── backend/                       # Appwrite Cloud Integration & Server Services
│   ├── collections/               # Appwrite Database Collection Schemas (JSON)
│   │   ├── tables.json
│   │   ├── categories.json
│   │   ├── menu_items.json
│   │   ├── orders.json
│   │   ├── employees.json
│   │   └── settings.json
│   ├── scripts/
│   │   ├── test_connection.js     # Health check & Appwrite Cloud ping script
│   │   └── seed_database.js       # Database seeder utility
│   ├── server.js                  # Express API & Petpooja webhook receiver
│   ├── package.json               # Backend dependencies
│   ├── .env.example               # Backend environment template
│   └── README.md                  # Backend documentation
│
├── .gitignore                     # Git ignore rules
├── package.json                   # Root monorepo workspace scripts
└── README.md                      # Complete Project Documentation
```

---

## 🚀 Quick Start Guide

### 1. Run the Frontend (POS & Guest Menu)
```bash
# From root directory:
npm run dev

# Or directly inside frontend/:
cd frontend
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

### 2. Test Customer QR Ordering (Bypasses Login Wall)
Open with any table query parameter:
```
http://localhost:5173/?table=T04
```

### 3. Run Backend Services (Optional)
```bash
npm run backend
```

---

## 🌐 4-Language System
Toggle instantly between:
1. 🇬🇧 **English**
2. 🇮🇳 **हिन्दी (Hindi)**
3. 🇮🇳 **ગુજરાતી (Gujarati)**
4. 🇮🇳 **Hinglish** (e.g. *"Aaj ke Orders"*, *"Khana Taiyar Hai"*)

---

## ☁️ Deployment Instructions (GitHub + Vercel)
1. Push this repository to GitHub.
2. In Vercel or Netlify, select your repo.
3. Set **Root Directory** to `frontend`.
4. Deploy! All QR codes dynamically adapt to your live domain via `window.location.origin`.
