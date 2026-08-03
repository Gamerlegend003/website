// =========================================================
// Smooth reveal animation when sections enter the screen
// =========================================================

const sections = document.querySelectorAll("section");

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    },
    {
        threshold: 0.15
    }
);

sections.forEach((section) => {

    section.style.opacity = "0";
    section.style.transform = "translateY(30px)";
    section.style.transition = "all 0.8s ease";

    observer.observe(section);

});


// =========================================================
// Prototype image slideshow — canvas-based.
//
// Drawing an already-decoded image onto a canvas with
// drawImage() is synchronous, so there's no window where a
// half-resampled frame can show (which is what was happening
// with a plain <img src=...> swap, especially on high-contrast
// photos).
// =========================================================

const prototypeImages = [
    "assets/id-badge-front.jpeg",
    "assets/id-badge-back.jpeg",
    "assets/id-badge-top.jpeg"
];

const canvas = document.getElementById("prototypeCanvas");
const card = document.querySelector(".prototype-card");
const ctx = canvas ? canvas.getContext("2d") : null;

const decodedImages = []; // fully-decoded HTMLImageElements, same order as prototypeImages
let currentImage = 0;
let slideshow;

if (!canvas) {
    console.warn(
        'Prototype slideshow: no element with id="prototypeCanvas" found. ' +
        "Check that your <canvas> tag's id matches exactly (case-sensitive)."
    );
}
if (!card) {
    console.warn(
        'Prototype slideshow: no element with class="prototype-card" found.'
    );
}

// Force the sizing/appearance in JS so this doesn't silently break
// if the CSS rule for ".prototype-card canvas" is missing or wrong.
function ensureCanvasStyle() {
    if (!canvas) return;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    if (!canvas.style.transition) {
        canvas.style.transition = "opacity 0.3s ease";
    }
}

function sizeCanvasToBox() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return; // not laid out yet
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
}

// Draws `img` into the canvas using the same crop math as CSS object-fit: cover.
function drawCover(img) {
    if (!ctx || !canvas.width || !canvas.height || !img) return;

    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;

    let sx, sy, sw, sh;

    if (imgRatio > canvasRatio) {
        // image is relatively wider than the box -> crop left/right
        sh = img.height;
        sw = sh * canvasRatio;
        sy = 0;
        sx = (img.width - sw) / 2;
    } else {
        // image is relatively taller than the box -> crop top/bottom
        sw = img.width;
        sh = sw / canvasRatio;
        sx = 0;
        sy = (img.height - sh) / 2;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
}

function redrawCurrent() {
    sizeCanvasToBox();
    drawCover(decodedImages[currentImage]);
}

async function preloadAndDecode(src) {
    const img = new Image();
    img.src = src;
    try {
        await img.decode();
    } catch (e) {
        // decode() can reject on older browsers/network hiccups; the
        // image is still usable, just without the guarantee.
    }
    return img;
}

function changePrototype() {
    if (!canvas || decodedImages.length === 0) return;

    canvas.style.opacity = 0;

    setTimeout(() => {
        currentImage = (currentImage + 1) % decodedImages.length;
        drawCover(decodedImages[currentImage]); // synchronous, already decoded
        canvas.style.opacity = 1;
    }, 300);
}

async function initPrototypeSlideshow() {
    if (!canvas) return;

    ensureCanvasStyle();

    const loaded = await Promise.all(prototypeImages.map(preloadAndDecode));
    decodedImages.push(...loaded);

    // Watch the container's actual rendered size rather than sizing
    // once at load — this is what makes it correct regardless of
    // when layout/fonts/CSS finish settling.
    if (window.ResizeObserver && card) {
        const ro = new ResizeObserver(() => redrawCurrent());
        ro.observe(card);
    } else {
        // Fallback for very old browsers.
        window.addEventListener("resize", redrawCurrent);
        redrawCurrent();
    }

    slideshow = setInterval(changePrototype, 3500);

    if (card) {
        card.addEventListener("mouseenter", () => clearInterval(slideshow));
        card.addEventListener("mouseleave", () => {
            slideshow = setInterval(changePrototype, 3500);
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const prototypeImages = [
        "assets/id-badge-front.jpeg",
        "assets/id-badge-back.jpeg",
        "assets/id-badge-top.jpeg"
    ];

    let currentIndex = 0;
    let isTransitioning = false;
    const imgElement = document.getElementById("prototypeImage");

    if (imgElement) {
        setInterval(() => {
            if (isTransitioning) return;

            isTransitioning = true;
            imgElement.style.opacity = "0";

            setTimeout(() => {
                currentIndex = (currentIndex + 1) % prototypeImages.length;
                imgElement.src = prototypeImages[currentIndex];
                imgElement.style.opacity = "1";
                isTransitioning = false;
            }, 700);
        }, 5000);
    }
});


console.log("Ilyan Allana Portfolio Loaded");