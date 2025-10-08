// ============================================
// 1. CEK AUTENTIKASI & SETUP NAVBAR
// ============================================
const userName = localStorage.getItem("firstName");

if (!userName) {
  window.location.href = "login.html";
} else {
  document.getElementById("greeting").textContent = `Hi, ${userName}!`;
}

// ============================================
// 2. VARIABEL GLOBAL & DOM ELEMENTS
// ============================================
let recipesData = [];
let filteredRecipes = [];
let displayedCount = 0;
const ITEMS_PER_PAGE = 6;

// localStorage keys per user
const WISHLIST_KEY = `wishlist_${userName}`;
const COOKED_KEY = `cooked_${userName}`;

// Load dari localStorage (per user)
let wishlist = [];
let haveCooked = [];

// Load saved data
try {
  const savedWishlist = localStorage.getItem(WISHLIST_KEY);
  const savedCooked = localStorage.getItem(COOKED_KEY);
  
  if (savedWishlist) {
    wishlist = JSON.parse(savedWishlist);
  }
  if (savedCooked) {
    haveCooked = JSON.parse(savedCooked);
  }
  
  console.log(`Loaded wishlist for ${userName}:`, wishlist.length, 'items');
  console.log(`Loaded cooked for ${userName}:`, haveCooked.length, 'items');
} catch (error) {
  console.error('Error loading saved data:', error);
  wishlist = [];
  haveCooked = [];
}

const recipesContainer = document.getElementById("recipesContainer");
const showMoreBtn = document.getElementById("showMoreBtn");
const searchInput = document.getElementById("searchInput");
const filterCuisine = document.getElementById("filterCuisine");
const wishlistBtn = document.getElementById("wishlistBtn");
const cookedBtn = document.getElementById("cookedBtn");
const wishlistCount = document.getElementById("wishlistCount");
const cookedCount = document.getElementById("cookedCount");
const darkModeToggle = document.getElementById("darkModeToggle");
const logoutBtn = document.getElementById("logoutBtn");
const scrollTopBtn = document.getElementById("scrollTopBtn");
const brandElement = document.querySelector(".brand");

// ============================================
// 3. DARK MODE FUNCTIONALITY
// ============================================
function initDarkMode() {
  const darkMode = sessionStorage.getItem("darkMode") === "true";
  if (darkMode) {
    document.body.classList.add("dark-mode");
  }
}

darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  sessionStorage.setItem("darkMode", isDark);
});

