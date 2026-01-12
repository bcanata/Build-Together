// Admin Dashboard Controller
class AdminDashboard {
  constructor() {
    // Password hash (SHA-256 of password)
    // 
    // CURRENT PASSWORD: CircuitX_Admin_2024!Secure#Pass
    // 
    // This is a complex password with:
    // - Uppercase and lowercase letters
    // - Numbers
    // - Special characters (! and #)
    // - 30 characters long
    // 
    // To change the password:
    // 1. Open generate-password-hash.html in browser
    // 2. Enter your new password
    // 3. Copy the generated hash
    // 4. Replace the hash below
    // 5. Update this comment with your new password
    this.PASSWORD_HASH = 'be52d6a172623d00a798ff669b50fdc2c33db742a2fffea27fec8f82f55c936d';
    
    this.kitsConfig = null;
    this.blogsConfig = null;
    this.currentEditingKit = null;
    this.currentEditingBlog = null;
    this.isAuthenticated = false;
    
    // File handles for automatic saving
    this.kitsFileHandle = null;
    this.blogsFileHandle = null;
    this.hasFileAccess = false;
    
    this.initializeEventListeners();
    this.checkAuth();
    this.initializeFileAccess();
  }

  // Simple SHA-256 hash function
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async checkAuth() {
    const storedAuth = sessionStorage.getItem('admin_authenticated');
    const authTime = sessionStorage.getItem('admin_auth_time');
    const now = Date.now();
    
    // Check if authenticated within last 2 hours
    if (storedAuth === 'true' && authTime && (now - parseInt(authTime)) < 7200000) {
      this.isAuthenticated = true;
      this.showDashboard();
      this.loadConfigs();
    } else {
      this.showLogin();
    }
  }

  async handleLogin() {
    const passwordInput = document.getElementById('admin-password-input');
    const errorMsg = document.getElementById('admin-login-error');
    if (!passwordInput || !errorMsg) return;
    const password = passwordInput.value;
    
    if (!password) {
      errorMsg.textContent = 'Please enter a password';
      return;
    }
    
    const hash = await this.hashPassword(password);
    
    if (hash === this.PASSWORD_HASH) {
      this.isAuthenticated = true;
      sessionStorage.setItem('admin_authenticated', 'true');
      sessionStorage.setItem('admin_auth_time', Date.now().toString());
      this.showDashboard();
      this.loadConfigs();
      passwordInput.value = '';
      errorMsg.textContent = '';
    } else {
      errorMsg.textContent = 'Incorrect password';
      passwordInput.value = '';
    }
  }

  handleLogout() {
    this.isAuthenticated = false;
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_auth_time');
    this.showLogin();
  }

  showLogin() {
    const loginScreen = document.getElementById('admin-login-screen');
    const dashboard = document.getElementById('admin-dashboard-content');
    if (loginScreen) loginScreen.style.display = 'flex';
    if (dashboard) dashboard.style.display = 'none';
  }

  showDashboard() {
    const loginScreen = document.getElementById('admin-login-screen');
    const dashboard = document.getElementById('admin-dashboard-content');
    if (loginScreen) loginScreen.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';
  }

