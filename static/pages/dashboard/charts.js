// Chart configuration utilities
const chartUtils = {
    // Default chart options that can be extended
    getDefaultChartOptions: function(customOptions = {}) {
      const defaultOptions = {
        responsive: true,
        maintainAspectRatio: true,
        circumference: 360,
        rotation: 90, // Start from the right
        plugins: {
          legend: {
            display: false // Hide the legend by default
          },
          tooltip: {
            enabled: true, // Enable tooltips by default
            callbacks: {
              label: function(context) {
                return `${context.dataset.label || ''}: ${context.parsed}%`;
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          animateScale: false
        },
        cutout: '70%'
      };
      
      // Merge default options with custom options
      return Object.assign({}, defaultOptions, customOptions);
    },
    
    // Safe method to get canvas context
    getCanvasContext: function(canvasId) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) {
        console.error(`Canvas element with ID '${canvasId}' not found`);
        return null;
      }
      return canvas.getContext('2d');
    },
    
    // Create a chart safely
    createChart: function(canvasId, type, data, customOptions = {}) {
      const ctx = this.getCanvasContext(canvasId);
      if (!ctx) return null;
      
      try {
        const options = this.getDefaultChartOptions(customOptions);
        return new Chart(ctx, {
          type: type,
          data: data,
          options: options
        });
      } catch (error) {
        console.error(`Error creating chart '${canvasId}':`, error);
        return null;
      }
    }
  };

  

  
  // Initialize progress bars
  function initProgressBars() {
    console.log("Initializing progress bars...");
    
    const progressBars = document.querySelectorAll('.progress-bar');
    if (progressBars.length === 0) {
      console.warn("No progress bars found on the page");
      return;
    }
    
    progressBars.forEach(bar => {
      const percentage = bar.getAttribute('data-percentage');
      if (percentage) {
        // Start with zero width
        bar.style.width = '0%';
        
        // Animate to target percentage
        setTimeout(() => {
          bar.style.width = percentage + '%';
        }, 300);
      } else {
        console.warn("Progress bar without data-percentage attribute", bar);
      }
    });
  }
  
  // Update a specific progress bar
  function updateProgressBar(category, percentage) {
    if (!category || percentage === undefined) {
      console.error("Invalid parameters for updateProgressBar");
      return;
    }
    
    const bar = document.querySelector(`.${category} .progress-bar`);
    if (bar) {
      bar.setAttribute('data-percentage', percentage);
      bar.style.width = percentage + '%';
    } else {
      console.error(`Progress bar for category '${category}' not found`);
    }
  }
  
  // Toggle sidebar functionality
  function initSidebar() {
    console.log("Initializing sidebar toggle...");
    
    const toggleButton = document.getElementById('toggle-sidebar');
    if (!toggleButton) {
      console.warn("Sidebar toggle button not found");
      return;
    }
    
    toggleButton.addEventListener('click', function() {
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
  
  // Run all initializations after DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    
    try {
      // Initialize all components
      initProgressBars();
      initSidebar();
      
      console.log("All initializations complete");
    } catch (error) {
      console.error("Error during initialization:", error);
    }
  });