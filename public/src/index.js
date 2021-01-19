document.getElementById("nav-button").addEventListener("click", ()=>{
    const nav = document.getElementById("navbar-toggle");
    const open = document.getElementById("open-button");
    const close = document.getElementById("close-button");
    nav.classList.toggle("opennav");
    open.classList.toggle("switchoff");
    close.classList.toggle("switchoff");
    console.log("test");
});
