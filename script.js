/* =========================================================
   AVERA EDUCATION WEBSITE
   JAVASCRIPT
========================================================= */


/* =========================================================
   LINE 6
   CURSOR ELEMENTS
========================================================= */

const cursorDot =
  document.querySelector(".cursor-dot");

const cursorGlow =
  document.querySelector(".cursor-glow");

const cursorTrail =
  document.querySelector(".cursor-trail");


/* =========================================================
   LINE 15
   CURSOR POSITION
========================================================= */

let mouseX = 0;
let mouseY = 0;

let trailX = 0;
let trailY = 0;


document.addEventListener(
  "mousemove",
  (event) => {

    mouseX = event.clientX;
    mouseY = event.clientY;

    if (cursorDot) {

      cursorDot.style.left =
        `${mouseX}px`;

      cursorDot.style.top =
        `${mouseY}px`;
    }

    if (cursorGlow) {

      cursorGlow.style.left =
        `${mouseX}px`;

      cursorGlow.style.top =
        `${mouseY}px`;
    }

  }
);


/* =========================================================
   LINE 39
   SMOOTH CURSOR TRAIL
========================================================= */

function animateCursorTrail() {

  trailX +=
    (mouseX - trailX) * 0.12;

  trailY +=
    (mouseY - trailY) * 0.12;


  if (cursorTrail) {

    cursorTrail.style.left =
      `${trailX}px`;

    cursorTrail.style.top =
      `${trailY}px`;
  }


  requestAnimationFrame(
    animateCursorTrail
  );
}


animateCursorTrail();


/* =========================================================
   LINE 59
   CURSOR HOVER EFFECT
========================================================= */

const hoverElements =
  document.querySelectorAll(
    "a, button, .tilt-card"
  );


hoverElements.forEach(
  (element) => {

    element.addEventListener(
      "mouseenter",
      () => {

        if (cursorGlow) {

          cursorGlow.style.width =
            "45px";

          cursorGlow.style.height =
            "45px";
        }

        if (cursorTrail) {

          cursorTrail.style.width =
            "65px";

          cursorTrail.style.height =
            "65px";
        }

      }
    );


    element.addEventListener(
      "mouseleave",
      () => {

        if (cursorGlow) {

          cursorGlow.style.width =
            "28px";

          cursorGlow.style.height =
            "28px";
        }

        if (cursorTrail) {

          cursorTrail.style.width =
            "45px";

          cursorTrail.style.height =
            "45px";
        }

      }
    );

  }
);


/* =========================================================
   LINE 100
   HERO 3D CURSOR MOVEMENT
========================================================= */

const heroVisual =
  document.querySelector(
    ".hero-visual"
  );

const heroTitle =
  document.querySelector(
    ".hero-title"
  );


if (heroVisual) {

  heroVisual.addEventListener(
    "mousemove",
    (event) => {

      const rect =
        heroVisual.getBoundingClientRect();


      const x =
        event.clientX - rect.left;

      const y =
        event.clientY - rect.top;


      const centerX =
        rect.width / 2;

      const centerY =
        rect.height / 2;


      const rotateY =
        (x - centerX) / 30;

      const rotateX =
        (centerY - y) / 30;


      heroVisual.style.transform =
        `rotateX(${rotateX * 0.15}deg)
         rotateY(${rotateY * 0.15}deg)`;


      if (heroTitle) {

        heroTitle.style.transform =
          `translateZ(30px)
           rotateX(${rotateX * 0.15}deg)
           rotateY(${rotateY * 0.15}deg)`;
      }

    }
  );


  heroVisual.addEventListener(
    "mouseleave",
    () => {

      heroVisual.style.transform =
        "rotateX(0deg) rotateY(0deg)";


      if (heroTitle) {

        heroTitle.style.transform =
          "translateZ(0)";
      }

    }
  );

}


/* =========================================================
   LINE 155
   3D TILT CARDS
========================================================= */

const tiltCards =
  document.querySelectorAll(
    ".tilt-card"
  );


tiltCards.forEach(
  (card) => {

    card.addEventListener(
      "mousemove",
      (event) => {

        const rect =
          card.getBoundingClientRect();


        const x =
          event.clientX - rect.left;

        const y =
          event.clientY - rect.top;


        const centerX =
          rect.width / 2;

        const centerY =
          rect.height / 2;


        const rotateX =
          (centerY - y) / 18;

        const rotateY =
          (x - centerX) / 18;


        card.style.transform =
          `perspective(900px)
           rotateX(${rotateX}deg)
           rotateY(${rotateY}deg)
           translateY(-5px)`;

      }
    );


    card.addEventListener(
      "mouseleave",
      () => {

        card.style.transform =
          "perspective(900px) rotateX(0deg) rotateY(0deg)";

      }
    );

  }
);


/* =========================================================
   LINE 207
   SMOOTH NAVIGATION
========================================================= */

