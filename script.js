let isEditorReady = false;
let currentProject = "exampleproject"; 
let editor;
let currentFile;
let fileContents = {}; // Cache file contents by filename
let isEmmetRegistered = false; // Add a global flag to track Emmet registration

async function initMonacoEditor(filename, lang) {
    try {
        if (lang === "js") {
            lang = "javascript";
        }

        // Update existing tabs to remove 'active' and 'selected' classes
        const tabsContainer = document.getElementById("tabs");
        const existingTab = tabsContainer.querySelector(`[data-resource-name="${filename}"]`);
        document.getElementById("editor-container").style.display = "block"; // Replace with your actual container ID

        // Check if the tab already exists
        if (existingTab) {
            // Activate the existing tab
            activateTab(existingTab, filename);
            return; // Exit the function since the tab already exists
        }

        const tabs = tabsContainer.querySelectorAll(".tab");
        tabs.forEach(tab => {
            tab.classList.remove("active", "selected");
            tab.setAttribute("aria-selected", "false");
        });

        // Add a new tab and set it as active
        tabsContainer.innerHTML += `
        <div draggable="true" role="tab" class="tab tab-actions-right sizing-fit has-icon tab-border-bottom active selected tab-border-top" 
            aria-label="${filename}" aria-description="" custom-hover="true" data-resource-name="${filename}" 
            aria-selected="true" tabindex="0" style="left: auto; border-right: 1px solid rgb(27, 31, 35); 
            --tab-border-bottom-color: #24292e; --tab-border-top-color: #f9826c;" 
            onclick="handleTabClick('${filename}');">
            <div class="tab-border-top-container"></div>
            <div class="monaco-icon-label file-icon codespaces-blank-name-dir-icon ${filename}-name-file-icon name-file-icon ${lang}-ext-file-icon ext-file-icon ${lang}-lang-file-icon tab-label tab-label-has-badge" 
                aria-label="${filename}">
                <div class="monaco-icon-label-container">
                    <span class="monaco-icon-name-container">
                        <a class="label-name">${filename}</a>
                    </span>
                </div>
            </div>
            <div class="tab-actions">
                <div class="monaco-action-bar">
                    <ul class="actions-container" role="toolbar" aria-label="Tab actions">
                        <li class="action-item" role="presentation" custom-hover="true">
                            <a class="action-label codicon codicon-close" role="button" aria-label="Close (Ctrl+F4)" tabindex="0" 
                                onclick="this.closest('.tab').remove(); handleTabDeletion();"></a>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="tab-fade-hider"></div>
            <div class="tab-border-bottom-container"></div>
        </div>`;

        let content;
        document.getElementById("lowerlangicontab").className = `monaco-icon-label file-icon codespaces-blank-name-dir-icon index.${lang}-name-file-icon name-file-icon ${lang}-ext-file-icon ext-file-icon ${lang}-lang-file-icon tab-label tab-label-has-badge`;
        document.getElementById("otherlanglower").innerText = lang;
        document.getElementById("firstlanglower").innerText = filename;

        try {
            const response = await fetch(`https://quizizzvscodehost.blaub002-302.workers.dev/get/${currentProject}/${encodeURIComponent(filename)}`);
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`File "${filename}" not found. Creating a new file.`);
                    content = "";
                    await saveFile(filename, content);
                } else {
                    throw new Error(`Failed to fetch file content: ${response.statusText}`);
                }
            } else {
                content = await response.text();
            }
        } catch (error) {
            console.error(`Error fetching file: ${error.message}`);
            content = "";
        }

        // Cache the file content
        fileContents[filename] = content;
        currentFile = filename;

        const themeResponse = await fetch('https://quizizzvscode.pages.dev/github-dark.json');
        if (!themeResponse.ok) {
            throw new Error(`Failed to fetch JSON: ${themeResponse.statusText}`);
        }
        const theme = await themeResponse.json();

        require.config({
            paths: {
                'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs'
            }
        });

        require(['vs/editor/editor.main'], function () {
            if (!isEmmetRegistered) {
                console.log("Registering Emmet...");
                emmetMonaco.emmetHTML(monaco);
                isEmmetRegistered = true;
            }

            monaco.editor.defineTheme('github-dark', theme);
            monaco.editor.setTheme('github-dark');
            document.getElementById('monacoeditorid').innerHTML = "";

            if (editor) {
                editor.dispose();
            }

            editor = monaco.editor.create(document.getElementById('monacoeditorid'), {
                value: content,
                language: lang,
                theme: 'github-dark',
                minimap: {
                    enabled: true
                }
            });

            isEditorReady = true;

            const saveHandler = async (event) => {
                if (event.ctrlKey && event.key === "s") {
                    event.preventDefault();
                    const currentValue = editor.getValue();
                    await saveFile(currentFile, currentValue);
                    console.log(`File "${currentFile}" saved successfully!`);
                    updateCachedContent(currentFile, currentValue);
                }
            };

            window.removeEventListener("keydown", saveHandler);
            window.addEventListener("keydown", saveHandler);
        });
    } catch (error) {
        console.error(`Error initializing editor: ${error.message}`);
    }
}