  initializeEventListeners() {
    // Login
    const loginBtn = document.getElementById('admin-login-btn');
    const passwordInput = document.getElementById('admin-password-input');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.handleLogin());
    }
    if (passwordInput) {
      passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleLogin();
      });
    }

    // Logout
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Admin tabs (internal to admin dashboard)
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.target.getAttribute('data-admin-tab');
        this.switchAdminTab(tab);
      });
    });

    // Add buttons
    const addKitBtn = document.getElementById('admin-add-kit-btn');
    const addBlogBtn = document.getElementById('admin-add-blog-btn');
    if (addKitBtn) {
      addKitBtn.addEventListener('click', () => this.openKitModal());
    }
    if (addBlogBtn) {
      addBlogBtn.addEventListener('click', () => this.openBlogModal());
    }

    // Save buttons
    const saveBtn = document.getElementById('admin-save-btn');
    const exportKitsBtn = document.getElementById('admin-export-kits-btn');
    const exportBlogsBtn = document.getElementById('admin-export-blogs-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveAll());
    }
    if (exportKitsBtn) {
      exportKitsBtn.addEventListener('click', () => this.exportKitsJSON());
    }
    if (exportBlogsBtn) {
      exportBlogsBtn.addEventListener('click', () => this.exportBlogsJSON());
    }

    // Modal close
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => this.closeModals());
    });
    const modalOverlay = document.getElementById('admin-modal-overlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', () => this.closeModals());
    }
    const kitCancelBtn = document.getElementById('kit-cancel-btn');
    if (kitCancelBtn) {
      kitCancelBtn.addEventListener('click', () => this.closeModals());
    }
    const blogCancelBtn = document.getElementById('blog-cancel-btn');
    if (blogCancelBtn) {
      blogCancelBtn.addEventListener('click', () => this.closeModals());
    }

    // Forms
    document.getElementById('kit-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveKit();
    });
    document.getElementById('blog-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveBlog();
    });

    // Cover image upload
    this.setupFileUpload('cover-upload', 'cover-file', 'cover-preview', 'cover-path');
    this.setupFileUpload('blog-image-upload', 'blog-image-file', 'blog-image-preview', 'blog-image-path');

    // Add category button (will be set up when modal opens)
    // Categories are now dynamic and set up when kit modal opens

    // Initialize default categories
    this.defaultCategories = [
      { name: 'media', displayName: 'Media (Videos)', accept: 'video/*' },
      { name: 'Instructions', displayName: 'Instructions (PDFs)', accept: '.pdf' },
      { name: 'cad_models', displayName: 'CAD Models (3D Files)', accept: '.stl,.step,.stp,.obj' },
      { name: 'Source Code', displayName: 'Source Code', accept: '.py,.java,.cpp,.c,.js,.html,.css' },
      { name: 'tutorial_videos', displayName: 'Tutorial Videos', accept: 'video/*' },
      { name: 'downloads', displayName: 'Downloads (Any Files)', accept: '*/*' }
    ];
  }

  setupFileUpload(containerId, inputId, previewId, pathId) {
    const container = document.getElementById(containerId);
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const pathInput = document.getElementById(pathId);
    if (!container || !input || !preview || !pathInput) return;

    container.addEventListener('click', () => input.click());
    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      container.classList.add('drag-over');
    });
    container.addEventListener('dragleave', () => {
      container.classList.remove('drag-over');
    });
    container.addEventListener('drop', (e) => {
      e.preventDefault();
      container.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.handleImageUpload(file, preview, pathInput);
      }
    });
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleImageUpload(file, preview, pathInput);
      }
    });
  }

  setupCategoryUpload(area) {
    const category = area.getAttribute('data-category');
    const accept = area.getAttribute('data-accept');
    const input = area.querySelector('input[type="file"]');
    const fileList = document.querySelector(`.file-list[data-category="${category}"]`);
    if (!input || !fileList) return;

    area.addEventListener('click', () => input.click());
    area.addEventListener('dragover', (e) => {
      e.preventDefault();
      area.classList.add('drag-over');
    });
    area.addEventListener('dragleave', () => {
      area.classList.remove('drag-over');
    });
    area.addEventListener('drop', (e) => {
      e.preventDefault();
      area.classList.remove('drag-over');
      const files = Array.from(e.dataTransfer.files);
      files.forEach(file => this.addFileToCategory(file, category, fileList));
    });
    input.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      files.forEach(file => this.addFileToCategory(file, category, fileList));
      e.target.value = ''; // Reset input
    });
  }

  handleImageUpload(file, preview, pathInput) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      // Suggest path based on file name
      if (!pathInput.value) {
        pathInput.value = `assets/${file.name}`;
      }
    };
    reader.readAsDataURL(file);
  }

  addFileToCategory(file, category, fileListContainer) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.dataset.fileName = file.name;
    
    const fileName = file.name;
    const filePath = `assets/${this.currentEditingKit || 'new-kit'}/${fileName}`;
    
    fileItem.innerHTML = `
      <div class="file-item-info">
        <span class="file-name">${fileName}</span>
        <input type="text" class="file-path-input" value="${filePath}" placeholder="assets/kit-name/file.ext">
      </div>
      <button type="button" class="btn-remove" data-category="${category}">Remove</button>
    `;
    
    fileListContainer.appendChild(fileItem);
    
    // Remove button
    fileItem.querySelector('.btn-remove').addEventListener('click', () => {
      fileItem.remove();
    });
  }

  switchAdminTab(tabName) {
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-admin-tab') === tabName);
    });
    document.querySelectorAll('.admin-tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `admin-${tabName}-tab`);
    });
  }

  async initializeFileAccess() {
    // Check if File System Access API is available
    if ('showOpenFilePicker' in window && 'showSaveFilePicker' in window) {
      this.hasFileAccess = true;
      this.updateFileAccessStatus('File System Access API available. JSON files will auto-save when you add/edit kits or blogs.');
    } else {
      this.updateFileAccessStatus('File System Access API not available. JSON files will download automatically when you save.');
    }
  }

  updateFileAccessStatus(message, type = 'info') {
    const statusElement = document.getElementById('file-access-status');
    const textElement = document.getElementById('file-access-text');
    if (statusElement && textElement) {
      textElement.textContent = `Auto-save: ${message}`;
      // Update styling based on type
      statusElement.classList.remove('success', 'error');
      if (type === 'success') {
        statusElement.classList.add('success');
      } else if (type === 'error') {
        statusElement.classList.add('error');
      }
    }
  }

  async requestFileAccess(filename) {
    if (!this.hasFileAccess) return null;
    
    try {
      // Request file access - user needs to select the file once
      this.updateFileAccessStatus(`Please select ${filename} to enable auto-save...`);
      const [fileHandle] = await window.showOpenFilePicker({
        suggestedName: filename,
        types: [{
          description: 'JSON files',
          accept: { 'application/json': ['.json'] }
        }],
        multiple: false
      });
      
      this.updateFileAccessStatus(`${filename} access granted! Auto-save enabled.`, 'success');
      return fileHandle;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error requesting file access:', error);
        this.updateFileAccessStatus(`Could not access ${filename}. Files will download instead.`);
      } else {
        this.updateFileAccessStatus(`File access cancelled. Files will download instead.`);
      }
      return null;
    }
  }

  async writeToFile(fileHandle, content) {
    if (!fileHandle) return false;
    
    try {
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      this.updateFileAccessStatus('JSON file updated successfully!', 'success');
      return true;
    } catch (error) {
      console.error('Error writing to file:', error);
      this.updateFileAccessStatus('Error writing file. Will download instead.');
      return false;
    }
  }

  async loadConfigs() {
    try {
      const kitsResponse = await fetch('kits-config.json');
      this.kitsConfig = await kitsResponse.json();
      
      const blogsResponse = await fetch('blogs-config.json');
      this.blogsConfig = await blogsResponse.json();
      
      this.renderKits();
      this.renderBlogs();
    } catch (error) {
      console.error('Error loading configs:', error);
      alert('Error loading configuration files. Make sure kits-config.json and blogs-config.json exist.');
    }
  }

  renderKits() {
    const container = document.getElementById('admin-kits-list');
    if (!container) return;
    container.innerHTML = '';
    
    if (!this.kitsConfig || !this.kitsConfig.kits) {
      container.innerHTML = '<p>No kits found. Click "Add New Kit" to create one.</p>';
      return;
    }
    
    Object.entries(this.kitsConfig.kits).forEach(([kitId, kit]) => {
      const card = this.createKitCard(kitId, kit);
      container.appendChild(card);
    });
  }

  createKitCard(kitId, kit) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-preview">
        <img src="${kit.cover}" alt="${kit.title}" onerror="this.style.display='none'">
      </div>
      <div class="item-info">
        <h3>${kit.title}</h3>
        <p>${kit.description}</p>
        <div class="item-meta">
          <span>ID: ${kitId}</span>
          <span>Team: ${kit.team}</span>
        </div>
      </div>
      <div class="item-actions">
        <button class="btn-edit" data-kit-id="${kitId}">Edit</button>
        <button class="btn-delete" data-kit-id="${kitId}">Delete</button>
      </div>
    `;
    
    card.querySelector('.btn-edit').addEventListener('click', () => this.openKitModal(kitId));
    card.querySelector('.btn-delete').addEventListener('click', () => this.deleteKit(kitId));
    
    return card;
  }

  renderBlogs() {
    const container = document.getElementById('admin-blogs-list');
    if (!container) return;
    container.innerHTML = '';
    
    if (!this.blogsConfig || !this.blogsConfig.blogs) {
      container.innerHTML = '<p>No blog posts found. Click "Add New Blog" to create one.</p>';
      return;
    }
    
    Object.entries(this.blogsConfig.blogs).forEach(([blogId, blog]) => {
      const card = this.createBlogCard(blogId, blog);
      container.appendChild(card);
    });
  }

  createBlogCard(blogId, blog) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-preview">
        <img src="${blog.image}" alt="${blog.title}" onerror="this.style.display='none'">
      </div>
      <div class="item-info">
        <h3>${blog.title}</h3>
        <p>${blog.text.substring(0, 100)}...</p>
        <div class="item-meta">
          <span>ID: ${blogId}</span>
        </div>
      </div>
      <div class="item-actions">
        <button class="btn-edit" data-blog-id="${blogId}">Edit</button>
        <button class="btn-delete" data-blog-id="${blogId}">Delete</button>
      </div>
    `;
    
    card.querySelector('.btn-edit').addEventListener('click', () => this.openBlogModal(blogId));
    card.querySelector('.btn-delete').addEventListener('click', () => this.deleteBlog(blogId));
    
    return card;
  }

  openKitModal(kitId = null) {
    this.currentEditingKit = kitId;
    const modal = document.getElementById('kit-modal');
    const overlay = document.getElementById('admin-modal-overlay');
    if (!modal || !overlay) return;
    
    if (kitId && this.kitsConfig.kits[kitId]) {
      // Edit mode
      const kit = this.kitsConfig.kits[kitId];
      document.getElementById('kit-modal-title').textContent = 'Edit Kit';
      document.getElementById('kit-id').value = kitId;
      document.getElementById('kit-id').disabled = true;
      document.getElementById('kit-title').value = kit.title;
      document.getElementById('kit-description').value = kit.description;
      document.getElementById('kit-detailed-description').value = kit.detailedDescription || '';
      document.getElementById('kit-team').value = kit.team;
      document.getElementById('cover-path').value = kit.cover;
      document.getElementById('cover-preview').innerHTML = kit.cover ? `<img src="${kit.cover}" alt="Cover">` : '';
      
      // Load categories from kit files
      this.renderCategories(kit.files || {});
    } else {
      // New kit mode
      document.getElementById('kit-modal-title').textContent = 'Add New Kit';
      document.getElementById('kit-form').reset();
      document.getElementById('kit-id').disabled = false;
      document.getElementById('cover-preview').innerHTML = '';
      
      // Load default categories
      this.renderCategories({});
    }
    
    modal.classList.add('active');
    overlay.classList.add('active');
  }

  renderCategories(files) {
    const container = document.getElementById('file-categories-container');
    if (!container) return;
    container.innerHTML = '';

    // Setup add category button
    const addCategoryBtn = document.getElementById('add-category-btn');
    if (addCategoryBtn) {
      // Remove old listeners and add new one
      const newBtn = addCategoryBtn.cloneNode(true);
      addCategoryBtn.parentNode.replaceChild(newBtn, addCategoryBtn);
      newBtn.addEventListener('click', () => this.addNewCategory());
    }

    // Get all categories from files object
    const categories = Object.keys(files);
    
    // If no categories exist, use defaults
    if (categories.length === 0) {
      this.defaultCategories.forEach(cat => {
        this.addCategoryElement(cat.name, cat.displayName, cat.accept, []);
      });
    } else {
      // Render existing categories
      categories.forEach(categoryName => {
        const filesInCategory = files[categoryName] || [];
        // Try to find display name from defaults, or use category name
        const defaultCat = this.defaultCategories.find(c => c.name === categoryName);
        const displayName = defaultCat ? defaultCat.displayName : categoryName;
        const accept = defaultCat ? defaultCat.accept : '*/*';
        this.addCategoryElement(categoryName, displayName, accept, filesInCategory);
      });
    }
  }

  addCategoryElement(categoryName, displayName, accept, files) {
    const container = document.getElementById('file-categories-container');
    if (!container) return;

    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'file-category';
    categoryDiv.dataset.categoryName = categoryName;
    
    const categoryId = `category-${categoryName.replace(/\s+/g, '-').toLowerCase()}`;
    
    categoryDiv.innerHTML = `
      <div class="category-header-inline">
        <div class="category-name-input-wrapper">
          <input type="text" class="category-name-input" value="${this.escapeHtml(displayName)}" 
                 data-category-key="${categoryName}" placeholder="Category Name">
          <small class="category-key-display">Key: ${this.escapeHtml(categoryName)}</small>
        </div>
        <div class="category-actions">
          <button type="button" class="btn-rename-category" title="Rename Category Key">Rename Key</button>
          <button type="button" class="btn-delete-category" title="Delete Category">Delete</button>
        </div>
      </div>
      <div class="file-upload-area" data-category="${categoryName}" data-accept="${accept}">
        <p>Drop files here or click to browse</p>
        <input type="file" multiple accept="${accept}" style="display: none;">
      </div>
      <div class="file-list" data-category="${categoryName}"></div>
    `;
    
    container.appendChild(categoryDiv);
    
    // Setup upload area
    const uploadArea = categoryDiv.querySelector('.file-upload-area');
    this.setupCategoryUpload(uploadArea);
    
    // Load existing files
    const fileList = categoryDiv.querySelector('.file-list');
    files.forEach(file => {
      this.addExistingFileToCategory(file, categoryName, fileList);
    });
    
    // Setup category name change
    const nameInput = categoryDiv.querySelector('.category-name-input');
    nameInput.addEventListener('change', (e) => {
      const newDisplayName = e.target.value;
      // Update display name (not the key)
      e.target.value = newDisplayName;
    });
    
    // Setup rename key button
    const renameBtn = categoryDiv.querySelector('.btn-rename-category');
    renameBtn.addEventListener('click', () => {
      this.renameCategoryKey(categoryName, categoryDiv);
    });
    
    // Setup delete button
    const deleteBtn = categoryDiv.querySelector('.btn-delete-category');
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Delete category "${displayName}"? All files in this category will be removed.`)) {
        categoryDiv.remove();
      }
    });
  }

  renameCategoryKey(oldKey, categoryDiv) {
    const newKey = prompt(`Enter new category key (URL-friendly, no spaces):`, oldKey);
    if (!newKey || newKey === oldKey) return;
    
    // Validate key
    if (!/^[a-zA-Z0-9_-]+$/.test(newKey)) {
      alert('Category key must contain only letters, numbers, underscores, and hyphens.');
      return;
    }
    
    // Check if key already exists
    const existingCategory = document.querySelector(`.file-category[data-category-name="${newKey}"]`);
    if (existingCategory && existingCategory !== categoryDiv) {
      alert('A category with this key already exists.');
      return;
    }
    
    // Update all references
    categoryDiv.dataset.categoryName = newKey;
    categoryDiv.querySelector('.file-upload-area').setAttribute('data-category', newKey);
    categoryDiv.querySelector('.file-list').setAttribute('data-category', newKey);
    categoryDiv.querySelector('.category-key-display').textContent = `Key: ${newKey}`;
    
    // Update file items
    categoryDiv.querySelectorAll('.file-item').forEach(item => {
      const removeBtn = item.querySelector('.btn-remove');
      if (removeBtn) {
        removeBtn.setAttribute('data-category', newKey);
      }
    });
  }

  addNewCategory() {
    const categoryName = prompt('Enter category key (URL-friendly, no spaces, e.g., "documents"):');
    if (!categoryName) return;
    
    // Validate key
    if (!/^[a-zA-Z0-9_-]+$/.test(categoryName)) {
      alert('Category key must contain only letters, numbers, underscores, and hyphens.');
      return;
    }
    
    // Check if key already exists
    const existingCategory = document.querySelector(`.file-category[data-category-name="${categoryName}"]`);
    if (existingCategory) {
      alert('A category with this key already exists.');
      return;
    }
    
    const displayName = prompt('Enter display name (e.g., "Documents"):', categoryName);
    if (!displayName) return;
    
    const accept = prompt('Enter file accept types (e.g., ".pdf,.doc" or "*/*" for all):', '*/*') || '*/*';
    
    this.addCategoryElement(categoryName, displayName, accept, []);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  addExistingFileToCategory(file, category, fileListContainer) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.dataset.fileName = file.name;
    
    fileItem.innerHTML = `
      <div class="file-item-info">
        <span class="file-name">${file.name}</span>
        <input type="text" class="file-path-input" value="${file.file}" placeholder="assets/kit-name/file.ext">
      </div>
      <button type="button" class="btn-remove" data-category="${category}">Remove</button>
    `;
    
    fileListContainer.appendChild(fileItem);
    
    fileItem.querySelector('.btn-remove').addEventListener('click', () => {
      fileItem.remove();
    });
  }

  openBlogModal(blogId = null) {
    this.currentEditingBlog = blogId;
    const modal = document.getElementById('blog-modal');
    const overlay = document.getElementById('admin-modal-overlay');
    if (!modal || !overlay) return;
    
    if (blogId && this.blogsConfig.blogs[blogId]) {
      // Edit mode
      const blog = this.blogsConfig.blogs[blogId];
      document.getElementById('blog-modal-title').textContent = 'Edit Blog Post';
      document.getElementById('blog-id').value = blogId;
      document.getElementById('blog-id').disabled = true;
      document.getElementById('blog-title').value = blog.title;
      document.getElementById('blog-text').value = blog.text;
      document.getElementById('blog-image-path').value = blog.image;
      document.getElementById('blog-image-preview').innerHTML = blog.image ? `<img src="${blog.image}" alt="Blog Image">` : '';
    } else {
      // New blog mode
      document.getElementById('blog-modal-title').textContent = 'Add New Blog Post';
      document.getElementById('blog-form').reset();
      document.getElementById('blog-id').disabled = false;
      document.getElementById('blog-image-preview').innerHTML = '';
    }
    
    modal.classList.add('active');
    overlay.classList.add('active');
  }

  closeModals() {
    const kitModal = document.getElementById('kit-modal');
    const blogModal = document.getElementById('blog-modal');
    const modalOverlay = document.getElementById('admin-modal-overlay');
    if (kitModal) kitModal.classList.remove('active');
    if (blogModal) blogModal.classList.remove('active');
    if (modalOverlay) modalOverlay.classList.remove('active');
    this.currentEditingKit = null;
    this.currentEditingBlog = null;
  }

  async saveKit() {
    const kitId = document.getElementById('kit-id').value;
    const title = document.getElementById('kit-title').value;
    const description = document.getElementById('kit-description').value;
    const detailedDescription = document.getElementById('kit-detailed-description').value;
    const team = document.getElementById('kit-team').value;
    const cover = document.getElementById('cover-path').value;
    
    if (!this.kitsConfig.kits) {
      this.kitsConfig.kits = {};
    }
    
    // Collect files from all categories (dynamic)
    const files = {};
    document.querySelectorAll('.file-category').forEach(categoryDiv => {
      const categoryKey = categoryDiv.getAttribute('data-category-name');
      const fileList = categoryDiv.querySelector('.file-list');
      if (!fileList) return;
      
      const fileItems = fileList.querySelectorAll('.file-item');
      files[categoryKey] = [];
      
      fileItems.forEach(item => {
        const name = item.querySelector('.file-name').textContent;
        const path = item.querySelector('.file-path-input').value;
        if (name && path) {
          files[categoryKey].push({
            name: name,
            file: path
          });
        }
      });
    });
    
    this.kitsConfig.kits[kitId] = {
      title,
      description,
      detailedDescription,
      team,
      cover,
      files
    };
    
    // Automatically save to JSON file
    await this.autoSaveKits();
    
    this.renderKits();
    this.closeModals();
    this.showNotification('Kit saved and JSON updated!');
  }

  async saveBlog() {
    const blogId = document.getElementById('blog-id').value;
    const title = document.getElementById('blog-title').value;
    const text = document.getElementById('blog-text').value;
    const image = document.getElementById('blog-image-path').value;
    
    if (!this.blogsConfig.blogs) {
      this.blogsConfig.blogs = {};
    }
    
    this.blogsConfig.blogs[blogId] = {
      title,
      text,
      image
    };
    
    // Automatically save to JSON file
    await this.autoSaveBlogs();
    
    this.renderBlogs();
    this.closeModals();
    this.showNotification('Blog post saved and JSON updated!');
  }

  async deleteKit(kitId) {
    if (confirm(`Are you sure you want to delete the kit "${this.kitsConfig.kits[kitId].title}"?`)) {
      delete this.kitsConfig.kits[kitId];
      // Automatically save to JSON file
      await this.autoSaveKits();
      this.renderKits();
      this.showNotification('Kit deleted and JSON updated!');
    }
  }

  async deleteBlog(blogId) {
    if (confirm(`Are you sure you want to delete the blog post "${this.blogsConfig.blogs[blogId].title}"?`)) {
      delete this.blogsConfig.blogs[blogId];
      // Automatically save to JSON file
      await this.autoSaveBlogs();
      this.renderBlogs();
      this.showNotification('Blog post deleted and JSON updated!');
    }
  }

  async saveAll() {
    try {
      await this.autoSaveKits();
      await this.autoSaveBlogs();
      this.showNotification('All changes saved to JSON files!');
    } catch (error) {
      console.error('Error saving:', error);
      this.showNotification('Error saving. Using fallback download method.');
      // Fallback to download
      await this.saveKitsToFile();
      await this.saveBlogsToFile();
    }
  }

  async autoSaveKits() {
    const json = JSON.stringify(this.kitsConfig, null, 2);
    
    // Try to use File System Access API
    if (this.hasFileAccess) {
      // Request file access if we don't have it
      if (!this.kitsFileHandle) {
        this.kitsFileHandle = await this.requestFileAccess('kits-config.json');
      }
      
      if (this.kitsFileHandle) {
        const success = await this.writeToFile(this.kitsFileHandle, json);
        if (success) {
          return; // Successfully saved
        }
      }
    }
    
    // Fallback: download file
    this.downloadFile('kits-config.json', json);
  }

  async autoSaveBlogs() {
    const json = JSON.stringify(this.blogsConfig, null, 2);
    
    // Try to use File System Access API
    if (this.hasFileAccess) {
      // Request file access if we don't have it
      if (!this.blogsFileHandle) {
        this.blogsFileHandle = await this.requestFileAccess('blogs-config.json');
      }
      
      if (this.blogsFileHandle) {
        const success = await this.writeToFile(this.blogsFileHandle, json);
        if (success) {
          return; // Successfully saved
        }
      }
    }
    
    // Fallback: download file
    this.downloadFile('blogs-config.json', json);
  }

  async saveKitsToFile() {
    const json = JSON.stringify(this.kitsConfig, null, 2);
    this.downloadFile('kits-config.json', json);
  }

  async saveBlogsToFile() {
    const json = JSON.stringify(this.blogsConfig, null, 2);
    this.downloadFile('blogs-config.json', json);
  }

  exportKitsJSON() {
    const json = JSON.stringify(this.kitsConfig, null, 2);
    this.downloadFile('kits-config.json', json);
  }

  exportBlogsJSON() {
    const json = JSON.stringify(this.blogsConfig, null, 2);
    this.downloadFile('blogs-config.json', json);
  }

  downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  showNotification(message) {
    // Simple notification - can be enhanced
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize dashboard when DOM is ready and admin tab is accessed
let adminDashboardInstance = null;

function initializeAdminDashboard() {
  if (!adminDashboardInstance) {
    adminDashboardInstance = new AdminDashboard();
  }
  return adminDashboardInstance;
}

// Initialize when admin tab is clicked or becomes active
document.addEventListener('DOMContentLoaded', () => {
  // Watch for tab changes
  const observer = new MutationObserver(() => {
    const adminTab = document.getElementById('admin');
    if (adminTab && adminTab.classList.contains('active')) {
      if (!adminDashboardInstance) {
        initializeAdminDashboard();
      }
    }
  });
  
  // Observe the main container for tab changes
  const mainContainer = document.querySelector('main .container');
  if (mainContainer) {
    observer.observe(mainContainer, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: true,
      childList: false
    });
  }
  
  // Also check immediately if admin tab is already active
  const adminTab = document.getElementById('admin');
  if (adminTab && adminTab.classList.contains('active')) {
    initializeAdminDashboard();
  }
  
  // Also listen for direct tab button clicks
  const adminTabBtn = document.querySelector('.tab-btn[data-tab="admin"]');
  if (adminTabBtn) {
    adminTabBtn.addEventListener('click', () => {
      setTimeout(() => {
        initializeAdminDashboard();
      }, 100);
    });
  }
});