const navLinks =
  document.querySelectorAll(
    'a[href^="#"]'
  );


navLinks.forEach(
  (link) => {

    link.addEventListener(
      "click",
      (event) => {

        const targetId =
          link.getAttribute("href");


        if (
          !targetId ||
          targetId === "#"
        ) {
          return;
        }


        const target =
          document.querySelector(
            targetId
          );


        if (target) {

          event.preventDefault();


          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        }

      }
    );

  }
);


/* =========================================================
   LINE 247
   ACTIVE NAVIGATION
========================================================= */

const sections =
  document.querySelectorAll(
    "main section[id]"
  );


const navigationLinks =
  document.querySelectorAll(
    ".navbar nav a"
  );


window.addEventListener(
  "scroll",
  () => {

    let current =
      "home";


    sections.forEach(
      (section) => {

        const sectionTop =
          section.offsetTop - 150;


        if (
          window.scrollY >=
          sectionTop
        ) {

          current =
            section.getAttribute(
              "id"
            );

        }

      }
    );


    navigationLinks.forEach(
      (link) => {

        link.classList.remove(
          "active"
        );


        const href =
          link.getAttribute(
            "href"
          );


        if (
          href ===
          `#${current}`
        ) {

          link.classList.add(
            "active"
          );

        }

      }
    );

  }
);


/* =========================================================
   LINE 300
   PRICING BUTTON INTERACTION
========================================================= */

const pricingButtons =
  document.querySelectorAll(
    ".price-card button"
  );


pricingButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        button.textContent =
          "Coming Soon ✓";


        button.style.pointerEvents =
          "none";


        setTimeout(
          () => {

            button.textContent =
              "Start Learning";

            button.style.pointerEvents =
              "auto";

          },
          2500
        );

      }
    );

  }
);


/* =========================================================
   LINE 330
   PARALLAX FLOATING ELEMENTS
========================================================= */

const floatingElements =
  document.querySelectorAll(
    ".floating-book, .stat, .edu-sphere"
  );


window.addEventListener(
  "mousemove",
  (event) => {

    const x =
      (event.clientX /
        window.innerWidth) -
      0.5;


    const y =
      (event.clientY /
        window.innerHeight) -
      0.5;


    floatingElements.forEach(
      (element, index) => {

        const strength =
          (index + 1) * 3;


        element.style.marginLeft =
          `${x * strength}px`;


        element.style.marginTop =
          `${y * strength}px`;

      }
    );

  }
);


/* =========================================================
   LINE 371
   CONSOLE MESSAGE
========================================================= */

console.log(
  "AVERA Education Website loaded successfully."
);

console.log(
  "Created by ANKITA BOSE [SuuSri]"
);

/* =========================================================
   APPLICATION FORM POPUP
========================================================= */

const applicationModal =
  document.querySelector("#applicationModal");


const applicationOpeners =
  document.querySelectorAll(
    "[data-application-open]"
  );


const applicationClosers =
  document.querySelectorAll(
    "[data-application-close]"
  );


const applicationForm =
  document.querySelector("#applicationForm");


const applicationSuccess =
  document.querySelector("#applicationSuccess");


/* =========================================================
   OPEN APPLICATION
========================================================= */

function openApplicationForm() {

  if (!applicationModal) return;


  applicationModal.classList.add(
    "active"
  );


  applicationModal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.classList.add(
    "application-open"
  );


  const firstInput =
    applicationModal.querySelector(
      "input"
    );


  if (firstInput) {

    setTimeout(() => {

      firstInput.focus();

    }, 250);

  }

}


/* =========================================================
   CLOSE APPLICATION
========================================================= */

function closeApplicationForm() {

  if (!applicationModal) return;


  applicationModal.classList.remove(
    "active"
  );


  applicationModal.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.classList.remove(
    "application-open"
  );

}


/* =========================================================
   HERO + FOOTER BUTTONS
========================================================= */

applicationOpeners.forEach(
  (button) => {

    button.addEventListener(
      "click",
      openApplicationForm
    );

  }
);


/* =========================================================
   CLOSE BUTTON + BACKDROP
========================================================= */

applicationClosers.forEach(
  (element) => {

    element.addEventListener(
      "click",
      closeApplicationForm
    );

  }
);


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Escape" &&
      applicationModal &&
      applicationModal.classList.contains(
        "active"
      )
    ) {

      closeApplicationForm();

    }

  }
);


/* =========================================================
   APPLICATION SUBMIT
========================================================= */

if (applicationForm) {

  applicationForm.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();


      if (applicationSuccess) {

        applicationSuccess.classList.add(
          "show"
        );

      }


      applicationForm.reset();


      setTimeout(
        () => {

          if (applicationSuccess) {

            applicationSuccess.classList.remove(
              "show"
            );

          }


          closeApplicationForm();

        },
        2200
      );

    }
  );

}