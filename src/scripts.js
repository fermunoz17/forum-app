document.getElementById("signin-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    alert(`Logging in with: \nEmail: ${email} \nPassword: ${password}`);
});

document.getElementById("signup-btn").addEventListener("click", function () {
    alert("Redirecting to sign up page...");
});

document.getElementById("signin-btn").addEventListener("click", function () {
    document.getElementById("email").focus();
});
