class KitsGlossary {
  constructor() {
    this.config = null;
    this.blogsConfig = null;
    this.currentKit = null;
    this.currentSlide = 0;
    this.totalSlides = 3; // Changed from 4 to 3

    // DOM elements
    this.tabButtons = null;
    this.tabContents = null;
    this.projectsGrid = null;
    this.blogContainer = null;
    this.projectPage = null;
    this.backButton = null;
    this.projectPageTitle = null;
    this.videoContainer = null;
    this.manualsGrid = null;
    this.downloadsGrid = null;
    this.slidesContainer = null;
    this.slideIndicators = null;
    this.prevButton = null;
    this.nextButton = null;

    // Team popup elements
    this.popupOverlay = null;
    this.teamPopup = null;
    this.popupClose = null;
    this.popupTeamNumber = null;
    this.popupTeamName = null;
    this.popupTeamDescription = null;
    this.popupSocialLinks = null;

    // Description panel elements
    this.descriptionPanelBtn = null;
    this.descriptionPanelOverlay = null;
    this.descriptionPanelClose = null;
    this.descriptionPanelText = null;

    // Team data
    this.teamsData = {
      '6431': {
        number: '6431',
        name: 'NoktaParantez',
        description: 'FIRST Robotics Competition team from Istanbul, Turkey. We focus on innovative engineering solutions and community outreach in STEM education.',
        socialLinks: [
          {
            name: 'Instagram',
            url: 'https://www.instagram.com/noktaparantez6431/'
          },
          {
            name: 'GitHub',
            url: 'https://github.com/HisarCS'
          },
          {
            name: 'Team Website',
            url: 'https://6431.hisarschool.k12.tr/'
          },
          {
            name: 'YouTube',
            url: 'https://youtube.com/@noktaparantez6431'
          }
        ]
      },
        '4131': {
        number: '4131',
        name: 'Iron Patriots',
        description: 'FIRST Robotics Competition team based in Renton, WA dedicated to growing an ironclad STEM community since 2011.',
        socialLinks: [
          {
            name: 'Instagram',
            url: 'https://www.instagram.com/frc4131/'
          },
          {
            name: 'Facebook',
            url: 'https://www.facebook.com/FRC4131'
          },
          {
            name: 'Team Website',
            url: 'https://www.frc4131.org'
          },
          {
            name: 'YouTube',
            url: 'https://youtube.com/@IronPatriots'
          }
        ]
      },
        '2635': {
        number: '2635',
        name: 'Lake Monsters',
        description: 'FIRST Robotics Competition team based in Lake Oswego, Oregon, USA; creating technological works of art that are fueled by the creativity of young engineers.',
        socialLinks: [
          {
            name: 'Instagram',
            url: 'https://instagram.com/lakemonsters2635'
          },
          {
            name: 'Youtube',
            url: 'https://youtube.com/@lakemonsters2635'
          },
          {
            name: 'Team Website',
            url: 'https://frc2635.org'
          }
        ]
      },
    };

    this.initializeElements();
    this.initializeEventListeners();
    this.loadKitsConfig();
    this.loadBlogsConfig();
  }