function handleTabClick(filename) {
    updateCachedContent(currentFile, editor.getValue())
    const tabsContainer = document.getElementById("tabs");
    const clickedTab = tabsContainer.querySelector(`[data-resource-name="${filename}"]`);

    if (clickedTab) {
        activateTab(clickedTab, filename);
    }
}

function handleTabDeletion() {
    const tabsContainer = document.getElementById("editor-container");
    const remainingTabs = tabsContainer.querySelectorAll(".tab");

    if (remainingTabs.length === 0) {
        // No tabs left, hide the div
        document.getElementById("watermark-section").style.display = "flex";
        document.getElementById("file-icons").style.display = "none";
        document.getElementById("monacoeditorid").style.display = "none";
    } else {
        // Activate the first remaining tab if there's any
        const firstTab = remainingTabs[0];
        activateTab(firstTab, firstTab.getAttribute('data-resource-name'));
    }
}

function activateTab(tabElement, filename) {
    // Remove 'active' and 'selected' classes from other tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active', 'selected');
        tab.setAttribute('aria-selected', 'false');
    });

    // Activate the clicked tab
    tabElement.classList.add('active', 'selected');
    tabElement.setAttribute('aria-selected', 'true');

    // Load the corresponding file content into the editor
    if (fileContents[filename]) {
        editor.setValue(fileContents[filename]);
    } else {
        console.error(`File content for "${filename}" not found in cache.`);
    }

    // Update the editor language based on file extension
    const lang = filename.split('.').pop();
    const monacoLang = lang === 'js' ? 'javascript' : lang;
    monaco.editor.setModelLanguage(editor.getModel(), monacoLang);

    currentFile = filename;
}


// Function to save file to the server
async function saveFile(filename, content) {
    const formData = new FormData();
    formData.append("file", new Blob([content]), filename);
    formData.append("filename", currentProject + "/" + filename);

    const response = await fetch("https://quizizzvscodehost.blaub002-302.workers.dev/upload", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        console.error(`Failed to save file: ${response.statusText}`);
    }
}

function runinnewtab() {
    window.open("https://quizizzvscodehost.blaub002-302.workers.dev/get/" + currentProject + "/")
}

function updateCachedContent(filename, newContent) {
    if (fileContents[filename]) {
        // Update the cached content with the new value
        fileContents[filename] = newContent;
        console.log(`Cache updated for file: ${filename}`);
    } else {
        // Handle case where the file is not found in the cache
        console.warn(`File "${filename}" not found in cache.`);
    }

    // If the current file is the one being updated, update the editor content as well
    if (filename === currentFile && editor) {
        editor.setValue(newContent);
    }
}

