// Define all chart initialization functions first
function initFinancialCharts() {
    // Common chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        circumference: 360,
        rotation: 90, // Start from the right
        plugins: {
            legend: {
                display: false // Hide the legend
            },
            tooltip: {
                enabled: false // Disable tooltips
            }
        },
        animation: {
            animateRotate: true,
            animateScale: false
        },
        cutout: '70%'
    };
    
    // Income Chart - Green (85% complete)
    if (document.getElementById('incomeChart')) {
        const incomeCtx = document.getElementById('incomeChart').getContext('2d');
        const incomeChart = new Chart(incomeCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [85, 15],
                    backgroundColor: [
                        '#77dd77', // Mint green
                        'transparent'
                    ],
                    borderWidth: 0
                }]
            },
            options: chartOptions
        });
    }
    
    // Expense Chart - Purple with small orange segment (95% purple, 5% orange)
    if (document.getElementById('expenseChart')) {
        const expenseCtx = document.getElementById('expenseChart').getContext('2d');
        const expenseChart = new Chart(expenseCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [65, 35],
                    backgroundColor: [
                        '#ff6961', // Red
                        'transparent'
                    ],
                    borderWidth: 0
                }]
            },
            options: chartOptions
        });
    }
    
    // Balance Chart - Yellow (25% complete)
    if (document.getElementById('balanceChart')) {
        const balanceCtx = document.getElementById('balanceChart').getContext('2d');
        const balanceChart = new Chart(balanceCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [25, 75],
                    backgroundColor: [
                        '#ffee8c', // Yellow
                        'transparent'
                    ],
                    borderWidth: 0
                }]
            },
            options: chartOptions
        });
    }
}

function initMonthlyComparisonChart() {
    if (document.getElementById('monthlyComparisonChart')) {
        const ctx = document.getElementById('monthlyComparisonChart').getContext('2d');
        
        const data = {
            labels: ['Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025'],
            datasets: [
                {
                    label: 'Income',
                    data: [7000, 5500, 8000, 7000], // Example values - adjust to match your actual data
                    backgroundColor: '#77dd77', // Green color
                    borderWidth: 0,
                    borderRadius: 4,
                    barPercentage: 0.7,
                    categoryPercentage: 0.5
                },
                {
                    label: 'Expense',
                    data: [4500, 5000, 5500, 4000], // Example values - adjust to match your actual data
                    backgroundColor: '#ff6961', // Coral/red color
                    borderWidth: 0,
                    borderRadius: 4,
                    barPercentage: 0.7,
                    categoryPercentage: 0.5
                }
            ]
        };
        
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Hide default legend
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: PHP ${context.raw.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: 'white',
                        font: {
                            size: 14
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        display: false,
                        callback: function(value) {
                            return value === 0 ? '0' : `${value/1000}k`;
                        }
                    }
                }
            }
        };
        
        console.log("Creating monthly chart..."); // Add debugging
        const monthlyChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: options
        });
    } else {
        console.error("monthlyComparisonChart element not found"); // Add debugging
    }
}

// Run all initializations after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    
    // Initialize all charts
    initFinancialCharts();
    initMonthlyComparisonChart();
});

document.addEventListener('DOMContentLoaded', function() {
    // Initialize progress bars
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
        const percentage = bar.getAttribute('data-percentage');
        bar.style.width = percentage + '%';
    });
    
    // Optional: Add animation for progress bars
    function animateProgressBars() {
        progressBars.forEach(bar => {
            const percentage = bar.getAttribute('data-percentage');
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.width = percentage + '%';
            }, 300);
        });
    }
    
    // Uncomment this line if you want animated progress bars on load
    // animateProgressBars();
    
    // Optional: Update progress bars with real data
    function updateProgressBar(category, percentage) {
        const bar = document.querySelector(`.${category} .progress-bar`);
        if (bar) {
            bar.setAttribute('data-percentage', percentage);
            bar.style.width = percentage + '%';
        }
    }
    
    // Example usage:
    // updateProgressBar('overall', 80);
});

document.getElementById('toggle-sidebar').addEventListener('click', function() {
    var sidebar = document.querySelector('.sidebar');
    var container = document.querySelector('.container');
  
    // Toggle the 'active' class to slide in/out the sidebar
    sidebar.classList.toggle('active');
    
    // Add a class to shift the main content when sidebar is visible
    container.classList.toggle('sidebar-active');
  });