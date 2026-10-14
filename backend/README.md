# Restaurant POS Backend & Appwrite Cloud Architecture

This backend directory provides database schema definitions, server-side integration scripts, and webhook endpoints for the **Restaurant Management & POS Suite**.

---

## 📁 Directory Structure
```
backend/
├── collections/                  # Appwrite Cloud Database Collection Schemas
│   ├── tables.json               # Dining room tables, zones, occupancy
│   ├── categories.json           # Food menu categories
│   ├── menu_items.json           # Dish catalog with images, prices, veg/spicy tags
│   ├── orders.json               # Live orders, line items, status workflow, GST
│   ├── employees.json            # Staff roster, roles, phone numbers, shifts
│   └── settings.json             # Universal restaurant profile settings
├── scripts/
│   ├── test_connection.js        # Health check script for Appwrite Cloud
│   └── seed_database.js          # Database creation and seeder utility
├── server.js                     # Express API & Petpooja webhook receiver
├── package.json                  # Backend dependencies and run scripts
├── .env.example                  # Environment configuration template
└── README.md                     # Backend documentation
```

---

## ⚙️ Configuration & Environment
Create a `.env` file based on `.env.example`:
```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=6ac08445000e533e223f
APPWRITE_API_KEY=your_appwrite_api_key_here
APPWRITE_DATABASE_ID=hotel_pos_db
PORT=5000
```

---

## 🚀 Running Backend Services
1. Install dependencies:
   ```bash
   npm install
   ```
2. Test connection to Appwrite Cloud:
   ```bash
   npm run test-connection
   ```
3. Start the Express server:
   ```bash
   npm start
   ```
