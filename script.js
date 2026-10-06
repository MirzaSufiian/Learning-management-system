
// Find one element on the page
function find(selector) {
    return document.querySelector(selector);
}
 
// Find all elements that match the selector
function findAll(selector) {
    return document.querySelectorAll(selector);
}
 
// Open another page
function goTo(page) {
    window.location.href = page;
}
 
// Read a saved list from the browser (returns an empty list if nothing is saved)
function getList(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}
 
// Save a list in the browser
function saveList(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
}
 
// Check if the user has logged in
function isLoggedIn() {
    return localStorage.getItem("isLoggedIn") === "true";
}
 
 
/* ---------- 2. Button Actions ---------- */
// Every button on the site is checked here by its text
 
function handleButton(button) {
    const text = button.textContent.trim();
 
    if (button.title === "Notifications") {
        alert("You have 2 new notifications.");
    } else if (button.title === "Messages") {
        alert("You have 1 new message.");
    } else if (text === "Login") {
        login();
    } else if (text === "Register Now" || text === "Join Now") {
        alert("Registration page coming soon!");
    } else if (text === "Explore Courses") {
        goTo("courses.html");
    } else if (text === "Contact US") {
        goTo("contact.html");
    } else if (text === "View Details") {
        goTo("course-details.html");
    } else if (text === "Add to Wishlist") {
        addToWishlist(button);
    } else if (text === "Enroll" || text === "Enroll Now") {
        if (button.closest(".recommend-card")) {
            enrollFromCard(button);
        } else if (find(".course-banner")) {
            enrollInCourse();
        } else {
            goTo("course-details.html");
        }
    }
}
 
function setupButtons() {
    findAll("button").forEach(function (button) {
        button.addEventListener("click", function () {
            handleButton(button);
        });
    });
}
 
 
/* ---------- 3. Login and Enrollment ---------- */
 
function login() {
    localStorage.setItem("isLoggedIn", "true");
    goTo("dashboard.html");
}
 
// Enroll button on the course details page
function enrollInCourse() {
    if (!isLoggedIn()) {
        alert("Please login first.");
        return;
    }
 
    const title = find(".course-banner h1").textContent;
    const courses = getList("myCourses");
 
    if (courses.includes(title)) {
        alert("You are already enrolled in this course.");
        return;
    }
 
    courses.push(title);
    saveList("myCourses", courses);
    alert("Course added to My Courses!");
    goTo("dashboard.html");
}
 
// Enroll button on a recommended course card
function enrollFromCard(button) {
    const title = button.parentElement.querySelector("h4").textContent;
    const courses = getList("myCourses");
 
    if (!courses.includes(title)) {
        courses.push(title);
        saveList("myCourses", courses);
    }
 
    button.textContent = "Enrolled ✓";
    button.disabled = true;
}
 
// Wishlist button on the course details page
function addToWishlist(button) {
    const title = find(".course-banner h1").textContent;
    const wishlist = getList("wishlist");
 
    if (!wishlist.includes(title)) {
        wishlist.push(title);
        saveList("wishlist", wishlist);
    }
 
    button.textContent = "Added ✓";
}
 
 
/* ---------- 4. Search and Filter ---------- */
 
// Show only the cards whose title contains the search text
function filterCards(cards, searchText) {
    cards.forEach(function (card) {
        const title = card.querySelector("h3, h4").textContent.toLowerCase();
 
        if (title.includes(searchText)) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
}
 
// Courses page: search box + category + price
function setupCourseFilter() {
    const form = find(".filter form");
 
    if (!form) {
        return;
    }
 
    const searchBox = form.querySelector("input");
    const selects = form.querySelectorAll("select");
    const categorySelect = selects[0];
    const priceSelect = selects[1];
 
    function applyFilter() {
        const searchText = searchBox.value.toLowerCase();
        const category = categorySelect.options[categorySelect.selectedIndex].text;
        const price = priceSelect.value;
 
        findAll(".catalog-card").forEach(function (card) {
            const title = card.querySelector("h3").textContent.toLowerCase();
            const cardCategory = card.querySelector("p").textContent;
            const cardPrice = parseFloat(card.querySelector("p:last-of-type").textContent.replace("$", ""));
 
            let matchesCategory = true;
            let matchesPrice = true;
 
            if (category !== "All Categories") {
                matchesCategory = cardCategory === category;
            }
 
            if (price === "free") {
                matchesPrice = cardPrice === 0;
            } else if (price === "under50") {
                matchesPrice = cardPrice < 50;
            } else if (price === "above50") {
                matchesPrice = cardPrice >= 50;
            }
 
            if (title.includes(searchText) && matchesCategory && matchesPrice) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        });
    }
 
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilter();
    });
 
    searchBox.addEventListener("input", applyFilter);
    categorySelect.addEventListener("change", applyFilter);
    priceSelect.addEventListener("change", applyFilter);
}
 
