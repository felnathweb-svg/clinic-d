const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const appointmentForm = document.querySelector("#appointmentForm");
const counters = document.querySelectorAll(".counter");
const revealItems = document.querySelectorAll(".reveal");
const testimonialCards = document.querySelectorAll(".testimonial-card");
const sliderButtons = document.querySelectorAll(".slider-btn");
const sliderDots = document.querySelector(".slider-dots");
let testimonialIndex = 0;
let countersStarted = false;

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.classList.toggle("active", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.classList.remove("active");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");

      if (entry.target.classList.contains("stats-strip") && !countersStarted) {
        countersStarted = true;
        animateCounters();
      }
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach((item) => observer.observe(item));
const statsStrip = document.querySelector(".stats-strip");
if (statsStrip) observer.observe(statsStrip);

function animateCounters() {
  counters.forEach((counter) => {
    const target = Number(counter.dataset.target);
    const duration = 1400;
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(target * eased);
      counter.textContent = target >= 1000 ? value.toLocaleString("en-IN") : value;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counter.textContent = target >= 1000 ? target.toLocaleString("en-IN") : target;
      }
    }

    requestAnimationFrame(update);
  });
}

testimonialCards.forEach((_, index) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.setAttribute("aria-label", `Show testimonial ${index + 1}`);
  dot.addEventListener("click", () => showTestimonial(index));
  sliderDots.appendChild(dot);
});

function showTestimonial(index) {
  testimonialIndex = (index + testimonialCards.length) % testimonialCards.length;
  testimonialCards.forEach((card, cardIndex) => {
    card.classList.toggle("active", cardIndex === testimonialIndex);
  });
  sliderDots.querySelectorAll("button").forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === testimonialIndex);
  });
}

sliderButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.direction === "next" ? 1 : -1;
    showTestimonial(testimonialIndex + direction);
  });
});

setInterval(() => showTestimonial(testimonialIndex + 1), 5200);
showTestimonial(0);

const today = new Date().toISOString().split("T")[0];
document.querySelector("#date").setAttribute("min", today);

appointmentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const success = appointmentForm.querySelector(".form-success");
  success.textContent = "";

  const fields = [
    {
      input: appointmentForm.elements.name,
      message: "Please enter your name.",
      valid: (value) => value.trim().length >= 2
    },
    {
      input: appointmentForm.elements.phone,
      message: "Enter a valid 10-digit mobile number.",
      valid: (value) => /^\d{10}$/.test(value.trim())
    },
    {
      input: appointmentForm.elements.date,
      message: "Please choose a date.",
      valid: (value) => Boolean(value)
    },
    {
      input: appointmentForm.elements.time,
      message: "Please choose a time.",
      valid: (value) => Boolean(value)
    },
    {
      input: appointmentForm.elements.reason,
      message: "Please add a short reason for your visit.",
      valid: (value) => value.trim().length >= 5
    }
  ];

  let formIsValid = true;

  fields.forEach(({ input, message, valid }) => {
    const row = input.closest(".split") ? input.parentElement : input.closest(".form-row");
    const error = row.querySelector(".error-message");
    const isValid = valid(input.value);
    row.classList.toggle("invalid", !isValid);
    error.textContent = isValid ? "" : message;
    formIsValid = formIsValid && isValid;
  });

  if (!formIsValid) return;

  success.textContent = "Thank you. Your appointment request has been received.";
  appointmentForm.reset();
  document.querySelector("#date").setAttribute("min", today);
});
