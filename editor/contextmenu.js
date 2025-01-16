// Function to show the context menu
function showContextMenu(event) {
    document.querySelectorAll('.monaco-list-row').forEach(row => {
        row.classList.remove('selected');
    });
    const element = document.elementFromPoint(event.pageX, event.pageY).closest('.monaco-list-row');
    if (element && element.classList.contains('monaco-list-row')) {
        element.classList.add('selected');
    } else {
        
    }

    event.preventDefault();
    
    // Check if a context menu already exists and remove it
    let existingMenu = document.getElementById('context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }

    // Create a new context menu
    const contextMenu = document.createElement('div');
    contextMenu.id = 'context-menu';
    document.body.appendChild(contextMenu);

    // Set style for positioning and display
    contextMenu.style.display = 'block';

    // Set the inner HTML (large content omitted for brevity)
    contextMenu.innerHTML = `<div class="bottom context-view fixed left monaco-component monaco-menu-container"
    style=top:${event.pageY}px;left:${event.pageX}px;z-index:2575;position:fixed;width:initial role=presentation>
    <div class=monaco-scrollable-element
        style="overflow:hidden;outline:1px solid var(--vscode-menu-border);border-radius:5px;color:var(--vscode-menu-foreground);background-color:#2f363d;box-shadow:0 2px 8px var(--vscode-widget-shadow)"
        role=presentation>
        <div class=monaco-menu style=overflow:hidden;max-height:834px role=presentation>
            <div class="vertical monaco-action-bar">
                <ul class=actions-container role=menu>
                    <li class=action-item role=presentation><a class=action-menu-item
                            onclick="addfile()"
                            style=color:var(--vscode-menu-foreground)><span class="codicon codicon-menu-selection menu-item-check"role=none style=color:var(--vscode-menu-foreground)></span><span class=action-label aria-label="Go to Symbol...">New File...</span><span class=keybinding></span></a>
                    </li>
                    <li class=action-item role=presentation><a class=action-menu-item
                            onclick="addfolder()"
                            style=color:var(--vscode-menu-foreground)><span class="codicon codicon-menu-selection menu-item-check"role=none style=color:var(--vscode-menu-foreground)></span><span class=action-label aria-label="Go to Symbol...">New Folder...</span><span class=keybinding></span></a>
                    </li>
                    <li class="action-item disabled" role=presentation><a
                            class="action-label codicon disabled separator" role=checkbox
                            style=border-bottom-color:var(--vscode-menu-separatorBackground) aria-disabled=true></a>
                    </li>
                    <li class=action-item role=presentation tabindex=-1><a class=action-menu-item
                            onclick=""
                            style=color:var(--vscode-menu-foreground)><span class="codicon codicon-menu-selection menu-item-check"role=none style=color:var(--vscode-menu-foreground)></span><span class=action-label aria-label="Rename Symbol">Cut</span><span class=keybinding>Ctrl+X</span></a>
                    </li>
                    <li class=action-item role=presentation><a class=action-menu-item
                            onclick=""
                            style=color:var(--vscode-menu-foreground)><span class="codicon codicon-menu-selection menu-item-check"role=none style=color:var(--vscode-menu-foreground)></span><span class=action-label aria-label="Change All Occurrences">Copy</span><span class=keybinding>Ctrl+C</span></a>
                    </li>
                    <li class=action-item role=presentation><a class=action-menu-item
                            onclick=""
                            style=color:var(--vscode-menu-foreground)><span class="codicon codicon-menu-selection menu-item-check"role=none style=color:var(--vscode-menu-foreground)></span><span class=action-label aria-label="Format Document">Paste</span><span class=keybinding>Ctrl+V</span></a>
                    </li>
                    <li class="action-item disabled" role=presentation><a
                            class="action-label codicon disabled separator" role=checkbox
                            style=border-bottom-color:var(--vscode-menu-separatorBackground) aria-disabled=true></a>
                    </li>
                    <li class=action-item role=presentation><a class=action-menu-item
                            onclick=""
                            style=color:var(--vscode-menu-foreground)><span class="codicon codicon-menu-selection menu-item-check"role=none style=color:var(--vscode-menu-foreground)></span><span class=action-label aria-label=Cut>Download</span></a>
                    </li>
                    <li class="action-item disabled" role=presentation><a
                            class="action-label codicon disabled separator" role=checkbox
                            style=border-bottom-color:var(--vscode-menu-separatorBackground) aria-disabled=true></a>
                    </li>
                    <li class=action-item role=presentation><a class=action-menu-item
                            onclick="navigator.clipboard.writeText('workspaces/project/' + currentProject + '/' + document.getElementsByClassName('selected')[0].getAttribute('data-filepath'))"
                            style=color:var(--vscode-menu-foreground)><span class="codicon codicon-menu-selection menu-item-check"role=none style=color:var(--vscode-menu-foreground)></span><span class=action-label aria-label="Command Palette">Copy Path</span><span class=keybinding>Shift+Alt+C</span></a>
                    </li>
                    <li class="action-item disabled" role=presentation><a
                            class="action-label codicon disabled separator" role=checkbox
                            style=border-bottom-color:var(--vscode-menu-separatorBackground) aria-disabled=true></a>
                    </li>
                    <li class=action-item role=presentation><a class=action-menu-item
                            onclick="renamefile()"
                            style=color:var(--vscode-menu-foreground)><span class="codicon codicon-menu-selection menu-item-check"role=none style=color:var(--vscode-menu-foreground)></span><span class=action-label aria-label="Command Palette">Rename...</span><span class=keybinding>F2</span></a>
                    </li>
                    <li class=action-item role=presentation><a class=action-menu-item
                            onclick="deletefile()"
                            style=color:var(--vscode-menu-foreground)><span class="codicon codicon-menu-selection menu-item-check"role=none style=color:var(--vscode-menu-foreground)></span><span class=action-label aria-label="Command Palette">Delete Permanantly</span><span class=keybinding>Delete</span></a>
                    </li>
                </ul>
            </div>
        </div>
        <div class="invisible scrollbar horizontal" style=position:absolute;width:284px;height:0;left:0;bottom:0
            role=presentation aria-hidden=true>
            <div class=slider
                style=position:absolute;top:0;left:0;height:10px;transform:translate3d(0,0,0);contain:strict;width:284px>
            </div>
        </div>
        <div class="invisible scrollbar vertical" style=position:absolute;width:7px;height:249px;right:0;top:0
            role=presentation aria-hidden=true>
            <div class=slider
                style=position:absolute;top:0;left:0;width:7px;transform:translate3d(0,0,0);contain:strict;height:249px>
            </div>
        </div>
        <div class=shadow></div>
        <div class=shadow></div>
        <div class=shadow></div>
    </div>
</div>`;
}

// Function to hide the context menu
function hideContextMenu() {
    const contextMenu = document.getElementById('context-menu');
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
}
// alert(document.getElementById('monacoeditorid').innerHTML);
// Event listener for right-click on the Monaco editor to show the custom context menu
// document.getElementById('monacoeditorid')?.addEventListener('contextmenu', function(event) {
//     // Prevent the default Monaco context menu
//     event.preventDefault();
//     // Hide the custom context menu (if it's showing)
//     hideContextMenu();
// });

const handler = {
    apply: function(target, thisArg, argumentsList) {
        alert("Hi"); // Alert when showContextMenu is called
        return target(...argumentsList); // Call the original function
    }
};

// showContextMenu = new Proxy(showContextMenu, handler);

// Event listener for right-click to show the context menu
document.addEventListener('contextmenu', showContextMenu);

// Event listener for click to hide the context menu
document.addEventListener('click', hideContextMenu);

// Event listener for tab unfocus to hide the context menu
window.addEventListener('blur', hideContextMenu);

// Event listener for context menu item click
document.addEventListener('click', function (event) {
    if (event.target.closest('#context-menu')) {
        hideContextMenu();
    }
});
