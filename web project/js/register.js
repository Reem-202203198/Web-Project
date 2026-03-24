//redirect
redirectIfLoggedIn();
//initialize storage
initStorage();

//validation functions
function isValidEmail(email){
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPassword(password){
    const hasNumber = /\d/.test(password);
    return password.length >= 8 && hasNumber;

}
function showError(fieldId, message){
    const errorEl = document.getElementById(fieldId + '-error');
    if(errorEl){
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
}

