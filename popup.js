const importBookmarks = async () => {
    await chrome.extension.getBackgroundPage().importBookmarks();
}

document.getElementById("import").addEventListener("click", async ()=> {
    await importBookmarks()
}, false);
