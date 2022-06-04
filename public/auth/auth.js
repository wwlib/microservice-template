'use strict'

function setupSigninForm() {
    const signinForm = document.getElementById("signin-form");
    signinForm.addEventListener("submit", function (event) {
        event.preventDefault()
        var request = new XMLHttpRequest()
        var url = "/auth";
        request.open("POST", url, true)
        request.setRequestHeader("Content-Type", "application/json")
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                var jsonData = JSON.parse(request.response);
                console.log(jsonData)
                console.log(document.cookie.split(";"))
                window.location.href = "/console/";
            }
        }
        var username = document.getElementById("usernameField").value
        var password = document.getElementById("passwordField").value
        var data = JSON.stringify({ username, password })
        request.send(data)
    });
}

function signOut() {
    console.log('signOut')
    const cookies = document.cookie.split(";");
    cookies.forEach(cookie => {
        console.log(cookie)

    })
    var request = new XMLHttpRequest()
    var url = "/auth";
    request.open("POST", url, true)
    request.setRequestHeader("Content-Type", "application/json")
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            var jsonData = JSON.parse(request.response);
            console.log(jsonData)
        }
    }
    var data = JSON.stringify({ }) // no credentials -> logout
    request.send(data)
    window.location.href = "/signin/";
}
