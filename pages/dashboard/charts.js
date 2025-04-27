document.addEventListener('DOMContentLoaded', function() {
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
    
    // Expense Chart - Purple with small orange segment (95% purple, 5% orange)
    const expenseCtx = document.getElementById('expenseChart').getContext('2d');
    const expenseChart = new Chart(expenseCtx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [65, 35],
                backgroundColor: [
                    '#ff6961', // Purple
                    'transparent'
                ],
                borderWidth: 0
            }]
        },
        options: chartOptions
    });
    
    // Balance Chart - Yellow (25% complete)
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
});