let isEditorReady = false;
let editor;
let current_file;
let current_file_value;
let isEmmetRegistered = false; // Add a global flag to track Emmet registration


async function initMonacoEditor(filename, lang) {
    try {
        if (lang === "js") {
            lang = "javascript";
        }

        let content;
        document.getElementById("nameoffile").innerText = filename
        try {
            // Fetch content from the server
            const response = await fetch(`https://quizizzvscodehost.blaub002-302.workers.dev/get/${encodeURIComponent(filename)}`);
            if (!response.ok) {
                // File not found, initialize it with empty value
                if (response.status === 404) {
                    console.warn(`File "${filename}" not found. Creating a new file.`);
                    content = "";
                    await saveFile(filename, content); // Create the file on the server
                } else {
                    throw new Error(`Failed to fetch file content: ${response.statusText}`);
                }
            } else {
                content = await response.text(); // File exists, get its content
            }
        } catch (error) {
            console.error(`Error fetching file: ${error.message}`);
            content = ""; // Fallback to empty content if fetch fails
        }

        current_file = filename;

        // Fetch and apply the theme
        const themeResponse = await fetch('github-dark.json');
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
            // Register Emmet only once
            if (!isEmmetRegistered) {
                console.log("Registering Emmet...");
                emmetMonaco.emmetHTML(monaco);
                isEmmetRegistered = true;
            }

            monaco.editor.defineTheme('github-dark', theme);
            monaco.editor.setTheme('github-dark');
            document.getElementById('monacoeditorid').innerHTML = "";

            // Dispose of any existing editor instance
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

            // Remove previous keydown listener and add a new one
            const saveHandler = async (event) => {
                if (event.ctrlKey && event.key === "s") {
                    event.preventDefault();
                    const currentValue = editor.getValue();
                    await saveFile(current_file, currentValue);
                    console.log(`File "${current_file}" saved successfully!`);
                }
            };

            window.removeEventListener("keydown", saveHandler); // Remove existing handler
            window.addEventListener("keydown", saveHandler);    // Add new handler
        });
    } catch (error) {
        console.error(`Error initializing editor: ${error.message}`);
    }
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

// Initialize the editor
window.addEventListener("DOMContentLoaded", () => {
    initMonacoEditor("index.html", "html");
});
