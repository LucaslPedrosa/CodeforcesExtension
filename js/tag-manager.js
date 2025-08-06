export const TagManager = {
  selectedTags: new Set(),
  filterMode: 'OR', // 'AND' or 'OR'

  init() {
    const tagSelector = document.getElementById('tagSelector');
    tagSelector.addEventListener('change', (e) => {
      if (e.target.value) {
        this.addTag(e.target.value);
        e.target.value = ''; // Reset selector
      }
    });

    // Initialize toggle switch
    const toggleSwitch = document.getElementById('tagFilterMode');
    toggleSwitch.addEventListener('change', (e) => {
      this.filterMode = e.target.checked ? 'OR' : 'AND';
      console.log('Tag filter mode changed to:', this.filterMode);
    });

    // Set initial state (checked = OR, unchecked = AND)
    this.filterMode = toggleSwitch.checked ? 'OR' : 'AND';
  },

  addTag(tag) {
    if (!this.selectedTags.has(tag)) {
      this.selectedTags.add(tag);
      this.renderTags();
    }
  },

  removeTag(tag) {
    this.selectedTags.delete(tag);
    this.renderTags();
  },

  renderTags() {
    const container = document.getElementById('selectedTags');
    container.innerHTML = '';

    this.selectedTags.forEach(tag => {
      const tagElement = document.createElement('div');
      tagElement.className = 'tag-item';
      
      const tagText = document.createElement('span');
      tagText.textContent = tag;
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'tag-remove';
      removeBtn.innerHTML = '×';
      removeBtn.title = `Remove ${tag}`;
      removeBtn.addEventListener('click', () => this.removeTag(tag));
      
      tagElement.appendChild(tagText);
      tagElement.appendChild(removeBtn);
      container.appendChild(tagElement);
    });
  },

  getSelectedTags() {
    return Array.from(this.selectedTags);
  },

  getFilterMode() {
    return this.filterMode;
  },

  clearTags() {
    this.selectedTags.clear();
    this.renderTags();
  }
};
