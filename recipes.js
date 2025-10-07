// ============================================
// 1. CEK AUTENTIKASI & SETUP NAVBAR
// ============================================
const userName = localStorage.getItem("firstName");

if (!userName) {
  window.location.href = "login.html";
} else {
  document.getElementById("greeting").textContent = `👋 Hi, ${userName}!`;
}

// Logout Handler
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

// ============================================
// 2. VARIABEL GLOBAL & DOM ELEMENTS
// ============================================
let recipesData = [];
let filteredRecipes = [];
let displayedCount = 0;
const ITEMS_PER_PAGE = 6;

const recipesContainer = document.getElementById("recipesContainer");
const showMoreBtn = document.getElementById("showMoreBtn");
const searchInput = document.getElementById("searchInput");
const filterCuisine = document.getElementById("filterCuisine");

// ============================================
// 3. FETCH DATA RECIPES
// ============================================
async function fetchRecipes() {
  try {
    recipesContainer.innerHTML = '<div class="message">⏳ Loading recipes...</div>';

    const res = await fetch("https://dummyjson.com/recipes");
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    recipesData = data.recipes;
    filteredRecipes = recipesData;

    populateCuisineFilter();
    displayedCount = 0;
    renderRecipes();

  } catch (err) {
    recipesContainer.innerHTML = `
      <div class="error-message">
        ⚠️ Gagal memuat data resep.<br>
        <small>Error: ${err.message}</small>
      </div>
    `;
    console.error("Fetch error:", err);
  }
}

// ============================================
// 4. POPULATE CUISINE FILTER DROPDOWN
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
// 5. RENDER RECIPES (FUNGSI INTI)
// ============================================
function renderRecipes() {
  const recipesToShow = filteredRecipes.slice(0, displayedCount + ITEMS_PER_PAGE);
  displayedCount = recipesToShow.length;

  if (recipesToShow.length === 0) {
    recipesContainer.innerHTML = '<div class="message">😔 Tidak ada resep yang cocok dengan pencarian Anda.</div>';
    showMoreBtn.style.display = "none";
    return;
  }

  recipesContainer.innerHTML = "";

  recipesToShow.forEach(recipe => {
    const card = createRecipeCard(recipe);
    recipesContainer.appendChild(card);
  });

  // Show/hide "Show More" button
  showMoreBtn.style.display = displayedCount >= filteredRecipes.length ? "none" : "block";
}

