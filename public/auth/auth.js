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
                // var jsonData = JSON.parse(request.response);
                // console.log(jsonData)
                window.location.href = "/";
            }
        }
        var accountId = document.getElementById("accountIdField").value
        var password = document.getElementById("passwordField").value
        var data = JSON.stringify({ accountId, password })
        request.send(data)
    });
}

function signOut() {
    console.log('signOut')
    var request = new XMLHttpRequest()
    var url = "/auth";
    request.open("POST", url, true)
    request.setRequestHeader("Content-Type", "application/json")
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            // var jsonData = JSON.parse(request.response);
            // console.log(jsonData)
            window.location.href = "/signin/";
        }
    }
    var data = JSON.stringify({ }) // no credentials -> logout
    request.send(data)
}