// ============================================
// 4. WISHLIST & HAVE COOKED FUNCTIONALITY
// ============================================
function updateCounters() {
  wishlistCount.textContent = wishlist.length;
  cookedCount.textContent = haveCooked.length;
  
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    localStorage.setItem(COOKED_KEY, JSON.stringify(haveCooked));
    console.log(`Saved ${WISHLIST_KEY}:`, wishlist.length, 'items');
    console.log(`Saved ${COOKED_KEY}:`, haveCooked.length, 'items');
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

wishlistBtn.addEventListener("click", () => {
  showWishlistModal();
});

cookedBtn.addEventListener("click", () => {
  showCookedModal();
});

function showWishlistModal() {
  if (wishlist.length === 0) {
    alert("Your wishlist is empty! Click ❤️ on recipe cards to add them.");
    return;
  }

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" id="closeModal">✕</button>
      <div class="modal-body">
        <h2 style="font-size: 2rem; margin-bottom: 20px; color: var(--text-primary); text-align: center;">
          ❤️ My Wishlist (${wishlist.length})
        </h2>
        <div style="display: grid; gap: 15px;">
          ${wishlist.map(recipe => `
            <div style="display: flex; gap: 15px; padding: 15px; background: var(--meta-bg); border-radius: 12px; align-items: center;">
              <img src="${recipe.image}" style="width: 80px; height: 80px; border-radius: 10px; object-fit: cover;">
              <div style="flex: 1;">
                <h4 style="color: var(--text-primary); margin-bottom: 5px;">${recipe.name}</h4>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">${recipe.cuisine} • ${recipe.cookTimeMinutes} min</p>
              </div>
              <button onclick="removeFromWishlist(${recipe.id})" style="background: #ff6b6b; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;">
                Remove
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.getElementById("closeModal").addEventListener("click", () => {
    document.body.removeChild(modal);
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) document.body.removeChild(modal);
  });
}

function showCookedModal() {
  if (haveCooked.length === 0) {
    alert("You haven't cooked any recipes yet! Click ✅ on recipe cards after cooking.");
    return;
  }

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" id="closeModal">✕</button>
      <div class="modal-body">
        <h2 style="font-size: 2rem; margin-bottom: 20px; color: var(--text-primary); text-align: center;">
          ✅ Have Cooked (${haveCooked.length})
        </h2>
        <div style="display: grid; gap: 15px;">
          ${haveCooked.map(recipe => `
            <div style="display: flex; gap: 15px; padding: 15px; background: var(--meta-bg); border-radius: 12px; align-items: center;">
              <img src="${recipe.image}" style="width: 80px; height: 80px; border-radius: 10px; object-fit: cover;">
              <div style="flex: 1;">
                <h4 style="color: var(--text-primary); margin-bottom: 5px;">${recipe.name}</h4>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">${recipe.cuisine} • ${recipe.cookTimeMinutes} min</p>
              </div>
              <button onclick="removeFromCooked(${recipe.id})" style="background: #ff6b6b; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;">
                Remove
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.getElementById("closeModal").addEventListener("click", () => {
    document.body.removeChild(modal);
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) document.body.removeChild(modal);
  });
}

// Global functions untuk remove (dipanggil dari modal)
window.removeFromWishlist = function(recipeId) {
  wishlist = wishlist.filter(r => r.id !== recipeId);
  updateCounters();
  const modal = document.querySelector(".modal-overlay");
  if (modal) document.body.removeChild(modal);
  if (wishlist.length > 0) showWishlistModal();
};

window.removeFromCooked = function(recipeId) {
  haveCooked = haveCooked.filter(r => r.id !== recipeId);
  updateCounters();
  const modal = document.querySelector(".modal-overlay");
  if (modal) document.body.removeChild(modal);
  if (haveCooked.length > 0) showCookedModal();
};

// ============================================
// 5. LOGOUT HANDLER
// ============================================
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("firstName");
  sessionStorage.clear();
  window.location.href = "login.html";
});

// ============================================
// 6. SKELETON LOADING
// ============================================
function showSkeletonLoading() {
  recipesContainer.innerHTML = '';
  
  for (let i = 0; i < 6; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton-card";
    skeleton.style.animationDelay = `${i * 0.1}s`;
    
    skeleton.innerHTML = `
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-badge"></div>
        <div class="skeleton-meta">
          <div class="skeleton-meta-item"></div>
          <div class="skeleton-meta-item"></div>
        </div>
        <div class="skeleton-text"></div>
        <div class="skeleton-button"></div>
      </div>
    `;
    
    recipesContainer.appendChild(skeleton);
  }
}

// ============================================
// 7. FETCH DATA RECIPES
// ============================================
async function fetchRecipes() {
  try {
    showSkeletonLoading();

    const res = await fetch("https://dummyjson.com/recipes");
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    recipesData = data.recipes;
    filteredRecipes = recipesData;

    await new Promise(resolve => setTimeout(resolve, 500));

    populateCuisineFilter();
    displayedCount = 0;
    renderRecipes();

  } catch (err) {
    recipesContainer.innerHTML = `
      <div class="error-message">
        ⚠️ Gagal memuat data resep.<br>
        <small>Error: ${err.message}</small><br>
        <button onclick="fetchRecipes()" style="margin-top: 15px; padding: 10px 20px; background: white; color: #ff6b6b; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          🔄 Coba Lagi
        </button>
      </div>
    `;
    console.error("Fetch error:", err);
  }
}

// ============================================
// 8. POPULATE CUISINE FILTER DROPDOWN
// ============================================
function populateCuisineFilter() {
  const cuisines = [...new Set(recipesData.map(r => r.cuisine))].sort();

  filterCuisine.innerHTML = '<option value="">All Cuisine</option>';

  cuisines.forEach(cuisine => {
    const option = document.createElement("option");
    option.value = cuisine;
    option.textContent = cuisine;
    filterCuisine.appendChild(option);
  });
}

