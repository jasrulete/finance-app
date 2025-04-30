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
      
      // Here you would typically save the data to your backend
      // For now, we'll just log it to the console and show an alert
      console.log({
          title: entryName,
          category: category,
          date: document.getElementById('date').value,
          notes: notes,
          amount: amount,
          type: type
      });
      
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