// ============================================
// 6. CREATE RECIPE CARD
// ============================================
function createRecipeCard(recipe) {
  const card = document.createElement("div");
  card.className = "recipe-card";

  // Generate star rating
  const starsHTML = generateStars(recipe.rating);

  // Difficulty class
  const difficultyClass = recipe.difficulty || 'Medium';

  // Ingredients preview (first 3)
  const ingredientsPreview = recipe.ingredients.slice(0, 3).join(", ") +
    (recipe.ingredients.length > 3 ? "..." : "");

  card.innerHTML = `
    <img src="${recipe.image}" alt="${recipe.name}">
    <div class="recipe-content">
      <h3>${recipe.name}</h3>
      <span class="difficulty ${difficultyClass}">${difficultyClass}</span>
      <div class="rating">
        <span class="stars">${starsHTML}</span>
        <span class="rating-value">${recipe.rating.toFixed(1)}</span>
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
// 7. GENERATE STARS HTML
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
// 8. SEARCH FUNCTIONALITY (dengan Debouncing)
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
// 9. CUISINE FILTER HANDLER
// ============================================
filterCuisine.addEventListener("change", (e) => {
  const selectedCuisine = e.target.value;
  const searchTerm = searchInput.value.toLowerCase().trim();
  applyFilters(searchTerm, selectedCuisine);
});

// ============================================
// 10. APPLY FILTERS (Search + Cuisine)
// ============================================
function applyFilters(searchTerm, cuisine) {
  let filtered = recipesData;

  // Filter by cuisine
  if (cuisine) {
    filtered = filtered.filter(r => r.cuisine === cuisine);
  }

  // Filter by search term
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
// 11. SHOW MORE BUTTON HANDLER
// ============================================
showMoreBtn.addEventListener("click", () => {
  renderRecipes();
});

// ============================================
// 12. VIEW FULL RECIPE (Event Delegation)
// ============================================
recipesContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("view-btn")) {
    const recipeId = parseInt(e.target.dataset.id);
    const recipe = recipesData.find(r => r.id === recipeId);

    if (recipe) {
      showRecipeModal(recipe);
    }
  }
});

// ============================================
// 13. SHOW RECIPE MODAL (Simplified for teammate)
// ============================================
function showRecipeModal(recipe) {
  /*
   * TODO: Bagian ini akan dikembangkan oleh teman Anda
   * 
   * Data recipe yang tersedia:
   * - recipe.id, recipe.name, recipe.image
   * - recipe.rating, recipe.difficulty
   * - recipe.cuisine, recipe.cookTimeMinutes, recipe.prepTimeMinutes
   * - recipe.servings, recipe.caloriesPerServing
   * - recipe.ingredients (array of strings)
   * - recipe.instructions (array of strings)
   * - recipe.tags (array of strings)
   * 
   * Teman Anda bisa mendesain tampilan modal sesuai kreativitas
   * dengan menampilkan semua data di atas dengan layout yang menarik
   */

  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" id="closeModal">✕</button>
      
      <img src="${recipe.image}" alt="${recipe.name}" class="modal-image">
      
      <div class="modal-body">
        <h2 style="font-size: 2rem; margin-bottom: 20px; color: #333; text-align: center;">
          ${recipe.name}
        </h2>
        
        <!-- TODO: Teman Anda bisa mengembangkan konten di sini -->
        <div style="text-align: center; padding: 40px; color: #666; background: #f9f9f9; border-radius: 10px;">
          <p style="font-size: 1.3rem; margin-bottom: 15px;">🚧 Detail Resep Sedang Dikembangkan 🚧</p>
          <p style="font-size: 0.95rem; line-height: 1.8; margin-bottom: 20px;">
            Bagian ini akan diisi oleh teman Anda dengan tampilan yang lebih lengkap dan menarik:
          </p>
          <div style="text-align: left; max-width: 500px; margin: 0 auto;">
            <p style="margin-bottom: 8px;">✓ Rating & Difficulty Badge</p>
            <p style="margin-bottom: 8px;">✓ Info Lengkap (Cuisine, Waktu Memasak, Servings, Kalori)</p>
            <p style="margin-bottom: 8px;">✓ Daftar Ingredients yang lengkap</p>
            <p style="margin-bottom: 8px;">✓ Langkah-langkah Instructions step by step</p>
            <p style="margin-bottom: 8px;">✓ Tags Resep dengan styling menarik</p>
          </div>
        </div>
        
        <!-- Preview data yang tersedia (untuk development) -->
        <div style="background: #fff3e0; padding: 15px; border-radius: 10px; margin-top: 20px; border-left: 4px solid #ff7b54;">
          <p style="font-size: 0.9rem; color: #333; margin-bottom: 8px; font-weight: 600;">
            📊 Preview Data Tersedia:
          </p>
          <p style="font-size: 0.8rem; color: #666; line-height: 1.8;">
            <strong>Rating:</strong> ${recipe.rating} ⭐<br>
            <strong>Difficulty:</strong> ${recipe.difficulty}<br>
            <strong>Cuisine:</strong> ${recipe.cuisine}<br>
            <strong>Cook Time:</strong> ${recipe.cookTimeMinutes} minutes<br>
            <strong>Prep Time:</strong> ${recipe.prepTimeMinutes} minutes<br>
            <strong>Servings:</strong> ${recipe.servings} people<br>
            <strong>Calories:</strong> ${recipe.caloriesPerServing} per serving<br>
            <strong>Ingredients:</strong> ${recipe.ingredients.length} items<br>
            <strong>Instructions:</strong> ${recipe.instructions.length} steps<br>
            <strong>Tags:</strong> ${recipe.tags.join(", ")}
          </p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close modal handlers
  const closeBtn = document.getElementById("closeModal");
  closeBtn.addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

// ============================================
// 14. INITIALIZE APP
// ============================================
fetchRecipes();