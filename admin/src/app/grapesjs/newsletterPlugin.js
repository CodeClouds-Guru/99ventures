import grapesjs from 'grapesjs';

export const newsletterEditor = grapesjs.plugins.add('newsletter-editor', (editor, opt)=> {
    const editorTextAreaCreate = (rootContainer, title) => {
        const container = document.createElement('div')
        const childContainer = document.createElement('div')
        const titleContainer = document.createElement('div')
        const txtarea = document.createElement('textarea')
        
        container.setAttribute('class', 'gjs-cm-editor-c')
        childContainer.setAttribute('id', 'gjs-cm-css')
        childContainer.setAttribute('class', 'gjs-cm-editor')
        titleContainer.setAttribute('id', 'gjs-cm-title')
        titleContainer.textContent = title
        childContainer.appendChild(titleContainer)
        childContainer.appendChild(txtarea)
        container.appendChild(childContainer)
        rootContainer.appendChild(container)
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

    // const pfx = editor.getConfig().stylePrefix
    // const modal = editor.Modal
    // const cmdm = editor.Commands
    // const htmlCodeViewer = editor.CodeManager.getViewer('CodeMirror').clone()
    // const cssCodeViewer = editor.CodeManager.getViewer('CodeMirror').clone()
    // const pnm = editor.Panels
    // const rootContainer = document.createElement('div')
    // const btnEdit = document.createElement('button')
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

    btnEdit.innerHTML = 'Save'
    btnEdit.className = pfx + 'btn-prim ' + pfx + 'btn-import'
    btnEdit.onclick = function () {
        const html = htmlCodeViewer.editor.getValue()
        editor.DomComponents.getWrapper().set('content', '')
        editor.setComponents(html.trim());
        modal.close()
    }
    
    cmdm.add('edit-code', {
        run: function (editor, sender) {
            sender && sender.set('active', 0)
            var htmlViewer = htmlCodeViewer.editor
            var cssViewer = cssCodeViewer.editor
            modal.setTitle('Edit code')
            var InnerHtml = editor.runCommand('gjs-get-inlined-html');
            if (!htmlViewer && !cssViewer) {
                const txtarea = editorTextAreaCreate(rootContainer, 'HTML')
                rootContainer.append(btnEdit)
                htmlCodeViewer.init(txtarea)
                htmlViewer = htmlCodeViewer.editor      
            }
            modal.setContent('')
            modal.setContent(rootContainer)                
            htmlCodeViewer.setContent(InnerHtml)
            modal.open({attributes: { class: 'custom-code-editor custom-newsletter-editor' }})
            htmlViewer.refresh()
        }
    })

    // Removed default read-only code editor btn from toolbar
    pnm.removeButton("options", 'export-template');
    
    pnm.addButton('options',[
        {
            id: 'edit',
            className: 'fa fa-code',
            command: 'edit-code',
            attributes: {
                title: 'Edit Code'
            }
        }
    ]);

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

})