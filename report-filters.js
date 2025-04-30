class ReportFilters {
  constructor() {
    this.userFilters = [];
  }

  initialize() {
    this.renderFiltersSection();
    this.setupEventListeners();
  }

  renderFiltersSection() {
    const summaryContainer = document.getElementById('selectionSummary');
    if (!summaryContainer) return;
    
    const existingButtonContainer = summaryContainer.querySelector('.button-container');
    if (existingButtonContainer) {
      const filtersSection = document.createElement('div');
      filtersSection.className = 'report-filters-section';
      filtersSection.innerHTML = `
        <h4>Report-Level Filters</h4>
        <p>These filters will be applied to all selected datasets when generating the report.</p>
        <div id="userFiltersContainer" class="filter-group"></div>
        <button type="button" class="btn btn-small" id="addUserFilter">+ Add Filter</button>
      `;
      
      summaryContainer.insertBefore(filtersSection, existingButtonContainer);
    }
  }

  setupEventListeners() {
    document.getElementById('addUserFilter')?.addEventListener('click', () => this.addUserFilter());
  }

  addUserFilter() {
    const container = document.getElementById('userFiltersContainer');
    const filterId = `userFilter-${Date.now()}`;
    
    const filterElement = document.createElement('div');
    filterElement.className = 'user-filter-item';
    filterElement.innerHTML = `
      <select class="user-filter-key">
        <option value="">Select Filter</option>
        <option value="userId">User ID</option>
        <option value="schoolId">School ID</option>
        <option value="dateRange">Date Range</option>
      </select>
      <input type="text" class="user-filter-value" placeholder="Value">
      <button type="button" class="btn btn-small btn-remove">×</button>
    `;
    
    container.appendChild(filterElement);
    
    filterElement.querySelector('.btn-remove').addEventListener('click', () => {
      container.removeChild(filterElement);
    });
  }

  getUserFilters() {
    const container = document.getElementById('userFiltersContainer');
    if (!container) return [];
    
    return Array.from(container.querySelectorAll('.user-filter-item'))
      .map(item => {
        const key = item.querySelector('.user-filter-key').value;
        const value = item.querySelector('.user-filter-value').value;
        return { key, value };
      })
      .filter(filter => filter.key && filter.value);
  }
}