// Set current date
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    document.getElementById('date').value = "Today";
    
    // Default to Income button active
    document.getElementById('income-btn').classList.add('active');
  });
  
  // Toggle between Income and Expense
  document.getElementById('income-btn').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('expense-btn').classList.remove('active');
  });
  
  document.getElementById('expense-btn').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('income-btn').classList.remove('active');
  });
  
  // Calculator functionality
  let currentValue = "";
  const display = document.getElementById('amount-display');
  
  function appendToDisplay(value) {
    // If display only shows the peso sign, clear it first
    if (display.textContent === "₱" || display.textContent === "Error") {
      currentValue = value;
    } else {
      currentValue += value;
    }
    updateDisplay();
  }
  
  function appendOperator(operator) {
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
      
      const result = eval(currentValue);
      currentValue = result.toString();
      updateDisplay();
    } catch (error) {
      display.textContent = "Error";
      currentValue = "";
    }
  }
  
  function updateDisplay() {
    display.textContent = "₱" + currentValue;
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
      date: "Today",
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
    display.textContent = '₱';
  });