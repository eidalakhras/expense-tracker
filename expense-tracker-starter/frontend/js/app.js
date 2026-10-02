// Expense Tracker - frontend logic

// PHASE 2
// Your backend from Phase 1 is already running, with real expenses in the
// database (from schema.sql). Build this page directly against it with
// fetch and async/await - there is no in-memory or localStorage stage
// this time, and no sample data file.
//
// A possible structure (change it if you have a better idea):
//   - async function getExpenses()          fetch(API_URL), return the JSON
//   - async function addExpense(data)       fetch(API_URL, { method: "POST", ... })
//   - async function updateExpense(id,data) fetch(API_URL + "/" + id, { method: "PUT", ... })
//   - async function deleteExpense(id)      fetch(API_URL + "/" + id, { method: "DELETE" })
//   - async function refresh()              get the list, then call renderTable and renderSummary
//   - renderTable(list)                     build the table rows from the array the API returned
//   - renderSummary(list)                   update the summary cards
//   - applyFilter()                         re-render with the list filtered by category
//
// Don't forget:
//   - Show a Bootstrap spinner while a request is in flight.
//   - Wrap every fetch call in try/catch, and show a Bootstrap alert on failure.
//   - After add, edit, or delete, call refresh() so the page always shows
//     what the server actually saved - never update the table by hand.
//   - The API is at http://localhost:3000/api/expenses (see the Roadmap).

const API_URL = "http://localhost:3000/api/expenses";
async function getExpenses() {
    const spinner = document.getElementById("loadingSpinner");

    try {
        spinner.classList.remove("d-none");

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch expenses");
        }

        const data = await response.json();

        return data;

    }
    catch (error) {
        console.error(error);
        showAlert("Unable to connect to the server.");
        return [];
    }
    finally {
        spinner.classList.add("d-none");
    }
}
function renderTable(expenses) {
    const tableBody = document.getElementById("expensesTableBody");

    tableBody.innerHTML = "";

    expenses.forEach(expense => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${expense.title}</td>
            <td>${expense.amount}</td>
<td>
    <span class="badge bg-primary">
        ${expense.category}
    </span>
</td>            <td>${expense.date}</td>
            <td>
                <button class="btn btn-sm btn-warning edit-btn" data-id="${expense.id}">
    Edit
</button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${expense.id}">
    Delete
</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}
function renderSummary(expenses) {
    const totalAmount = expenses.reduce((sum, expense) => {
        return sum + expense.amount;
    }, 0);

    const expenseCount = expenses.length;

    const highestExpense = expenses.length > 0
        ? Math.max(...expenses.map(expense => expense.amount))
        : 0;

    document.getElementById("totalAmount").textContent = totalAmount.toFixed(2);
    document.getElementById("expenseCount").textContent = expenseCount;
    document.getElementById("highestExpense").textContent = highestExpense.toFixed(2);
}
async function refresh() {
    const expenses = await getExpenses();

    renderTable(expenses);
    renderSummary(expenses);
}
function showAlert(message) {
    const alertContainer = document.getElementById("alertContainer");

    alertContainer.innerHTML = `
        <div class="alert alert-danger" role="alert">
            ${message}
        </div>
    `;
}
refresh();
let expenseToDeleteId = null;

document.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-btn")) {

        expenseToDeleteId = event.target.dataset.id;

        const deleteModal = new bootstrap.Modal(
            document.getElementById("deleteModal")
        );

        deleteModal.show();
    }
});


document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {

    if (!expenseToDeleteId) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${expenseToDeleteId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        await refresh();

        const modalElement = document.getElementById("deleteModal");
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();

        expenseToDeleteId = null;

    } catch (error) {
        console.error(error);
        showAlert(error.message);
    }
});
document.addEventListener("click", async (event) => {

    if (event.target.classList.contains("edit-btn")) {

        const id = event.target.dataset.id;
        event.target.classList.add("active");

        try {
            const response = await fetch(`${API_URL}/${id}`);

            if (!response.ok) {
                throw new Error("Failed to get expense");
            }

            const expense = await response.json();

            document.getElementById("editTitle").value = expense.title;
            document.getElementById("editAmount").value = expense.amount;
            document.getElementById("editCategory").value = expense.category;
            document.getElementById("editDate").value = expense.date;

            const modal = new bootstrap.Modal(
                document.getElementById("editModal")
            );

            modal.show();

        } catch (error) {
            console.error(error);
            showAlert(error.message);
        }
    }
});
const editForm = document.getElementById("editForm");

editForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Clear old errors
    document.getElementById("editTitleError").textContent = "";
    document.getElementById("editAmountError").textContent = "";
    document.getElementById("editCategoryError").textContent = "";
    document.getElementById("editDateError").textContent = "";

    const activeButton = document.querySelector(".edit-btn.active");

    if (!activeButton) {
        return;
    }

    const id = activeButton.dataset.id;

    const title = document.getElementById("editTitle").value.trim();
    const amount = Number(document.getElementById("editAmount").value);
    const category = document.getElementById("editCategory").value;
    const date = document.getElementById("editDate").value;

    let isValid = true;

    if (!title) {
        document.getElementById("editTitleError").textContent =
            "Title is required";
        isValid = false;
    }

    if (!amount || amount <= 0) {
        document.getElementById("editAmountError").textContent =
            "Amount must be greater than 0";
        isValid = false;
    }

    if (!category) {
        document.getElementById("editCategoryError").textContent =
            "Please select a category";
        isValid = false;
    }

    if (!date) {
        document.getElementById("editDateError").textContent =
            "Date is required";
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    const data = {
        title: title,
        amount: amount,
        category: category,
        date: date
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        await refresh();

        const modalElement = document.getElementById("editModal");
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();

    }  catch (error) {
    console.error(error);
    showAlert(error.message);
}
});
const categoryFilter = document.getElementById("categoryFilter");

categoryFilter.addEventListener("change", async () => {
    const expenses = await getExpenses();

    const selectedCategory = categoryFilter.value;

    if (selectedCategory === "All") {
        renderTable(expenses);
    } else {
        const filteredExpenses = expenses.filter(expense => {
            return expense.category === selectedCategory;
        });

        renderTable(filteredExpenses);
    }
});
const expenseForm = document.getElementById("expenseForm");

expenseForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Clear old errors
    document.getElementById("titleError").textContent = "";
    document.getElementById("amountError").textContent = "";
    document.getElementById("categoryError").textContent = "";
    document.getElementById("dateError").textContent = "";

    const title = document.getElementById("title").value.trim();
    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    let isValid = true;

    if (!title) {
        document.getElementById("titleError").textContent =
            "Title is required";
        isValid = false;
    }

    if (!amount || amount <= 0) {
        document.getElementById("amountError").textContent =
            "Amount must be greater than 0";
        isValid = false;
    }

    if (!category) {
        document.getElementById("categoryError").textContent =
            "Please select a category";
        isValid = false;
    }

    if (!date) {
        document.getElementById("dateError").textContent =
            "Date is required";
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    const data = {
        title: title,
        amount: amount,
        category: category,
        date: date
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        expenseForm.reset();

        await refresh();

    } catch (error) {
    console.error(error);
    showAlert(error.message);
}
});