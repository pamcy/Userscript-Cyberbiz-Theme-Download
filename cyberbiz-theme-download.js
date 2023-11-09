// ==UserScript==
// @name         Cyberbiz theme files download
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Pamcy
// @match        https://creerlab.cyberbiz.co/admin/themes/101041/assets
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cyberbiz.co
// @grant        GM_download
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip-utils/0.0.2/jszip-utils.min.js
// @require      https://fastcdn.org/FileSaver.js/1.1.20151003/FileSaver.min.js
// ==/UserScript==

// Reference: https://gist.github.com/PoomSmart/e7d1b5a8d56b5b78a24c2ae8b28a3e09

(function() {
    'use strict';

    console.log("Begin script");

    const parent = document.querySelector("#theme-editor-sidebar-top");
    const categories = {
        整體配置: "layout",
        樣板: "templates",
        片段: "snippets",
        附件: "assets",
        設定檔: "config",
    };

    let filePaths = [];

    function createBtn() {
        const sidebar = document.getElementById("sidebar");
        const button = document.createElement("button");

        button.innerText = "Save Theme Files";
        button.style.color = '#f4f3c5';
        button.style.backgroundColor = '#3b40ee';
        button.style.float = 'right';
        button.style.marginRight = '15px';
        button.style.cursor = 'pointer';

        button.onclick = async () => {
            await downloadAll();
        }

        if(sidebar) {
            console.log("Button created!");
            sidebar.appendChild(button);
            generateFileUrls();
        } else {
            alert("Something wrong when loading the button!")
        }
    }

    function generateFileUrls() {
        parent.querySelectorAll(".accordion-group").forEach((accordion) => {
            const title = accordion.querySelector(".accordion-toggle").textContent.trim();
            const prefix =
                  "https://creerlab.cyberbiz.co/admin/themes/101041/assets/master?key=";
            const category = categories[title];
            const urls = Array.from(accordion.querySelectorAll(".file")).map(
                (item) => prefix + category + "/" + item.textContent.trim()
            );

            filePaths = filePaths.concat(urls);
        });
    }

    function downloadAll() {
        if (!filePaths.length) {
            return
        }

        console.log("Start downloading...");

        let count = 0;
        let zip = new JSZip();

        filePaths.forEach(function(path) {
            const fileName = path.split('?key=')[1]; // ex. https://creerlab.cyberbiz.co/admin/themes/101041/assets/master?key=layout%2Ftheme.liquid

            JSZipUtils.getBinaryContent(path, function (err, data) {
                if (err) {
                    throw err;
                }

                zip.file(fileName, data, { binary: true });

                count++;

                if (count == filePaths.length) {
                    zip.generateAsync({ type: 'blob' }).then(function(content) {
                        const zipName = "cyberbiz-theme.zip";

                        saveAs(content, zipName);
                    });
                }
            });
        });
    }

    createBtn();

    console.log("End script");
})();