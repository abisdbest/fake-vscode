let isEditorReady = false;
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
            const response = await fetch(`https://quizizzvscodehost.blaub002-302.workers.dev/get/${encodeURIComponent(filename)}`);
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
        document.getElementById("editor-container").style.display = "none"; // Replace with your actual container ID
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
    formData.append("filename", filename);

    const response = await fetch("https://quizizzvscodehost.blaub002-302.workers.dev/upload", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        console.error(`Failed to save file: ${response.statusText}`);
    }
}

function runinnewtab() {
    window.open("https://quizizzvscodehost.blaub002-302.workers.dev/get/")
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

// Initialize the editor
window.addEventListener("DOMContentLoaded", () => {
    initMonacoEditor("index.html", "html");
    eruda.init();
});