function toggleFolder(row) {
    const twistie = row.querySelector('.monaco-tl-twistie');
    const folderLevel = parseInt(row.getAttribute('aria-level'));
    const listRows = Array.from(row.closest('.monaco-list-rows').querySelectorAll('.monaco-list-row'));
    let toggleMode = row.getAttribute('aria-expanded') === 'true' ? 'collapse' : 'expand';

    // Toggle folder state
    if (toggleMode === 'collapse') {
        row.setAttribute('aria-expanded', 'false');
        twistie.classList.add('collapsed');
    } else {
        row.setAttribute('aria-expanded', 'true');
        twistie.classList.remove('collapsed');
    }

    // Traverse rows below the current folder
    let shouldToggle = false;
    listRows.forEach(function (item) {
        const itemLevel = parseInt(item.getAttribute('aria-level'));

        if (item === row) {
            shouldToggle = true; // Start toggling after the clicked row
            return;
        }

        if (shouldToggle) {
            if (itemLevel <= folderLevel) {
                shouldToggle = false; // Stop when encountering a row with the same or lower level
                return;
            }
            // Toggle visibility based on folder state
            item.style.display = toggleMode === 'collapse' ? 'none' : 'block';
        }
    });
}


function addfile() {
    document.getElementById("allfilesandfolders").innerHTML += `<div onclick="this.classList.add('selected'); document.querySelectorAll('.monaco-list-row').forEach(row => { if (row !== this) row.classList.remove('selected'); }); initMonacoEditor(this.innerText, this.innerText.split('.').pop()); document.getElementById('watermark-section').style.display = 'none'; document.getElementById('file-icons').style.display = 'block'; document.getElementById('monacoeditorid').style.display = 'block';" class="monaco-list-row" role="treeitem" data-index="5" data-last-element="false" data-parity="odd"
                                                                    aria-setsize="9" aria-posinset="3" id="list_id_2_5" aria-selected="false" aria-level="1" draggable="false"
                                                                    style="position: relative; height: 22px; line-height: 22px;">
                                                                    <div class="monaco-tl-row">
                                                                        <div class="monaco-tl-indent" style="width: 0px;"></div>
                                                                        <div class="monaco-tl-twistie" style="padding-left: 8px;"></div>
                                                                        <div class="monaco-tl-contents">
                                                                            <div
                                                                            class="monaco-icon-label file-icon codespaces-blank-name-dir-icon name-file-icon ext-file-icon unknown-lang-file-icon explorer-item explorer-item-edited"
                                                                            aria-label="/workspaces/codespaces-blank/ " custom-hover="true">
                                                                            <div class="monaco-icon-label-container" style="display: none;">
                                                                                <span class="monaco-icon-name-container"><a class="label-name"></a></span></div>
                                                                            <div class="monaco-inputbox idle synthetic-focus"
                                                                                style="background-color: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border, transparent);">
                                                                                <div class="ibwrapper">
                                                                                    <input class="input empty" autocorrect="off" autocapitalize="off" spellcheck="false" type="text" wrap="off" aria-label="Type file name. Press Enter to confirm or Escape to cancel."
                                                                                        style="background-color: inherit; color: var(--vscode-input-foreground);"
                                                                                        fdprocessedid="ycd0b">
                                                                                </div>
                                                                            </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>`;

    const allInputs = document.querySelectorAll("#allfilesandfolders .input");
    const lastInput = allInputs[allInputs.length - 1];
    const labelDiv = lastInput.closest(".monaco-icon-label");

    lastInput.focus();

    let confirmed = false; // Flag to check if Enter was pressed

    // Handle typing to dynamically update the classes
    lastInput.oninput = function () {
        const fileName = lastInput.value.trim();
        const ext = fileName.split('.').pop().toLowerCase();
        
        // Default class list for unknown file types
        let classList = `monaco-icon-label file-icon codespaces-blank-name-dir-icon ${fileName}-name-file-icon ${ext}ext-file-icon ${ext}-lang-file-icon explorer-item`;

        if (ext === "js") {
            classList = "monaco-icon-label file-icon codespaces-blank-name-dir-icon script.js-name-file-icon name-file-icon js-ext-file-icon ext-file-icon javascript-lang-file-icon explorer-item";
        } else if (ext === "py") {
            classList = "monaco-icon-label file-icon codespaces-blank-name-dir-icon index.py-name-file-icon name-file-icon python-ext-file-icon ext-file-icon python-lang-file-icon explorer-item";
        } else if (ext === "sh") {
            classList = "monaco-icon-label file-icon codespaces-blank-name-dir-icon index.sh-name-file-icon name-file-icon bash-ext-file-icon ext-file-icon bash-lang-file-icon explorer-item";
        }
        
        // Update the class list of the label div
        labelDiv.className = classList;
    };

    // Handle Enter key to replace input with span
    lastInput.onkeydown = function (e) {
        if (e.key === "Enter" && lastInput.value.trim() !== "") {
            confirmed = true; // Set the flag to true
            const inputValue = lastInput.value.trim();

            lastInput.parentElement.parentElement.classList.remove("synthetic-focus");
            lastInput.parentElement.parentElement.style.backgroundColor = "transparent";
            lastInput.parentElement.parentElement.style.border = "none";
            
            // Replace input with span showing the entered text
            lastInput.parentElement.innerHTML = `<div class="monaco-icon-label-container" style="height: 22px;"><span class="monaco-icon-name-container"><a class="label-name"><span class="monaco-highlighted-label" style="height: 22px; display: block; padding-top: 2px;">${inputValue}</span></a></span></div>`;
            
            saveFile(inputValue, "");
        }
    };

    // Handle blur event to remove the div if Enter was not pressed
    lastInput.onblur = function () {
        if (!confirmed) { // Only remove if Enter wasn't pressed
            const parentDiv = lastInput.closest(".monaco-list-row");
            if (parentDiv) {
                parentDiv.remove();
            }
        }
    };
}