// ============================================
// 9. RENDER RECIPES (FUNGSI INTI)
// ============================================
function renderRecipes() {
  const recipesToShow = filteredRecipes.slice(0, displayedCount + ITEMS_PER_PAGE);
  displayedCount = recipesToShow.length;

  if (recipesToShow.length === 0) {
    recipesContainer.innerHTML = `
      <div class="message">
        <div style="font-size: 4rem; margin-bottom: 20px;">😔</div>
        <h3 style="margin-bottom: 10px;">Tidak ada resep yang cocok</h3>
        <p style="font-size: 0.95rem; color: var(--text-secondary);">
          Coba kata kunci lain atau reset filter
        </p>
        <button onclick="resetFilters()" style="margin-top: 20px; padding: 12px 24px; background: var(--primary-color); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">
          🔄 Reset Filter
        </button>
      </div>
    `;
    showMoreBtn.style.display = "none";
    return;
  }

  recipesContainer.innerHTML = "";

  recipesToShow.forEach((recipe, index) => {
    const card = createRecipeCard(recipe);
    card.style.animationDelay = `${(index % 6) * 0.05}s`;
    recipesContainer.appendChild(card);
  });

  showMoreBtn.style.display = displayedCount >= filteredRecipes.length ? "none" : "block";
}

// Global function untuk reset filter
window.resetFilters = function() {
  searchInput.value = '';
  filterCuisine.value = '';
  filteredRecipes = recipesData;
  displayedCount = 0;
  renderRecipes();
};

// ============================================
// 10. CREATE RECIPE CARD
// ============================================
function createRecipeCard(recipe) {
  const card = document.createElement("div");
  card.className = "recipe-card";

  const isInWishlist = wishlist.some(r => r.id === recipe.id);
  const isCooked = haveCooked.some(r => r.id === recipe.id);

  const starsHTML = generateStars(recipe.rating);
  const difficultyClass = recipe.difficulty || 'Medium';
  const ingredientsPreview = recipe.ingredients.slice(0, 3).join(", ") +
    (recipe.ingredients.length > 3 ? "..." : "");

  card.innerHTML = `
    <div class="recipe-card-image-wrapper">
      <img src="${recipe.image}" alt="${recipe.name}" loading="lazy">
      <div style="position: absolute; top: 10px; right: 10px; display: flex; gap: 8px;">
        <button class="wishlist-btn" data-id="${recipe.id}" style="
          background: ${isInWishlist ? '#ff6b6b' : 'rgba(255, 255, 255, 0.9)'};
          color: ${isInWishlist ? 'white' : '#ff6b6b'};
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        ">❤️</button>
        <button class="cooked-btn" data-id="${recipe.id}" style="
          background: ${isCooked ? '#4caf50' : 'rgba(255, 255, 255, 0.9)'};
          color: ${isCooked ? 'white' : '#4caf50'};
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        ">✅</button>
      </div>
    </div>
    <div class="recipe-content">
      <h3>${recipe.name}</h3>
      <div class="recipe-header">
        <span class="difficulty ${difficultyClass}">${difficultyClass}</span>
        <div class="rating">
          <span class="stars">${starsHTML}</span>
          <span class="rating-value">${recipe.rating.toFixed(1)}</span>
        </div>
      </div>
      <div class="recipe-meta">
        <div class="meta-item">🍽️ ${recipe.cuisine}</div>
        <div class="meta-item">⏱️ ${recipe.cookTimeMinutes} min</div>
        <div class="meta-item">👥 ${recipe.servings} servings</div>
      </div>
      <div class="ingredients-preview">
        <strong>Ingredients:</strong> ${ingredientsPreview}
      </div>
      <button class="view-btn" data-id="${recipe.id}">View Full Recipe</button>
    </div>
  `;

  return card;
}

// ============================================
// 11. GENERATE STARS HTML
// ============================================
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  let starsHTML = '★'.repeat(fullStars);
  if (hasHalfStar) starsHTML += '☆';
  starsHTML += '☆'.repeat(5 - Math.ceil(rating));
  
  return starsHTML;
}

// ============================================
// 12. SEARCH FUNCTIONALITY (dengan Debouncing)
// ============================================
let searchTimeout;

searchInput.addEventListener("input", (e) => {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    const searchTerm = e.target.value.toLowerCase().trim();
    const selectedCuisine = filterCuisine.value;
    applyFilters(searchTerm, selectedCuisine);
  }, 300);
});

// ============================================
// 13. CUISINE FILTER HANDLER
// ============================================
filterCuisine.addEventListener("change", (e) => {
  const selectedCuisine = e.target.value;
  const searchTerm = searchInput.value.toLowerCase().trim();
  applyFilters(searchTerm, selectedCuisine);
});

