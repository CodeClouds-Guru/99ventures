import grapesjs from 'grapesjs';
import axios from 'axios';

export const customComponents = grapesjs.plugins.add('custom-component', async (editor, opts) => {
    axios.get(`/pages/add`)
        .then((response) => {
            if (response.data.results) {
                const jsonData = response.data.results.fields.scripts.options;
                jsonData.forEach(val => {
                    if(val.config_json){
                        editor.Components.addType('component_'+val.id, {
                            isComponent: el => el.classList?.contains('component_'+val.id),
                            model: {
                                defaults: {
                                    name: val.value, // Simple custom name
                                    style: {
                                        width: '100%',
                                        height: '10px',
                                    },
                                    traits:val.config_json,                            
                                    // As by default, traits are binded to attributes, so to define
                                    // their initial value we can use attributes
                                    attributes: { class: `${'component_'+val.id} scripted-custom-script`},
                                },
                            },
                        });
                    }
                });
                
            } 
        })
        .catch((error) => {
            console.log(error)
        })
})

export const scriptBlockManager = grapesjs.plugins.add('script-block-manager', async (editor, opts) => {
    axios.get(`/pages/add`)
        .then((response) => {
            if (response.data.results) {
                const jsonData = response.data.results.fields.scripts.options;
                jsonData.forEach(val => {
                    editor.BlockManager.add(`block-${val.value}`, {
                        label: val.value,
                        category: 'Scripts',
                        attributes: {
                            class: 'fa fa-code'
                        },
                        /*content: (val.config_json)
                                ? '<div data-script="'+val.id+'" data-gjs-type="'+val.config_json+'"></div>'
                                : '<div data-script="'+val.id+'"></div>' */
                        content: (val.config_json) ? {type: 'component_'+val.id} : '<div data-script="'+val.id+'"></div>'
                    });
                });
                
            } 
        })
        .catch((error) => {
            console.log(error)
        })
})