function addfolder() {
    document.getElementById("allfilesandfolders").innerHTML += `<div class="monaco-list-row" onclick="this.classList.add('selected'); document.querySelectorAll('.monaco-list-row').forEach(row => { if (row !== this) row.classList.remove('selected'); }); toggleFolder(this);" role="treeitem" data-index="0" data-last-element="false" data-parity="even" aria-setsize="4" aria-posinset="1" id="list_id_2_0" aria-selected="false" aria-label="scripts" aria-level="1" aria-expanded="false" draggable="true" style="position: relative; height: 22px; line-height: 22px;">
                                                                                                <div class="monaco-tl-row">
                                                                                                   <div class="monaco-tl-indent" style="width: 0px;"></div>
                                                                                                   <div class="monaco-tl-twistie collapsible codicon codicon-tree-item-expanded collapsed" style="padding-left: 8px;"></div>
                                                                                                   <div class="monaco-tl-contents">
                                                                                                      <div class="monaco-icon-label folder-icon codespaces-blank-name-dir-icon scripts-name-folder-icon explorer-item" aria-label="/workspaces/codespaces-blank/scripts" custom-hover="true" style="display: flex;">
                                                                                                         <div class="monaco-icon-label-container"><span class="monaco-icon-name-container"><a class="label-name"><span class="monaco-highlighted-label">scripts</span></a></span></div>
                                                                                                      </div>
                                                                                                   </div>
                                                                                                </div>
                                                                                             </div>`;
}

function switchtab(tab) {
    if (tab == "explorer") {
        document.getElementById('fileexplorertab').style.display = 'block';
        document.getElementById('committab').style.display = 'none';
    } else if (tab == "commit") {
        document.getElementById('fileexplorertab').style.display = 'none';
        document.getElementById('committab').style.display = 'block';
    }
}

// Initialize the editor
window.addEventListener("DOMContentLoaded", () => {
    const contents = document.querySelectorAll('.content');
    contents.forEach((el) => {
        el.style.display = 'block'; // Example action for all .content elements
    });

    eruda.init();
});