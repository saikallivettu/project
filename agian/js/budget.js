document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const transactionForm = document.getElementById('add-transaction-form');
    const descriptionInput = document.getElementById('trans-description');
    const amountInput = document.getElementById('trans-amount');
    const typeInput = document.getElementById('trans-type');
    const transactionsList = document.getElementById('transactions-list');
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpensesEl = document.getElementById('total-expenses');
    const balanceEl = document.getElementById('balance');
    const budgetChartCanvas = document.getElementById('budget-chart');

    // App State
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let budgetChart;

    // Functions
    function addTransaction(e) {
        e.preventDefault();

        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const type = typeInput.value;

        if (description === '' || isNaN(amount) || amount <= 0) {
            alert('Please enter a valid description and amount.');
            return;
        }

        const transaction = {
            id: generateID(),
            description,
            amount,
            type
        };

        transactions.push(transaction);
        updateLocalStorage();
        updateUI();

        transactionForm.reset();
    }

    function removeTransaction(id) {
        transactions = transactions.filter(transaction => transaction.id !== id);
        updateLocalStorage();
        updateUI();
    }

    function updateUI() {
        transactionsList.innerHTML = '';
        let totalIncome = 0;
        let totalExpenses = 0;

        if (transactions.length === 0) {
            transactionsList.innerHTML = '<li class="list-group-item text-secondary">No transactions yet.</li>';
        } else {
            transactions.forEach(transaction => {
                const item = document.createElement('li');
                item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'mb-2', 'border-0');

                const isIncome = transaction.type === 'income';
                item.innerHTML = `
                    <span class="fw-bold">${transaction.description}</span>
                    <div>
                        <span class="badge ${isIncome ? 'bg-success' : 'bg-danger'} me-2">
                            ${isIncome ? '+' : '-'}$${transaction.amount.toFixed(2)}
                        </span>
                        <button class="btn btn-sm btn-outline-danger border-0" onclick="removeTransaction(${transaction.id})">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                `;
                transactionsList.appendChild(item);

                if (isIncome) {
                    totalIncome += transaction.amount;
                } else {
                    totalExpenses += transaction.amount;
                }
            });
        }

        const balance = totalIncome - totalExpenses;

        totalIncomeEl.textContent = `$${totalIncome.toFixed(2)}`;
        totalExpensesEl.textContent = `$${totalExpenses.toFixed(2)}`;
        balanceEl.textContent = `$${balance.toFixed(2)}`;

        // Update balance color
        balanceEl.classList.remove('text-success', 'text-danger', 'text-white');
        if (balance > 0) {
            balanceEl.classList.add('text-success');
        } else if (balance < 0) {
            balanceEl.classList.add('text-danger');
        } else {
            balanceEl.classList.add('text-white');
        }

        updateChart(totalIncome, totalExpenses);
    }

    function updateChart(income, expenses) {
        const ctx = budgetChartCanvas.getContext('2d');
        const chartData = {
            labels: ['Income', 'Expenses'],
            datasets: [{
                data: [income, expenses],
                backgroundColor: ['#198754', '#dc3545'],
                borderColor: ['#198754', '#dc3545'],
                borderWidth: 1
            }]
        };

        if (budgetChart) {
            budgetChart.data.datasets[0].data = [income, expenses];
            budgetChart.update();
        } else {
            budgetChart = new Chart(ctx, {
                type: 'doughnut',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#ffffff'
                            }
                        }
                    }
                }
            });
        }
    }

    function generateID() {
        return Math.floor(Math.random() * 1000000);
    }

    function updateLocalStorage() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    // Initial Setup
    function init() {
        transactionForm.addEventListener('submit', addTransaction);
        // Make removeTransaction globally accessible for the onclick attribute
        window.removeTransaction = removeTransaction;
        updateUI();
    }

    init();
});