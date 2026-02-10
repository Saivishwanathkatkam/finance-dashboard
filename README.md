# 💰 Finance Dashboard

A comprehensive personal finance management platform that helps you track income, bank transactions, and investments with powerful visualizations and insights.

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication
- Secure user registration and login
- JWT-based authentication
- Password encryption with bcrypt
- User-specific data isolation

### 💵 Income Tracking
- **CSV Upload & Manual Entry** - Import data or add manually
- **Smart Filtering** - Filter by month, year, or custom date ranges
- **Growth Analytics** - Track income growth with YoY and MoM comparisons
- **Visual Insights** - Interactive charts showing income trends
- **Key Metrics**:
  - Total Income
  - Average Monthly Income
  - Year-to-Date (YTD)
  - Highest/Lowest earning months
  - Projected Annual Income
  - Income breakdown by source

### 🏦 Bank Statement Management
- **Multi-Account Support** - Manage multiple bank accounts
- **CSV Import** - Upload bank statements with smart duplicate handling
- **Source Tracking** - Visual badges differentiate CSV vs Manual entries
- **Advanced Filtering** - Date range, search, and account-based filters
- **Spending Analytics** - Charts for monthly trends and debit/credit analysis
- **Key Metrics**:
  - Total Debits (Spending)
  - Total Credits (Income)
  - Net Balance Change
- **Smart Duplicate Handling** - Replaces CSV entries by date while preserving manual entries
- **Bulk Operations** - Edit or delete multiple transactions at once

### 📈 Investments (Coming Soon)
- Track Mutual Funds, Stocks, Fixed Deposits, and Bonds
- Monitor current holdings and booked profits
- Performance analytics and portfolio insights

---

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Recharts** - Interactive data visualizations
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **PapaParse** - CSV processing

### Database
- **MongoDB** - NoSQL database
- **Mongoose** - ODM library

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v14 or higher)
- **MongoDB** (local or MongoDB Atlas)
- **npm** or **yarn**

---

## 📥 Installation & Deployment

### Quick Start

1. **Download the Repository**
   ```bash
   git clone https://github.com/yourusername/finance-dashboard.git
   cd finance-dashboard
   ```

2. **Start the Frontend**
   
   Open a terminal and navigate to the frontend folder:
   ```bash
   cd finance-dashboard
   npm install
   npm run dev
   ```

3. **Start the Backend Server**
   
   Open another terminal and navigate to the backend folder:
   ```bash
   cd mongoserver
   npm install
   node mongoserver.js
   ```

4. **Access the Application**
   - Frontend: `http://localhost:3000` (or the port shown in your terminal)
   - Backend API: `http://localhost:3001` (or the port configured in mongoserver)

### Environment Configuration

**For Backend (mongoserver folder):**

Create a `.env` file in the `mongoserver` folder:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance-dashboard
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

**For Frontend (finance-dashboard folder):**

Create a `.env` file in the `finance-dashboard` folder:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📚 Usage

### 1. Create an Account
- Navigate to the signup page
- Enter your email and password
- Click "Create Account"

### 2. Track Your Income
- Go to the **Income** section
- Upload a CSV file or manually add income records
- Use filters to view data by month/year
- Analyze growth trends with interactive charts

**CSV Format for Income:**
```csv
Date,Source,Category,Amount,Notes
30-09-2025,Company ABC,Salary,50000,Monthly salary
15-09-2025,Freelance,Freelance,15000,Project payment
```

### 3. Manage Bank Statements
- Add your bank accounts in the **Bank Statement** section
- Select an account and upload your bank statement CSV
- Manual entries are marked with a special badge
- View spending trends and analyze your transactions

**CSV Format for Bank Statements:**
```csv
Date,Details,Debit,Credit,Balance
01/01/2025,Purchase at Store ABC,470,,5000
02/01/2025,Salary Credit,,50000,55000
```

### 4. Smart Features
- **Duplicate Handling**: Re-uploading CSV replaces old data while keeping manual entries
- **Filters**: Narrow down data by date, account, or search terms
- **Visual Analytics**: Charts automatically update based on your filters
- **Bulk Operations**: Select and delete multiple transactions at once

---

## 🔌 API Documentation

### Authentication

#### Signup
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Income

#### Upload Income CSV
```http
POST /api/income/upload-csv
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <csv-file>
```

#### Get Income Records
```http
GET /api/income?month=1&year=2025
Authorization: Bearer <token>
```

#### Get Income Summary
```http
GET /api/income/summary?year=2025
Authorization: Bearer <token>
```

### Bank Statements

#### Add Bank Account
```http
POST /api/bank-accounts
Authorization: Bearer <token>
Content-Type: application/json

{
  "accountName": "HDFC Savings",
  "accountNumber": "XXXX1234"
}
```

#### Upload Bank Statement CSV
```http
POST /api/transactions/upload-csv
Authorization: Bearer <token>
Content-Type: multipart/form-data

accountId: <account-id>
file: <csv-file>
```

#### Get Transactions
```http
GET /api/transactions?accountId=xxx&startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer <token>
```

For complete API documentation, see [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)

---

## 📁 Project Structure

```
finance-dashboard/
├── frontend/                # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── sections/       # Page design and showcase.
│   │   ├── services/       # API service functions
│   │   ├── utils/          # Helper functions
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
│
├── backend/                 # Node.js backend
│   ├── mongoserver.js           # Entry point
│   ├── package.json
│   └── .env
│
├── PROJECT_DOCUMENTATION.md # Detailed project docs
├── README.md               # This file
└── .gitignore
```

---

## 🗄️ Database Schema

### Users
```javascript
{
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### Income Records
```javascript
{
  userId: ObjectId,
  date: Date,
  source: String,
  category: String,
  amount: Number,
  notes: String
}
```

### Bank Accounts
```javascript
{
  userId: ObjectId,
  accountName: String,
  accountNumber: String,
  isActive: Boolean
}
```

### Bank Transactions
```javascript
{
  userId: ObjectId,
  accountId: ObjectId,
  date: Date,
  details: String,
  debit: Number,
  credit: Number,
  balance: Number,
  source: "CSV" | "MANUAL"
}
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 🐛 Known Issues

- Investment section is under development
- Mobile responsiveness needs improvement
- Email verification not implemented

See the [Issues](https://github.com/yourusername/finance-dashboard/issues) page for a complete list.

---

## 🔮 Roadmap

- [ ] Complete Investment tracking module
- [ ] Add export to PDF/Excel functionality
- [ ] Implement budget planning features
- [ ] Add mobile app (React Native)
- [ ] Integrate with bank APIs for automatic syncing
- [ ] Add bill reminders and notifications
- [ ] Multi-currency support
- [ ] Tax calculation tools

---


**Made with ❤️ for better financial management**

⭐ Star this repo if you find it helpful!
