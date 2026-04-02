// https://www.youtube.com/watch?v=DfSYmk_6vk8
window.onload = function() {
    slideOne();
    slideTwo();
}

let sliderOne = document.getElementById("slider-1");
let sliderTwo = document.getElementById("slider-2");
let displayValOne = document.getElementById("range1");
let displayValTwo = document.getElementById("range2");
let minGap = 0;
let slidertrack = document.querySelector(".slider-track");
let sliderMaxValue = document.getElementById("slider-1").max;
const filterBtn = document.getElementById("filterbutton");
const filteropties = document.getElementById("filtergedeelte");
const closeBtn = document.getElementById("annuleer");

// openen/sluiten
if (filterBtn) {
    filterBtn.addEventListener("click", () => {
        filteropties.classList.add("open");
    });
}

if (closeBtn) {
    closeBtn.addEventListener("click", () => {
        filteropties.classList.remove("open");
    });
};

function slideOne() {
    if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap) {
        sliderOne.value = parseInt(sliderTwo.value) -minGap;
    }
    displayValOne.textContent = sliderOne.value;
    fillColor();
}

function slideTwo() {
    if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap) {
        sliderTwo.value = parseInt(sliderOne.value) + minGap;
    }
    displayValTwo.textContent = sliderTwo.value;
    fillColor();
}

function fillColor() {
    percent1 = (sliderOne.value / sliderMaxValue) * 100;
    percent2 = (sliderTwo.value / sliderMaxValue) * 100;
    slidertrack.style.background = `linear-gradient(to right, 
    hsl(0, 0%, 85%) ${percent1}%,
  hsl(187, 69%, 37%) ${percent1}%,
  hsl(187, 69%, 37%) ${percent2}%,
  hsl(0, 0%, 85%) ${percent2}%)`;
}