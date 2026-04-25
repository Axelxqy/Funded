const donateDropdown = document.getElementById("donateDropdown");
const fundraiseDropdown = document.getElementById("fundraiseDropdown");
const aboutDropdown = document.getElementById("aboutDropdown");

const donateMenuBtn = document.getElementById("donateMenuBtn");
const fundraiseMenuBtn = document.getElementById("fundraiseMenuBtn");
const aboutMenuBtn = document.getElementById("aboutMenuBtn");

function closeAllDropdowns() {
  donateDropdown.classList.remove("open");
  fundraiseDropdown.classList.remove("open");
  aboutDropdown.classList.remove("open");
}

donateMenuBtn.addEventListener("click", function (event) {
  event.preventDefault();
  event.stopPropagation();

  const isOpen = donateDropdown.classList.contains("open");

  closeAllDropdowns();

  if (!isOpen) {
    donateDropdown.classList.add("open");
  }
});

fundraiseMenuBtn.addEventListener("click", function (event) {
  event.preventDefault();
  event.stopPropagation();

  const isOpen = fundraiseDropdown.classList.contains("open");

  closeAllDropdowns();

  if (!isOpen) {
    fundraiseDropdown.classList.add("open");
  }
});

aboutMenuBtn.addEventListener("click", function (event) {
  event.preventDefault();
  event.stopPropagation();

  const isOpen = aboutDropdown.classList.contains("open");

  closeAllDropdowns();

  if (!isOpen) {
    aboutDropdown.classList.add("open");
  }
});

document.addEventListener("click", function () {
  closeAllDropdowns();
});