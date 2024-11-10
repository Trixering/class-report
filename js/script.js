function openMenu(s) {
    const menu = document.getElementById(s);
    const otherMenu = s === "repo-menu" ? document.getElementById("about-menu") : document.getElementById("repo-menu");

    if (menu.style.display === "none" || menu.style.display === "") {
        menu.style.display = "block";
        otherMenu.style.display = "none";
    } else {
        menu.style.display = "none";
    }
}

