// Set current date and initialize categories
document.addEventListener('DOMContentLoaded', function() {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  document.getElementById('date').value = formattedDate;
  
  // Initialize category dropdowns and calculator as before
  // ... (keep all your existing code for dropdowns and calculator)
  
  // Initialize the expense chart if it exists on the page
  if (document.getElementById('expense-pie-chart')) {
      initializeExpenseChart();
  }
  
  // Update the welcome message with current month
  const welcomeMessage = document.querySelector('.welcome-message p');
  if (welcomeMessage) {
      welcomeMessage.textContent = `Record your ${'{{ current_month }}'} expenses and maintain control over your finances.`;
  }
  
  // Add total expenses display
  const totalExpenses = parseFloat('{{ total_expenses }}') || 0;
  const pieChartContainer = document.querySelector('.pie-chart-container');
  if (pieChartContainer) {
      const totalDisplay = document.createElement('div');
      totalDisplay.className = 'total-expenses-display';
      totalDisplay.innerHTML = `
          <div class="total-label">TOTAL EXPENSES</div>
          <div class="total-amount">₱${totalExpenses.toFixed(2)}</div>
          <div class="total-month">${'{{ current_month }}'}</div>
      `;
      pieChartContainer.insertBefore(totalDisplay, pieChartContainer.firstChild);
  }
});


// Sidebar toggle functionality (Refactored)
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const container = document.querySelector('.container');
  
  if (sidebar && container) {
    sidebar.classList.toggle('active');
    container.classList.toggle('sidebar-active');
  } else {
    console.error("Sidebar or container elements not found");
  }
}

function initSidebar() {
  console.log("Checking for sidebar toggle...");
  const toggleButton = document.getElementById('toggle-sidebar');
  
  if (toggleButton) {
      console.log("Sidebar toggle button found");
      toggleButton.addEventListener('click', function() {
          console.log("Sidebar toggle button clicked");
          toggleSidebar();
      });
  }
  // If toggle button doesn't exist, do nothing (no error)
}


// Calculator functionality
let currentValue = "";

function appendToDisplay(value) {
  const display = document.getElementById('amount-display');
  // If display only shows the peso sign, clear it first
  if (display.textContent === "₱" || display.textContent === "Error") {
      currentValue = value;
  } else {
      currentValue += value;
  }
  updateDisplay();
}

function appendOperator(operator) {
  const display = document.getElementById('amount-display');
  // Don't add operator if display is empty or just shows peso sign
  if (currentValue === "" || display.textContent === "₱") {
      return;
  }
  
  // Check if the last character is already an operator
  const lastChar = currentValue.slice(-1);
  if (['+', '-', '*', '/'].includes(lastChar)) {
      currentValue = currentValue.slice(0, -1) + operator;
  } else {
      currentValue += operator;
  }
  updateDisplay();
}

function calculate() {
  const display = document.getElementById('amount-display');
  try {
      // Don't evaluate if empty
      if (currentValue === "") {
          return;
      }
      
      // Check if the last character is an operator
      const lastChar = currentValue.slice(-1);
      if (['+', '-', '*', '/'].includes(lastChar)) {
          currentValue = currentValue.slice(0, -1);
      }
      
      // Using Function constructor instead of eval for better security
      const result = new Function('return ' + currentValue)();
      currentValue = result.toString();
      updateDisplay();
  } catch (error) {
      display.textContent = "Error";
      currentValue = "";
  }
}

function updateDisplay() {
  const display = document.getElementById('amount-display');
  display.textContent = "₱" + currentValue;
}

function clearDisplay() {
  currentValue = "";
  document.getElementById('amount-display').textContent = "₱";
}

// -------------------- EXPENSE CHART FUNCTIONALITY --------------------

// Data Storage Functions
function saveExpenseEntry(entry) {
  // Get existing entries or initialize empty array
  const entries = JSON.parse(localStorage.getItem('expenseEntries')) || [];
  
  // Add new entry
  entries.push(entry);
  
  // Save back to localStorage
  localStorage.setItem('expenseEntries', JSON.stringify(entries));
}

