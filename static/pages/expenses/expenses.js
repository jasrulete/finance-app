// Set current date and initialize categories
document.addEventListener('DOMContentLoaded', function() {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  document.getElementById('date').value = formattedDate;
  
  // Define category options for income and expense
  const incomeCategories = [
    { value: "", text: "Select a Category", disabled: true, selected: true },
    { value: "salary", text: "Salary" },
    { value: "bonus", text: "Bonus" },
    { value: "business", text: "Business" },
  ];

  const expenseCategories = [
      { value: "", text: "Select a Category", disabled: true, selected: true },
      { value: "grocery", text: "Grocery" },
      { value: "bills", text: "Bills" },
      { value: "health", text: "Health" },
      { value: "food", text: "Food" },
      { value: "eating-out", text: "Eating Out" },
      { value: "gifts", text: "Gifts" },
      { value: "transportation", text: "Transportation" },
  ];
  
  // Default to Income button active and set initial categories
  document.getElementById('income-btn').classList.add('active');
  populateCategories(incomeCategories);
  
  // Initialize calculator display
  document.getElementById('amount-display').textContent = "₱";
  
  // Toggle between Income and Expense
  document.getElementById('income-btn').addEventListener('click', function() {
      this.classList.add('active');
      document.getElementById('expense-btn').classList.remove('active');
      populateCategories(incomeCategories);
  });
  
  document.getElementById('expense-btn').addEventListener('click', function() {
      this.classList.add('active');
      document.getElementById('income-btn').classList.remove('active');
      populateCategories(expenseCategories);
  });
  
  // Function to populate category dropdown based on type
  function populateCategories(categories) {
      const categorySelect = document.getElementById('category');
      // Clear existing options
      categorySelect.innerHTML = '';
      
      // Add new options
      categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category.value;
          option.textContent = category.text;
          if (category.disabled) option.disabled = true;
          if (category.selected) option.selected = true;
          categorySelect.appendChild(option);
      });
  }
  
  // Initialize the expense chart if it exists on the page
  if (document.getElementById('expense-pie-chart')) {
      initializeExpenseChart();
      updateChartWithRealData();
  }
  
  // Connect the Add Expense button to the form if it exists
  const addExpenseBtn = document.getElementById('add-expense-btn');
  if (addExpenseBtn) {
      addExpenseBtn.addEventListener('click', function() {
          // Scroll to the form
          document.getElementById('entry-form').scrollIntoView({ behavior: 'smooth' });
          // Auto-select expense
          document.getElementById('expense-btn').click();
      });
  }
  
  // Form submission
  document.getElementById('submit-btn').addEventListener('click', function() {
      const entryName = document.getElementById('entry-name').value;
      const category = document.getElementById('category').value;
      const notes = document.getElementById('notes').value;
      const amount = currentValue;
      const type = document.getElementById('income-btn').classList.contains('active') ? 'income' : 'expense';
      
      if (!entryName) {
          alert('Please enter a title for this entry');
          return;
      }
      
      if (!category) {
          alert('Please select a category');
          return;
      }
      
      if (!amount) {
          alert('Please enter an amount');
          return;
      }
      
      // Create entry object
      const entry = {
          title: entryName,
          category: category,
          date: document.getElementById('date').value,
          notes: notes,
          amount: amount,
          type: type,
          timestamp: new Date().getTime()
      };
      
      // Save entry to localStorage
      saveExpenseEntry(entry);
      
      // Log the entry for debugging
      console.log('Entry added:', entry);
      
      // Update chart if it exists
      if (document.getElementById('expense-pie-chart')) {
          updateChartWithRealData();
      }
      
      alert('Entry added successfully!');
      
      // Reset form
      document.getElementById('entry-name').value = '';
      document.getElementById('category').selectedIndex = 0;
      document.getElementById('notes').value = '';
      currentValue = '';
      document.getElementById('amount-display').textContent = '₱';
  });
});

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
      'food': '#ebe986',
      'transportation': '#c5bfe0',
      'bills': '#e5d8c9',
      'grocery': '#b5e8f7',
      'health': '#f4b9b9',
      'entertainment': '#e3cd74',
      'other_expense': '#f4c572',
      'housing': '#a2d2a4',
      'utilities': '#c2e8ce'
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
  // Sample data for initial rendering
  const initialData = {
      labels: ['Food', 'Transportation', 'Bills', 'Grocery', 'Health', 'Entertainment', 'Other'],
      datasets: [{
          data: [25, 15, 20, 18, 7, 10, 5], // Sample percentages
          backgroundColor: [
              '#ebe986', // Food
              '#c5bfe0', // Transportation
              '#e5d8c9', // Bills
              '#b5e8f7', // Grocery
              '#f4b9b9', // Health
              '#e3cd74', // Entertainment
              '#f4c572'  // Other
          ],
          borderWidth: 0
      }]
  };
  
  // Configuration for the pie chart
  const config = {
      type: 'pie',
      data: initialData,
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
                          return context.raw + '%';
                      },
                      title: function() {
                        return ''; // Remove the label (title)
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
  
  // Create the pie chart
  const ctx = document.getElementById('expense-pie-chart').getContext('2d');
  expensePieChart = new Chart(ctx, config);
}

function updateChartWithRealData() {
  // If chart isn't initialized or element doesn't exist, do nothing
  if (!expensePieChart || !document.getElementById('expense-pie-chart')) {
      return;
  }
  
  const chartData = getChartData();
  
  // Update chart with real data
  expensePieChart.data.labels = chartData.labels;
  expensePieChart.data.datasets[0].data = chartData.datasets[0].data;
  expensePieChart.data.datasets[0].backgroundColor = chartData.datasets[0].backgroundColor;
  expensePieChart.update();
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