// ============================================
// 14. APPLY FILTERS (Search + Cuisine)
// ============================================
function applyFilters(searchTerm, cuisine) {
  let filtered = recipesData;

  if (cuisine) {
    filtered = filtered.filter(r => r.cuisine === cuisine);
  }

  if (searchTerm) {
    filtered = filtered.filter(recipe => {
      const matchName = recipe.name.toLowerCase().includes(searchTerm);
      const matchCuisine = recipe.cuisine.toLowerCase().includes(searchTerm);
      const matchIngredients = recipe.ingredients.some(ing =>
        ing.toLowerCase().includes(searchTerm)
      );
      const matchTags = recipe.tags.some(tag =>
        tag.toLowerCase().includes(searchTerm)
      );

      return matchName || matchCuisine || matchIngredients || matchTags;
    });
  }

  filteredRecipes = filtered;
  displayedCount = 0;
  renderRecipes();
}

// ============================================
// 15. SHOW MORE BUTTON HANDLER
// ============================================
showMoreBtn.addEventListener("click", () => {
  renderRecipes();
});

// ============================================
// 16. EVENT DELEGATION untuk Card Actions
// ============================================
recipesContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("view-btn")) {
    const recipeId = parseInt(e.target.dataset.id);
    const recipe = recipesData.find(r => r.id === recipeId);
    if (recipe) showRecipeModal(recipe);
  }

  if (e.target.classList.contains("wishlist-btn")) {
    const recipeId = parseInt(e.target.dataset.id);
    const recipe = recipesData.find(r => r.id === recipeId);
    toggleWishlist(recipe, e.target);
  }

  if (e.target.classList.contains("cooked-btn")) {
    const recipeId = parseInt(e.target.dataset.id);
    const recipe = recipesData.find(r => r.id === recipeId);
    toggleCooked(recipe, e.target);
  }
});

function toggleWishlist(recipe, button) {
  const index = wishlist.findIndex(r => r.id === recipe.id);
  
  if (index > -1) {
    wishlist.splice(index, 1);
    button.style.background = 'rgba(255, 255, 255, 0.9)';
    button.style.color = '#ff6b6b';
  } else {
    wishlist.push(recipe);
    button.style.background = '#ff6b6b';
    button.style.color = 'white';
  }
  
  updateCounters();
}

function toggleCooked(recipe, button) {
  const index = haveCooked.findIndex(r => r.id === recipe.id);
  
  if (index > -1) {
    haveCooked.splice(index, 1);
    button.style.background = 'rgba(255, 255, 255, 0.9)';
    button.style.color = '#4caf50';
  } else {
    haveCooked.push(recipe);
    button.style.background = '#4caf50';
    button.style.color = 'white';
  }
  
  updateCounters();
}

// ============================================
// 17. SHOW RECIPE MODAL (Simplified for teammate)
// ============================================
function showRecipeModal(recipe) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  modal.innerHTML = `
    <div class="modal-content recipe-modal">
      <button class="modal-close" id="closeModal">✕</button>
      <img src="${recipe.image}" alt="${recipe.name}" class="modal-image">
      <div class="modal-body">
        <h2 class="modal-title">${recipe.name}</h2>

        <div class="recipe-info">
          <span class="badge difficulty">${recipe.difficulty}</span>
          <span>⭐ ${recipe.rating.toFixed(1)}</span>
          <span>🍽️ ${recipe.cuisine}</span>
          <span>⏱️ ${recipe.cookTimeMinutes} min</span>
          <span>🔥 ${recipe.caloriesPerServing} kcal</span>
        </div>

        <h3>🧂 Ingredients</h3>
        <ul class="ingredients-list">
          ${recipe.ingredients.map(i => `<li>${i}</li>`).join("")}
        </ul>

        <h3>👨‍🍳 Instructions</h3>
        <ol class="instructions-list">
          ${recipe.instructions.map(step => `<li>${step}</li>`).join("")}
        </ol>

        <div class="tags">
          ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = document.getElementById("closeModal");
  closeBtn.addEventListener("click", () => {
    document.body.removeChild(modal);
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) document.body.removeChild(modal);
  });
}

// ============================================
// 18. SCROLL TO TOP FUNCTIONALITY
// ============================================
window.addEventListener('scroll', () => {
  if (window.pageYOffset > 300) {
    scrollTopBtn.classList.add('show');
  } else {
    scrollTopBtn.classList.remove('show');
  }
});

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

brandElement.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// ============================================
// 19. INITIALIZE APP
// ============================================
initDarkMode();
updateCounters();
fetchRecipes();