// Categories page and My Courses page: simple search box
function setupSearchBox() {
    const form = find(".search form");
 
    if (!form) {
        return;
    }
 
    const searchBox = form.querySelector("input");
    const cards = findAll(".category-card, .enrolled-card, .completed-card");
 
    function search() {
        filterCards(cards, searchBox.value.toLowerCase());
    }
 
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        search();
    });
 
    searchBox.addEventListener("input", search);
}
 
// My Courses page: All / In Progress / Completed / Not Started buttons
function setupMyCoursesFilter() {
    const buttons = findAll(".filter > button");
 
    if (buttons.length === 0) {
        return;
    }
 
    const enrolled = find(".enrolled");
    const completed = find(".completed");
 
    buttons.forEach(function (button) {
        button.addEventListener("click", function () {
            const choice = button.textContent.trim();
 
            // Show or hide the two sections
            enrolled.style.display = "none";
            completed.style.display = "none";
 
            if (choice === "All Courses") {
                enrolled.style.display = "";
                completed.style.display = "";
            } else if (choice === "In Progress") {
                enrolled.style.display = "";
            } else if (choice === "Completed") {
                completed.style.display = "";
            }
 
            // Highlight the button that was clicked
            buttons.forEach(function (otherButton) {
                otherButton.style.backgroundColor = "";
                otherButton.style.color = "";
            });
 
            button.style.backgroundColor = "#1e3a5f";
            button.style.color = "white";
        });
    });
}
 
 
/* ---------- 5. Dashboard and My Courses Animations ---------- */
 
// Progress bars fill up from 0 to their value
function animateProgressBars() {
    findAll("progress").forEach(function (bar) {
        const target = bar.value;
        bar.value = 0;
 
        const timer = setInterval(function () {
            if (bar.value >= target) {
                clearInterval(timer);
            } else {
                bar.value = bar.value + 1;
            }
        }, 15);
    });
}
 
// Numbers in the statistic cards count up from 0
function animateNumbers() {
    const numbers = findAll(".summary-card p");
 
    if (numbers.length === 0) {
        return;
    }
 
    // The first card shows the total courses, so add the newly enrolled courses
    const firstTarget = Number(numbers[0].textContent) + getList("myCourses").length;
    numbers[0].textContent = firstTarget;
 
    numbers.forEach(function (number) {
        const target = Number(number.textContent);
        let current = 0;
        number.textContent = 0;
 
        const timer = setInterval(function () {
            if (current >= target) {
                clearInterval(timer);
                return;
            }
 
            current = current + 1;
            number.textContent = current;
        }, 100);
    });
}
 
 
/* ---------- 6. Contact Page ---------- */
 
// Form validation
function setupContactForm() {
    const form = find(".form form");
 
    if (!form) {
        return;
    }
 
    // A small paragraph to show the result under the form
    const message = document.createElement("p");
    form.appendChild(message);
 
    form.addEventListener("submit", function (event) {
        event.preventDefault();
 
        const name = form.querySelector("#name").value.trim();
        const email = form.querySelector("#email").value.trim();
        const text = form.querySelector("#message").value.trim();
 
        if (name === "" || email === "" || text === "") {
            message.textContent = "Please fill in all the fields.";
            message.style.color = "red";
        } else if (!email.includes("@") || !email.includes(".")) {
            message.textContent = "Please enter a valid email address.";
            message.style.color = "red";
        } else {
            message.textContent = "Thank you " + name + "! Your message has been sent.";
            message.style.color = "green";
            form.reset();
        }
    });
}
 
// FAQ: click a question to show or hide its answer
function setupFaq() {
    findAll(".faq-card").forEach(function (card) {
        const question = card.querySelector("h4");
        const answer = card.querySelector("p");
 
        answer.style.display = "none";
        question.style.cursor = "pointer";
 
        question.addEventListener("click", function () {
            if (answer.style.display === "none") {
                answer.style.display = "block";
            } else {
                answer.style.display = "none";
            }
        });
    });
}
 
 
/* ---------- 7. Start Everything ---------- */
 
setupButtons();
setupCourseFilter();
setupSearchBox();
setupMyCoursesFilter();
animateProgressBars();
animateNumbers();
setupContactForm();
setupFaq();