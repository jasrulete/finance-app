# BudgetWise (Personal Budget Tracker)

A web application to help users manage their income, expense, and financial goals.

---

## Setup Instructions
1. **Clone the repository**:
  git clone https://github.com/jasrulete/finance-app.git
2. **Navigate to the project directory**:
  cd finance-app
3. **Install the dependencies**:
   pip install -r requirements.txt
4. **Run the website**:
   python manage.py runserver

## Feature List
1) **User Authentication**
   - Sign up, log in, and log out securely.
2) **Dashboard**
   - Overview of total income, expenses, and balance.
   - Bar graph to reflect monthly income and expenses over time.
   - Pie chart to show expenses by category.
3) **Transactions**
   - Add, edit, or delete income/expense entries.
   - Categorize transactions (e.g., Bills, Grocery, Salary, Bonus)
4) **Reports**
   - Generate your financial overview.
   - Filter transactions by date or category
   
## User Guide
1. **Registration & Login**
   - *New Users*: Click "Sign Up" and fill in your username, email, and password.
   - *Existing Users*: Click "Log In" and enter your credentials.
2. **Dashboard View**
   - After logging in, the dashboard displays: *Total Income*, *Total Balance*, *Remaining Balance*, *Financial Overview*
3. **Adding a Transaction**
   - Go to *Expenses* page through the sidebar navigation.
   - Navigate to the "Add an Entry" section.
   - Select Income or Expense.
   - Fill in: Title, Category, Date, Amount, Notes (optional)
   - Click **"Add Entry"**
4. **Editing or Deleting Transactions**
   - On the *Transactions* page:
     - Click the **Edit** (✏️) icon to modify a transaction.
     - Click the **Delete** (🗑️) icon to remove a transaction.
5. **Generating Reports**
   - Go to *Export* page through the sidebar navigation.
   - Select a date range, type, and/or category.
   - Click *"Generate Report"* to download financial data.
