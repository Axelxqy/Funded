const API_KEY = "e4zgj9lKG93LM9sRSKPcMrEIQ7DMoY3ZxkuGemhTR2cVkOxqtXPZGmQu";

const slideshowTrack = document.getElementById("slideshowTrack");
const prevBtn = document.getElementById("prevSlide");
const nextBtn = document.getElementById("nextSlide");

const donateBtn = document.getElementById("donateBtn");
const fundraiseBtn = document.getElementById("fundraiseBtn");
const profileBtn = document.getElementById("profileBtn");

const donateMenu = document.getElementById("donateMenu");
const fundraiseMenu = document.getElementById("fundraiseMenu");
const profileMenu = document.getElementById("profileMenu");

let images = [];
let currentIndex = 0;

async function loadPexelsImages() {
  try {
    const response = await fetch(
      "https://api.pexels.com/v1/search?query=charity donation volunteering fundraising&per_page=10",
      {
        headers: {
          Authorization: API_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error("Pexels request failed");
    }

    const data = await response.json();
    images = data.photos.slice(0, 10).map((photo) => photo.src.large);

    if (images.length > 0) {
      renderSlides();
    }
  } catch (error) {
    console.error("Failed to load slideshow images:", error);
  }
}

function getVisibleCount() {
  if (window.innerWidth <= 600) return 1;
  if (window.innerWidth <= 900) return 2;
  return 4;
}

function renderSlides() {
  const visibleCount = getVisibleCount();
  slideshowTrack.innerHTML = "";

  images.forEach((src, index) => {
    const card = document.createElement("div");
    card.className = "slide-card";
    card.style.flex = `0 0 calc(100% / ${visibleCount})`;

    const img = document.createElement("img");
    img.src = src;
    img.alt = `slide ${index + 1}`;

    card.appendChild(img);
    slideshowTrack.appendChild(card);
  });

  updateSlidePosition();
}

function updateSlidePosition() {
  const visibleCount = getVisibleCount();
  const slideWidthPercent = 100 / visibleCount;
  slideshowTrack.style.transform = `translateX(-${currentIndex * slideWidthPercent}%)`;
}

function nextSlide() {
  const visibleCount = getVisibleCount();
  const maxIndex = Math.max(images.length - visibleCount, 0);

  if (currentIndex < maxIndex) {
    currentIndex++;
  } else {
    currentIndex = 0;
  }

  updateSlidePosition();
}

function prevSlide() {
  const visibleCount = getVisibleCount();
  const maxIndex = Math.max(images.length - visibleCount, 0);

  if (currentIndex > 0) {
    currentIndex--;
  } else {
    currentIndex = maxIndex;
  }

  updateSlidePosition();
}

function closeAllMenus() {
  donateMenu.classList.remove("show");
  fundraiseMenu.classList.remove("show");
  profileMenu.classList.remove("show");
}

if (prevBtn && nextBtn) {
  prevBtn.addEventListener("click", prevSlide);
  nextBtn.addEventListener("click", nextSlide);
}

if (donateBtn) {
  donateBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = donateMenu.classList.contains("show");
    closeAllMenus();
    if (!isOpen) donateMenu.classList.add("show");
  });
}

if (fundraiseBtn) {
  fundraiseBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = fundraiseMenu.classList.contains("show");
    closeAllMenus();
    if (!isOpen) fundraiseMenu.classList.add("show");
  });
}

if (profileBtn) {
  profileBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = profileMenu.classList.contains("show");
    closeAllMenus();
    if (!isOpen) profileMenu.classList.add("show");
  });
}

document.addEventListener("click", () => {
  closeAllMenus();
});

window.addEventListener("resize", () => {
  const visibleCount = getVisibleCount();
  const maxIndex = Math.max(images.length - visibleCount, 0);

  if (currentIndex > maxIndex) {
    currentIndex = maxIndex;
  }

  if (images.length > 0) {
    renderSlides();
  }

  closeAllMenus();
});

loadPexelsImages();