export const customCodeEditor = grapesjs.plugins.add('custom-code-editor', (editor, opt)=> {
    const editorTextAreaCreate = (editorBody, title) => {
        const container = document.createElement('div')
        const childContainer = document.createElement('div')
        const titleContainer = document.createElement('div')
        const txtarea = document.createElement('textarea')

        container.setAttribute('class', 'gjs-cm-editor-c')
        // childContainer.setAttribute('id', 'gjs-cm-css')
        childContainer.setAttribute('class', 'gjs-cm-editor')
        titleContainer.setAttribute('class', 'gjs-cm-title')
        titleContainer.textContent = title
        childContainer.appendChild(titleContainer)
        childContainer.appendChild(txtarea)
        container.appendChild(childContainer)
        editorBody.appendChild(container)
        return txtarea
    }

    const fullscreenEnable = () => {
        var fullScrFn;
        if(document.querySelector('.gjs-mdl-dialog').requestFullscreen){
            fullScrFn = document.querySelector('.gjs-mdl-dialog').requestFullscreen();
        } else if(
            document.querySelector('.gjs-mdl-dialog').webkitRequestFullscreen ||
            typeof document.querySelector('.gjs-mdl-dialog').webkitRequestFullscreen === 'undefined'
        ){
            document.querySelector('.gjs-mdl-dialog').webkitRequestFullscreen(); 
            document.querySelector('.gjs-mdl-dialog').classList.add('gjs-fullscreen-mode');
        } else if(document.querySelector('.gjs-mdl-dialog').msRequestFullscreen){
            fullScrFn = document.querySelector('.gjs-mdl-dialog').msRequestFullscreen(); 
        } else if(document.querySelector('.gjs-mdl-dialog').mozRequestFullScreen ){
            fullScrFn = document.querySelector('.gjs-mdl-dialog').mozRequestFullScreen(); 
        }
    
        if(fullScrFn) {
            fullScrFn.then(r => {
                document.querySelector('.gjs-mdl-dialog').classList.add('gjs-fullscreen-mode');
            })
        }
    }
    
    const exitfullscreenWindow = () => {
        var exitFn;
        if(document.exitFullscreen) {
            exitFn = document.exitFullscreen();
        } else if(document.mozCancelFullScreen) {
            exitFn = document.mozCancelFullScreen();
        } else if(document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
            document.querySelector('.gjs-mdl-dialog').classList.remove('gjs-fullscreen-mode')
        }
        if(exitFn) {
            exitFn.then(r => {
                document.querySelector('.gjs-mdl-dialog').classList.remove('gjs-fullscreen-mode')
            })
        }
    
        document.querySelector('.minimize').classList.add('hide-btn');
        document.querySelector('.maximize').classList.remove('hide-btn');
    }
    const pfx = editor.getConfig().stylePrefix
    const modal = editor.Modal
    const cmdm = editor.Commands
    const htmlCodeViewer = editor.CodeManager.getViewer('CodeMirror').clone()
    const cssCodeViewer = editor.CodeManager.getViewer('CodeMirror').clone()
    const pnm = editor.Panels
    const fullscrBtn = document.createElement('button');
    fullscrBtn.setAttribute('title', 'Fullscreen')
    fullscrBtn.setAttribute('class', 'grapes-modal-editor-fullscreen maximize');
    fullscrBtn.innerHTML = '<i class="fa fa-window-maximize" aria-hidden="true"></i>';
    const minimizeBtn = document.createElement('button');
    minimizeBtn.setAttribute('title', 'Exit Fullscreen')
    minimizeBtn.setAttribute('class', 'grapes-modal-editor-fullscreen hide-btn minimize');
    minimizeBtn.innerHTML = '<i class="fa fa-window-minimize" aria-hidden="true"></i>';
    const closeBtn = document.createElement('button');
    closeBtn.setAttribute('title', 'Close')
    closeBtn.setAttribute('class', 'grapes-modal-editor-close');
    closeBtn.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>'
    const rootContainer = document.createElement('div');
    rootContainer.setAttribute('class', 'grapes-modal-editor-container');
    const editorHeader =  document.createElement('div');
    editorHeader.setAttribute('class', 'grapes-modal-editor-header');        
    editorHeader.append(fullscrBtn);
    editorHeader.append(minimizeBtn);
    editorHeader.append(closeBtn);
    const editorBody = document.createElement('div');
    editorBody.setAttribute('class', 'grapes-modal-editor-body');
    const editorFooter = document.createElement('div');
    editorFooter.setAttribute('class', 'grapes-modal-editor-footer');
    const btnEdit = document.createElement('button');
    rootContainer.append(editorHeader)

    const codeViewerOpt = {
        readOnly: 0,
        theme: 'hopscotch',
        autoBeautify: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineWrapping: true,
        styleActiveLine: true,
        smartIndent: true,
        indentWithTabs: true
    }

    htmlCodeViewer.set({
        codeName: 'htmlmixed',
        ...codeViewerOpt
    })

    cssCodeViewer.set({
        codeName: 'css',
        ...codeViewerOpt
    });

    btnEdit.innerHTML = 'Save'
    btnEdit.className = pfx + 'btn-prim ' + pfx + 'btn-import'
    btnEdit.onclick = function () {
        const html = htmlCodeViewer.editor.getValue()
        const css = cssCodeViewer.editor.getValue()
        editor.DomComponents.getWrapper().set('content', '')
        // editor.CssComposer.clear();            
        // const HTML_CSS = html.trim() + `<style>${css}</style>`
        editor.setComponents(html.trim());
        editor.setStyle(css);
        modal.close();
        if(document.fullscreenElement !== null || document.webkitFullscreenElement !== null) {
            exitfullscreenWindow();
        }
    }

    closeBtn.onclick = function () {
        modal.close();
        if(document.fullscreenElement !== null || document.webkitFullscreenElement !== null) {
            exitfullscreenWindow(); 
        }
    }
    //-- Edit Code popup Fullscreen ON|OFF
    minimizeBtn.onclick = function() {
        exitfullscreenWindow();
    }
    fullscrBtn.onclick = function() {
        minimizeBtn.classList.remove('hide-btn')
        fullscrBtn.classList.add('hide-btn');
        fullscreenEnable();            
    } 
    document.addEventListener("fullscreenchange", function(e) {
        if(
            (
                typeof document.fullscreenElement !== 'undefined' &&
                document.fullscreenElement == null
            ) || (
                typeof document.webkitFullscreenElement !== 'undefined' &&
                document.webkitFullscreenElement == null
            )
        ) {
            document.querySelector('.gjs-mdl-dialog').classList.remove('gjs-fullscreen-mode');
            minimizeBtn.classList.add('hide-btn')
            fullscrBtn.classList.remove('hide-btn');
        }
    });
    //-----

    cmdm.add('edit-code', {
        run: function (editor, sender) {
            sender && sender.set('active', 0)
            var htmlViewer = htmlCodeViewer.editor
            var cssViewer = cssCodeViewer.editor
            modal.setTitle('Edit code')
            var InnerHtml = editor.getHtml()
            var Css = editor.getCss();
            if (!htmlViewer && !cssViewer) {
                const txtarea = editorTextAreaCreate(editorBody, 'HTML')
                const cssarea = editorTextAreaCreate(editorBody, 'CSS')

                editorFooter.append(btnEdit)
                rootContainer.append(editorBody)
                rootContainer.append(editorFooter)
                htmlCodeViewer.init(txtarea)
                cssCodeViewer.init(cssarea)
                htmlViewer = htmlCodeViewer.editor
                cssViewer = cssCodeViewer.editor
            }
            modal.setContent('')
            modal.setContent(rootContainer)
            htmlCodeViewer.setContent(InnerHtml)
            cssCodeViewer.setContent(Css)
            modal.open({ attributes: { class: 'custom-code-editor' } })
            htmlViewer.refresh()
            cssViewer.refresh()
        }
    })

    // To enable JS in the editor
    cmdm.add('allowScripts', {
        run: function (editor) {
            editor.getConfig().allowScripts = 1;
        },
        stop: function (editor) {
            editor.getConfig().allowScripts = 0;
        },
    });

    // Removed default read-only code editor btn from toolbar
    pnm.removeButton("options", 'export-template');

    pnm.addButton('options',
        [
            {
                id: 'edit',
                className: 'fa fa-code',
                command: 'edit-code',
                attributes: {
                    title: 'Edit Code'
                }
            }
        ]
    );
})
