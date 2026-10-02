# Expense Tracker

Expense Tracker is a web application for managing personal expenses.
Users can add, edit, delete, and filter expenses, while viewing the total amount, number of expenses, and highest expense.


## How to run



**Backend**

### Backend

1. Open the project folder in VS Code.
2. Open PostgreSQL using pgAdmin.
3. Create a database named `expense_tracker`.
4. Open the Query Tool for the `expense_tracker` database.
5. Open `backend/schema.sql`.
6. Run the SQL code from `schema.sql`.
7. Open the `backend` folder in the terminal.
8. Install the required packages:npm install
9. Create a file named .env inside the backend folder.
10. Add your PostgreSQL connection information:
    DB_USER=postgres
    DB_HOST=localhost
    DB_NAME=expense_tracker
    DB_PASSWORD=your_password
    DB_PORT=5432
11. Start the backend:node server.js


**Frontend**

1. Open the frontend folder in VS Code.
2. Open frontend/index.html.
3. Right-click on index.html.
4. Select Open with Live Server.
5. The Expense Tracker application will open in the browser.

## Features


- [*] Add an expense (with validation)
- [*] Delete an expense
- [*] Edit an expense
- [*] Filter by category
- [*] Summary cards (total, count, highest)
- [*] Data is saved in a PostgreSQL database

## Screenshots
(image.png)
(image-1.png)

## What was the hardest part?


The hardest part was making the application fully responsive for different screen sizes. I tried different CSS solutions, but the responsive design did not work perfectly, especially on mobile screens.

## GitHub Repository

[View the project on GitHub](https://github.com/eidalakhras/expense-tracker)