function getAllEntries() {
  return JSON.parse(localStorage.getItem('expenseEntries')) || [];
}

function getEntriesByType(type) {
  const entries = getAllEntries();
  return entries.filter(entry => entry.type === type);
}

// Chart Data Functions
function calculateCategoryTotals(type = 'expense') {
  const entries = getEntriesByType(type);
  const categories = {};
  
  entries.forEach(entry => {
      if (!categories[entry.category]) {
          categories[entry.category] = 0;
      }
      categories[entry.category] += parseFloat(entry.amount);
  });
  
  return categories;
}

function getChartData() {
  const categoryTotals = calculateCategoryTotals('expense');
  const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0) || 1; // Avoid division by zero
  
  // Define category colors - match these with your icons
  const categoryColors = {
      'food': '#f6f3a9',
      'transportation': '#d5d1e9',
      'bills': '#e7d7ca',
      'grocery': '#d5f6fb',
      'health': '#f1beb5',
      'eating out' : '#e7d27c',
      'gifts': '#f8c57c',
  };
  
  const labels = Object.keys(categoryTotals);
  const data = labels.map(label => ((categoryTotals[label] / total) * 100).toFixed(1));
  const backgroundColor = labels.map(label => categoryColors[label] || '#cccccc');
  
  return {
      labels: labels,
      datasets: [{
          data: data,
          backgroundColor: backgroundColor,
          borderWidth: 0
      }]
  };
}

// Chart Initialization
let expensePieChart;

function initializeExpenseChart() {
  // Get data from Django template
  const categories = JSON.parse('{{ categories|safe|escapejs }}');
  const amounts = JSON.parse('{{ amounts|safe|escapejs }}');
  const colors = JSON.parse('{{ colors|safe|escapejs }}');
  
  console.log("Chart data:", {categories, amounts, colors}); // Debug log
  
  // Calculate percentages
  const total = amounts.reduce((sum, val) => sum + val, 0) || 1;
  const percentages = amounts.map(amount => ((amount / total) * 100).toFixed(1));
  
  const chartData = {
      labels: categories,
      datasets: [{
          data: percentages,
          backgroundColor: colors,
          borderWidth: 0
      }]
  };
  
  const config = {
      type: 'pie',
      data: chartData,
      options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
              legend: {
                  display: false,
              },
              tooltip: {
                  callbacks: {
                      label: function(context) {
                          const label = context.label || '';
                          const value = context.raw || 0;
                          const amount = amounts[context.dataIndex];
                          return `${label}: ${value}% (₱${amount.toFixed(2)})`;
                      },
                      title: function() {
                          return '';
                      },
                  },
                  displayColors: false
              },
              datalabels: {
                  color: '#000',
                  formatter: function (value, context) {
                      const label = context.chart.data.labels[context.dataIndex];
                      return label.toUpperCase();
                  },
                  font: {
                      size: 18,
                      family: 'K2D',
                  },
              }
          }
      },
      plugins: [ChartDataLabels]
  };
  
  const ctx = document.getElementById('expense-pie-chart').getContext('2d');
  if (window.expensePieChart) {
      window.expensePieChart.destroy();
  }
  window.expensePieChart = new Chart(ctx, config);
}

// Summary Functions
function getExpenseSummary() {
  const entries = getAllEntries();
  const expenses = entries.filter(entry => entry.type === 'expense');
  const income = entries.filter(entry => entry.type === 'income');
  
  const totalExpense = expenses.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
  const totalIncome = income.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
  
  return {
      totalExpense: totalExpense,
      totalIncome: totalIncome,
      balance: totalIncome - totalExpense,
      expenseCount: expenses.length,
      incomeCount: income.length,
      categoryBreakdown: calculateCategoryTotals('expense')
  };
}