  initializeElements() {
    this.tabButtons = document.querySelectorAll('.tab-btn');
    this.tabContents = document.querySelectorAll('.tab-content');
    this.projectsGrid = document.querySelector('.projects-grid');
    this.blogContainer = document.querySelector('.blog-container');
    this.projectPage = document.getElementById('project-page');
    this.backButton = document.querySelector('.back-btn');
    this.projectPageTitle = document.querySelector('.project-page-title');
    this.videoContainer = document.querySelector('.video-container');
    this.dynamicSections = document.querySelector('#dynamic-sections');
    this.manualsGrid = null; // Will be set dynamically
    this.downloadsGrid = null; // Will be set dynamically
    this.slidesContainer = document.querySelector('.slides-container');
    this.slideIndicators = document.querySelectorAll('.indicator');
    this.prevButton = document.getElementById('prevSlide');
    this.nextButton = document.getElementById('nextSlide');

    // Team popup elements
    this.popupOverlay = document.getElementById('team-popup-overlay');
    this.teamPopup = document.querySelector('.team-popup');
    this.popupClose = document.getElementById('popup-close');
    this.popupTeamNumber = document.getElementById('popup-team-number');
    this.popupTeamName = document.getElementById('popup-team-name');
    this.popupTeamDescription = document.getElementById('popup-team-description');
    this.popupSocialLinks = document.getElementById('popup-social-links');

    // Description panel elements
    this.descriptionPanelBtn = document.getElementById('description-panel-btn');
    this.descriptionPanelOverlay = document.getElementById('description-panel-overlay');
    this.descriptionPanelClose = document.getElementById('description-panel-close');
    this.descriptionPanelText = document.getElementById('description-panel-text');
    
    // Debug: Check if critical elements exist
    console.log('Elements found:', {
      projectPage: !!this.projectPage,
      projectPageTitle: !!this.projectPageTitle,
      videoContainer: !!this.videoContainer,
      dynamicSections: !!this.dynamicSections,
      projectsGrid: !!this.projectsGrid,
      popupOverlay: !!this.popupOverlay,
      teamPopup: !!this.teamPopup,
      descriptionPanelBtn: !!this.descriptionPanelBtn,
      descriptionPanelOverlay: !!this.descriptionPanelOverlay
    });
  }

