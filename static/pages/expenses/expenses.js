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
  
  // Form validation and submission
  document.getElementById('submit-btn').addEventListener('click', function(e) {
    e.preventDefault(); // Prevent default form submission
    
    // Get form elements
    const entryNameField = document.getElementById('entry-name');
    const categoryField = document.getElementById('category');
    const notesField = document.getElementById('notes');
    const amountDisplay = document.getElementById('amount-display');
    
    // Get values
    const entryName = entryNameField.value;
    const category = categoryField.value;
    const notes = notesField.value;
    const amount = currentValue;
    const type = document.getElementById('income-btn').classList.contains('active') ? 'income' : 'expense';
    
    // Clear previous error states
    clearValidationErrors();
    
    // Validate form fields
    let isValid = true;
    
    if (!entryName) {
        showValidationError(entryNameField, 'Please enter a title for this entry');
        isValid = false;
    }
    
    if (!category) {
        showValidationError(categoryField, 'Please select a category');
        isValid = false;
    }
    
    if (!amount) {
        amountDisplay.parentElement.classList.add('error-field');
          
        // Add focus/click event listener to clear error when user interacts with the amount field
        amountDisplay.parentElement.addEventListener('click', function() {
            this.classList.remove('error-field');
        }, { once: true });
        
        isValid = false;
    }
    
    // If validation fails, stop here
    if (!isValid) {
        // Scroll to the first error
        const firstError = document.querySelector('.error-message');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
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
    
    // Show success message
    showSuccessMessage('Entry added successfully!');
    
    // Reset form
    resetForm();
  });

  // Function to show validation error
  function showValidationError(element, message) {
    // Add error class to highlight the field
    element.classList.add('error-field');
    
    // Create error message element
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    errorMessage.style.color = '#d9534f';
    errorMessage.style.fontSize = '0.85rem';
    errorMessage.style.marginTop = '0.25rem';
    
    // Insert error message after the element
    element.parentNode.insertBefore(errorMessage, element.nextSibling);
    
    // Add focus event listener to clear error when user interacts with the field
    element.addEventListener('focus', function() {
        this.classList.remove('error-field');
        const nextSibling = this.nextSibling;
        if (nextSibling && nextSibling.classList && nextSibling.classList.contains('error-message')) {
            nextSibling.remove();
        }
    }, { once: true });
  }

  // Function to clear all validation errors
  function clearValidationErrors() {
    // Remove error class from all elements
    const errorFields = document.querySelectorAll('.error-field');
    errorFields.forEach(field => field.classList.remove('error-field'));
    
    // Remove all error messages
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(message => message.remove());
  }

  // Function to show success message
  function showSuccessMessage(message) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '1rem';
        toastContainer.style.right = '1rem';
        toastContainer.style.zIndex = '1000';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    toast.style.backgroundColor = '#5cb85c';
    toast.style.color = 'white';
    toast.style.padding = '0.75rem 1.25rem';
    toast.style.borderRadius = '0.25rem';
    toast.style.marginTop = '0.5rem';
    toast.style.boxShadow = '0 0.25rem 0.75rem rgba(0, 0, 0, 0.1)';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease-in-out';
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Trigger reflow to enable animation
    void toast.offsetWidth;
    
    // Show toast
    toast.style.opacity = '1';
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
  }

  // Function to reset form
  function resetForm() {
    document.getElementById('entry-name').value = '';
    document.getElementById('category').selectedIndex = 0;
    document.getElementById('notes').value = '';
    currentValue = '';
    document.getElementById('amount-display').textContent = '₱';
  }

  // Add CSS for error styling
  (function addErrorStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .error-field {
            border-color: #d9534f !important;
            box-shadow: 0 0 0 0.2rem rgba(217, 83, 79, 0.25) !important;
        }
        
        @keyframes slideIn {
            from { transform: translateY(1rem); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .success-toast {
            animation: slideIn 0.3s ease-in-out;
        }
    `;
    document.head.appendChild(style);
  })();
  initSidebar();
});

// Toggle sidebar functionality
function initSidebar() {
  console.log("Initializing sidebar toggle...");
  
  const toggleButton = document.getElementById('toggle-sidebar');
  if (!toggleButton) {
    console.warn("Sidebar toggle button not found");
    return;
  }
  
  toggleButton.addEventListener('click', function() {
    console.log("Sidebar toggle button clicked");
    const sidebar = document.querySelector('.sidebar');
    const container = document.querySelector('.container');
    
    if (sidebar && container) {
      sidebar.classList.toggle('active');
      container.classList.toggle('sidebar-active');
    } else {
      console.error("Sidebar or container elements not found");
    }
  });
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
  // Sample data for initial rendering
  const initialData = {
      labels: ['Food', 'Transportation', 'Bills', 'Grocery', 'Health', 'Eating Out', 'Gifts'],
      datasets: [{
          data: [25, 15, 20, 18, 7, 10, 5], // Sample percentages
          backgroundColor: [
              '#f6f3a9', // Food
              '#d5d1e9', // Transportation
              '#e7d7ca', // Bills
              '#d5f6fb', // Grocery
              '#f1beb5', // Health
              '#e7d27c', // Eating Out
              '#f8c57c'  // Gifts
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