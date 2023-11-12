// ==UserScript==
// @name         Cyberbiz theme files download
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Download all files from the Cyberbiz theme to your local machine
// @author       Pamcy
// @match        https://creerlab.cyberbiz.co/admin/themes/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cyberbiz.co
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip-utils/0.0.2/jszip-utils.min.js
// @updateURL    https://raw.githubusercontent.com/pamcy/Userscript-Cyberbiz-Theme-Download/main/cyberbiz-theme-download.js
// @license      MIT
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

    function createDownloadBtn() {
        const sidebar = document.getElementById("sidebar");
        const button = document.createElement("button");

        button.innerText = "Download Theme Files";
        button.style.color = '#f4f3c5';
        button.style.backgroundColor = '#3b40ee';
        button.style.float = 'right';
        button.style.marginRight = '15px';
        button.style.cursor = 'pointer';

        button.onclick = async () => {
            const number  = await getThemeNumber();
            await generateFileUrls(number);
            await downloadAll();
        }

        if(sidebar) {
            sidebar.appendChild(button);

            console.log("Button created!");
        } else {
            alert("Something wrong when loading the button!")
        }
    }

    function getThemeNumber() {
        const match = window.location.pathname.match(/\/(\d+)\//);
        const themeNumber = match ? match[1] : null;

        return themeNumber;
    }

    function generateFileUrls(themeNumber) {
        if (!themeNumber) {
            alert("Theme number is not found!");

            return;
        }

        console.log('Theme number: ' + themeNumber);

        parent.querySelectorAll(".accordion-group").forEach((accordion) => {
            const title = accordion.querySelector(".accordion-toggle").textContent.trim();
            const prefix =
                  `https://creerlab.cyberbiz.co/admin/themes/${themeNumber}/assets/master?key=`;
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

                        console.log("Download completed: there are " + filePaths.length + " files.");
                        console.log("End script");
                    });
                }
            });
        });
    }

    createDownloadBtn();
})();