  initializeEventListeners() {
    // Tab navigation
    this.tabButtons.forEach(button => {
      button.addEventListener('click', () => this.handleTabClick(button));
    });

    // Back button
    if (this.backButton) {
      this.backButton.addEventListener('click', () => this.showKitsList());
    }

    // Slider controls
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => this.previousSlide());
    }
    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => this.nextSlide());
    }
    
    this.slideIndicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));
    });

    // Team card click events
    this.initializeTeamCardListeners();

    // Team popup close events
    this.initializePopupListeners();

    // Description panel events
    this.initializeDescriptionPanelListeners();

    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  initializeTeamCardListeners() {
    const teamCards = document.querySelectorAll('.team-card[data-team-id]');
    teamCards.forEach(card => {
      card.addEventListener('click', () => {
        const teamId = card.getAttribute('data-team-id');
        this.showTeamPopup(teamId);
      });
    });
  }

  initializePopupListeners() {
    // Close button
    if (this.popupClose) {
      this.popupClose.addEventListener('click', () => this.hideTeamPopup());
    }

    // Overlay click
    if (this.popupOverlay) {
      this.popupOverlay.addEventListener('click', (e) => {
        if (e.target === this.popupOverlay) {
          this.hideTeamPopup();
        }
      });
    }
  }

  showTeamPopup(teamId) {
    const teamData = this.teamsData[teamId];
    if (!teamData || !this.popupOverlay) return;

    console.log('Showing team popup for:', teamId, teamData);

    // Populate popup content
    if (this.popupTeamNumber) {
      this.popupTeamNumber.textContent = teamData.number;
    }
    if (this.popupTeamName) {
      this.popupTeamName.textContent = teamData.name;
    }
    if (this.popupTeamDescription) {
      this.popupTeamDescription.textContent = teamData.description;
    }

    // Populate social links
    if (this.popupSocialLinks && teamData.socialLinks) {
      this.popupSocialLinks.innerHTML = '';
      teamData.socialLinks.forEach(link => {
        const linkElement = document.createElement('a');
        linkElement.href = link.url;
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';
        linkElement.className = 'popup-social-link';
        linkElement.textContent = link.name;
        this.popupSocialLinks.appendChild(linkElement);
      });
    }

    // Show popup with animation
    this.popupOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  initializeDescriptionPanelListeners() {
    // Description panel button
    if (this.descriptionPanelBtn) {
      this.descriptionPanelBtn.addEventListener('click', () => this.showDescriptionPanel());
    }

    // Close button
    if (this.descriptionPanelClose) {
      this.descriptionPanelClose.addEventListener('click', () => this.hideDescriptionPanel());
    }

    // Overlay click
    if (this.descriptionPanelOverlay) {
      this.descriptionPanelOverlay.addEventListener('click', (e) => {
        if (e.target === this.descriptionPanelOverlay) {
          this.hideDescriptionPanel();
        }
      });
    }
  }

  showDescriptionPanel() {
    if (!this.descriptionPanelOverlay) return;
    
    this.descriptionPanelOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  hideDescriptionPanel() {
    if (!this.descriptionPanelOverlay) return;
    
    this.descriptionPanelOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
  }

  async loadKitsConfig() {
    try {
      console.log('Loading kits config...'); // Debug log
      const response = await fetch('kits-config.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.config = await response.json();
      console.log('Config loaded successfully:', this.config); // Debug log
      this.renderKitCards();
    } catch (error) {
      console.error('Failed to load kits configuration:', error);
      this.showError('Failed to load kits. Please try again later.');
    }
  }

  async loadBlogsConfig() {
    try {
      console.log('Loading blogs config...'); // Debug log
      const response = await fetch('blogs-config.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.blogsConfig = await response.json();
      console.log('Blogs config loaded successfully:', this.blogsConfig); // Debug log
      this.renderBlogPosts();
    } catch (error) {
      console.error('Failed to load blogs configuration:', error);
      // Don't show error to user, just log it - blogs are optional
    }
  }

  renderBlogPosts() {
    if (!this.blogsConfig || !this.blogContainer) return;

    // Clear existing blog posts (but keep the submit button)
    const submitButton = this.blogContainer.querySelector('.blog-submit-btn');
    this.blogContainer.innerHTML = '';
    
    // Render all blog posts
    Object.entries(this.blogsConfig.blogs).forEach(([blogId, blog]) => {
      const blogPost = this.createBlogPost(blogId, blog);
      this.blogContainer.appendChild(blogPost);
    });

    // Re-append the submit button at the end
    if (submitButton) {
      this.blogContainer.appendChild(submitButton);
    }
  }

  createBlogPost(blogId, blog) {
    const article = document.createElement('article');
    article.className = 'blog-post';
    
    article.innerHTML = `
      <div class="blog-image">
        <img src="${blog.image}" alt="${blog.title}" onerror="this.parentElement.innerHTML='<div class=\'blog-placeholder\'>Blog Image</div>'">
      </div>
      <div class="blog-content">
        <h2 class="blog-title">${blog.title}</h2>
        <p class="blog-text">${blog.text}</p>
      </div>
    `;
    
    return article;
  }

  renderKitCards() {
    if (!this.config || !this.projectsGrid) return;

    this.projectsGrid.innerHTML = '';
    
    Object.entries(this.config.kits).forEach(([kitId, kit]) => {
      const card = this.createKitCard(kitId, kit);
      this.projectsGrid.appendChild(card);
    });
  }

  createKitCard(kitId, kit) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-project', kitId);
    
    card.innerHTML = `
      <div class="project-image">
        <img src="${kit.cover}" alt="${kit.title}" onerror="this.parentElement.innerHTML='Project Image'">
      </div>
      <div class="project-content">
        <h3 class="project-title">${kit.title}</h3>
        <p class="project-description">${kit.description}</p>
        <div class="project-meta">
          <span class="team-name team-name-clickable" data-team="${kit.team}">${kit.team}</span>
        </div>
      </div>
    `;

    // Add click event for the main card (but not team name)
    card.addEventListener('click', (e) => {
      // Check if the clicked element is the team name
      if (e.target.classList.contains('team-name')) {
        return; // Let the team name handler deal with it
      }
      e.preventDefault();
      console.log('Card clicked:', kitId); // Debug log
      this.showKitDetails(kitId);
    });

    // Add specific click event for team name
    const teamNameElement = card.querySelector('.team-name');
    if (teamNameElement) {
      teamNameElement.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click
        e.preventDefault();
        console.log('Team name clicked:', kit.team); // Debug log
        this.navigateToTeamsSection();
      });
    }
    
    return card;
  }

  navigateToTeamsSection() {
    console.log('Navigating to teams section'); // Debug log
    
    // Switch to about tab
    this.switchToTab('about');
    
    // Wait a moment for the tab to be visible, then scroll
    setTimeout(() => {
      const teamsSection = document.getElementById('collaborated-teams');
      if (teamsSection) {
        teamsSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
        console.log('Scrolled to teams section'); // Debug log
      } else {
        console.error('Teams section not found'); // Debug log
      }
    }, 100);
  }

showKitDetails(kitId) {
    console.log('showKitDetails called with:', kitId); // Debug log
    
    if (!this.config) {
      console.error('Config not loaded');
      return;
    }

    const kit = this.config.kits[kitId];
    if (!kit) {
      console.error('Kit not found:', kitId);
      return;
    }

    console.log('Kit found:', kit); // Debug log
    
    this.currentKit = kitId;
    if (this.projectPageTitle) {
      this.projectPageTitle.textContent = kit.title;
    }
    
    // Update description panel content with kit-specific detailed description
    if (this.descriptionPanelText) {
      this.descriptionPanelText.textContent = kit.detailedDescription || kit.description;
    }
    
    // Handle top video section
    this.setupVideoSection(kit.files);
    
    // Clear and rebuild dynamic sections
    if (this.dynamicSections) {
      this.dynamicSections.innerHTML = '';
      this.generateDynamicSections(kit.files);
    }

    console.log('About to switch to project page'); // Debug log
    this.switchToTab('project-page');
  }

  hideTeamPopup() {
    if (!this.popupOverlay) return;
    
    this.popupOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
  }

  setupVideoSection(files) {
    // Look for videos in media array or any array containing video files
    let videoFile = null;
    
    // First check media array
    if (files.media && files.media.length > 0) {
      videoFile = files.media.find(file => {
        const extension = (file.file || file.name).split('.').pop().toLowerCase();
        return ['mp4', 'avi', 'mov', 'mkv'].includes(extension);
      });
    }
    
    // If no video in media, check other arrays
    if (!videoFile) {
      for (const [key, fileArray] of Object.entries(files)) {
        if (Array.isArray(fileArray)) {
          videoFile = fileArray.find(file => {
            const extension = (file.file || file.name).split('.').pop().toLowerCase();
            return ['mp4', 'avi', 'mov', 'mkv'].includes(extension);
          });
          if (videoFile) break;
        }
      }
    }
    
    if (this.videoContainer) {
      if (videoFile) {
        this.videoContainer.innerHTML = `
          <video controls style="width: 100%; height: 100%;">
            <source src="${videoFile.file}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        `;
      } else {
        this.videoContainer.innerHTML = 'No video available';
      }
    }
  }

  generateDynamicSections(files) {
    // Get all available file categories dynamically
    Object.keys(files).forEach(categoryKey => {
      if (files[categoryKey] && files[categoryKey].length > 0) {
        const section = this.createFileSection(categoryKey, files[categoryKey]);
        this.dynamicSections.appendChild(section);
      }
    });
  }

  createFileSection(categoryKey, files) {
    const section = document.createElement('div');
    section.className = `${categoryKey}-section`;
    
    const title = document.createElement('h3');
    title.textContent = this.formatSectionTitle(categoryKey);
    section.appendChild(title);

    // Check if this should be downloads-style layout
    const isDownloadsStyle = categoryKey.toLowerCase() === 'downloads';

    if (isDownloadsStyle) {
      // Downloads use list layout
      const grid = document.createElement('div');
      grid.className = 'downloads-grid';
      files.forEach(file => {
        const downloadItem = this.createDownloadItem(file);
        grid.appendChild(downloadItem);
      });
      section.appendChild(grid);
    } else {
      // All other categories use grid layout
      const grid = document.createElement('div');
      grid.className = `${categoryKey}-grid`;
      files.forEach(file => {
        const item = this.createGridItem(file, categoryKey);
        grid.appendChild(item);
      });
      section.appendChild(grid);
    }

    return section;
  }

  formatSectionTitle(categoryKey) {
    // Convert camelCase or snake_case to Title Case
    return categoryKey
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  getFileIcon(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    
    const iconMap = {
      // Documents
      'pdf': '📋',
      'doc': '📋',
      'docx': '📋',
      'txt': '📋',
      
      // 3D Models/CAD
      'stl': '🔧',
      'obj': '🔧',
      'step': '🔧',
      'stp': '🔧',
      'dwg': '🔧',
      'dxf': '🔧',
      
      // Media
      'mp4': '▶️',
      'avi': '▶️',
      'mov': '▶️',
      'mkv': '▶️',
      'mp3': '🔊',
      'wav': '🔊',
      
      // Images
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'png': '🖼️',
      'gif': '🖼️',
      'svg': '🖼️',
      
      // Code
      'py': '💻',
      'java': '💻',
      'cpp': '💻',
      'c': '💻',
      'js': '💻',
      'html': '💻',
      'css': '💻',
      
      // Archives
      'zip': '📦',
      'rar': '📦',
      '7z': '📦',
      'tar': '📦'
    };
    
    return iconMap[extension] || '📄';
  }

  createGridItem(file, categoryKey) {
    const item = document.createElement('div');
    item.className = `file-item`;
    
    const preview = document.createElement('div');
    preview.className = `file-preview`;
    
    // Check if it's a PDF file
    const extension = (file.file || file.name).split('.').pop().toLowerCase();
    if (extension === 'pdf') {
      preview.innerHTML = `<div class="pdf-loading">Loading PDF...</div>`;
      this.generatePDFThumbnail(file.file, preview);
    } else {
      preview.innerHTML = `<span style="font-size: 2rem;">${this.getFileIcon(file.file || file.name)}</span>`;
    }
    
    item.appendChild(preview);

    const nameDiv = document.createElement('div');
    nameDiv.style.marginTop = '0.5rem';
    nameDiv.innerHTML = `<strong>${file.name}</strong>`;
    item.appendChild(nameDiv);

    // Determine action based on file type
    const videoExtensions = ['mp4', 'avi', 'mov', 'mkv'];
    
    if (videoExtensions.includes(extension)) {
      // For videos, open in new tab
      item.addEventListener('click', () => {
        window.open(file.file, '_blank');
      });
    } else {
      // For all other files, download
      item.addEventListener('click', () => this.downloadFile(file));
    }

    return item;
  }

  async generatePDFThumbnail(pdfUrl, previewElement) {
    try {
      // Check if PDF.js is available
      if (typeof pdfjsLib === 'undefined') {
        console.error('PDF.js not loaded');
        previewElement.innerHTML = `<span style="font-size: 2rem;">📋</span>`;
        return;
      }

      // Load the PDF
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      
      // Get the first page
      const page = await pdf.getPage(1);
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Calculate scale to fit preview area
      const viewport = page.getViewport({ scale: 1 });
      const previewWidth = 118; // Match the preview container width minus borders
      const previewHeight = 118;
      const scale = Math.min(previewWidth / viewport.width, previewHeight / viewport.height);
      
      const scaledViewport = page.getViewport({ scale });
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      
      // Render PDF page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport
      };
      
      await page.render(renderContext).promise;
      
      // Replace loading text with canvas
      previewElement.innerHTML = '';
      canvas.style.maxWidth = '100%';
      canvas.style.maxHeight = '100%';
      canvas.style.objectFit = 'contain';
      previewElement.appendChild(canvas);
      
    } catch (error) {
      console.error('Error generating PDF thumbnail:', error);
      // Fallback to PDF icon on error
      previewElement.innerHTML = `<span style="font-size: 2rem;">📋</span>`;
    }
  }

  createDownloadItem(file) {
    const downloadItem = document.createElement('div');
    downloadItem.className = 'download-item';
    
    downloadItem.innerHTML = `
      <div>
        <span>💾</span>
        <strong>${file.name}</strong>
      </div>
      <div style="text-align: right;">
        <button class="cube download-btn">
          <div class="bg-top"><div class="bg-inner"></div></div>
          <div class="bg-right"><div class="bg-inner"></div></div>
          <div class="bg"><div class="bg-inner"></div></div>
          <span class="btn text">Download</span>
        </button>
      </div>
    `;
    
    const downloadButton = downloadItem.querySelector('.download-btn');
    if (downloadButton) {
      downloadButton.addEventListener('click', () => this.downloadFile(file));
    }
    
    return downloadItem;
  }

  downloadFile(file) {
    const link = document.createElement('a');
    link.href = file.file;
    
    // Extract filename with extension from the file path
    const filename = file.file.split('/').pop();
    link.download = filename || file.name;
    
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  showKitsList() {
    // Hide project page and show kits tab
    if (this.projectPage) {
      this.projectPage.classList.remove('active');
    }
    
    const kitsTab = document.getElementById('kits');
    if (kitsTab) {
      kitsTab.classList.add('active');
    }
    
    // Make sure kits tab button is active
    this.tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === 'kits');
    });
    
    this.currentKit = null;
  }

  handleTabClick(button) {
    const targetTab = button.getAttribute('data-tab');
    if (!targetTab) return;

    this.switchToTab(targetTab);
  }

  switchToTab(tabId) {
    console.log('switchToTab called with:', tabId); // Debug log
    
    if (tabId === 'project-page') {
      console.log('Switching to project page'); // Debug log
      // Hide all tabs and show project page
      this.tabContents.forEach(content => {
        content.classList.remove('active');
      });
      if (this.projectPage) {
        this.projectPage.classList.add('active');
      }
      
      // Keep the kits tab button active since project page is part of kits
      this.tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === 'kits');
      });
      
      console.log('Project page should now be visible'); // Debug log
    } else {
      console.log('Switching to regular tab:', tabId); // Debug log
      // Normal tab switching
      this.tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
      });

      this.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === tabId);
      });
    }
  }

  // Slider functionality
  previousSlide() {
    this.currentSlide = this.currentSlide > 0 ? this.currentSlide - 1 : this.totalSlides - 1;
    this.updateSlider();
  }

  nextSlide() {
    this.currentSlide = this.currentSlide < this.totalSlides - 1 ? this.currentSlide + 1 : 0;
    this.updateSlider();
  }

  goToSlide(index) {
    this.currentSlide = index;
    this.updateSlider();
  }

  updateSlider() {
    if (this.slidesContainer) {
      const translateX = -this.currentSlide * 33.333; // 33.333% per slide (3 slides total)
      this.slidesContainer.style.transform = `translateX(${translateX}%)`;
    }
    
    // Update indicators
    this.slideIndicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentSlide);
    });
  }

  handleKeydown(event) {
    if (event.key === 'Escape') {
      if (this.popupOverlay && this.popupOverlay.classList.contains('active')) {
        // Close team popup if open
        this.hideTeamPopup();
      } else if (this.descriptionPanelOverlay && this.descriptionPanelOverlay.classList.contains('active')) {
        // Close description panel if open
        this.hideDescriptionPanel();
      } else if (this.currentKit) {
        // Otherwise go back to kits list
        this.showKitsList();
      }
    }
    
    // Slider keyboard navigation (only on about tab)
    const aboutTab = document.getElementById('about');
    if (aboutTab && aboutTab.classList.contains('active')) {
      if (event.key === 'ArrowLeft') {
        this.previousSlide();
      } else if (event.key === 'ArrowRight') {
        this.nextSlide();
      }
    }
  }

  showError(message) {
    if (this.projectsGrid) {
      this.projectsGrid.innerHTML = `
        <div style="text-align: center; color: #ff6b35; padding: 3rem;">
          <h3>Error</h3>
          <p>${message}</p>
        </div>
      `;
    }
  }
}


document.addEventListener('DOMContentLoaded', () => {
  new KitsGlossary();
});

document.getElementById('top-admin-btn').addEventListener('click', function() {

    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById('admin').classList.add('active');
    
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    window.scrollTo(0, 0);
});
