// All localstroge operations are here
//intiliazation
function initStorage(){
    if (!localStorage.getItem('users')){
        localStorage.setItem('users',JSON.stringify([]))
    }
     if (!localStorage.getItem('posts')){
        localStorage.setItem('posts',JSON.stringify([]))
    }

}
//ID generator:
function generateId(){
     return '_' + Math.random().toString(36).substr(2, 9) + Date.now();
}
//users
function getUsers(){
    return JSON.parse(localStorage.getItem('users'))||[];
}
function saveUsers(users){
    localStorage.setItem('users', JSON.stringify(users));
}
function getUserById(id){
    const users = getUsers();
    return users.find(user => user.id === id)||null;
}
function getUserByEmail(email){
    const users= getUsers();
    return users.find(user=>user.email===email)||null;
}
//posts
function getPosts() {
  return JSON.parse(localStorage.getItem('posts')) || [];
}

function savePosts(posts) {
  localStorage.setItem('posts', JSON.stringify(posts));
}

function getPostById(id) {
  const posts = getPosts();
  return posts.find(post => post.id === id) || null;
}
//sessions 
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser')) || null;
}
function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}   
function clearCurrentUser() {
    localStorage.removeItem('currentUser');
}       
//AUTH GUARD{
function requireAuth(){
    if(!getCurrentUser()){
        window.location.href='login.html';
    }
}
function redirectIfLoggedIn(){
    if(getCurrentUser()){
        window.location.href='feed.html';
    }
}