import grapesjs from 'grapesjs';

export const customCheckboxTrait = grapesjs.plugins.add('custom-trait-types', async (editor, opts) => {
    editor.TraitManager.addType('custom-checkbox', {
        createInput({ trait }) {
            const el = document.createElement('div');
            el.setAttribute('class', 'gjs-field-wrp gjs-field-wrp--checkbox')
            el.innerHTML = `
                <label class="gjs-field gjs-field-checkbox" data-input=""><input type="checkbox" placeholder="" value="">
                    <i class="gjs-chk-icon"></i>
                </label>`

            return el;
        },
        onEvent({ elInput, component, event, trait }) {                
            if(event.target.checked)
                component.addAttributes({ [trait.id]: 1 });
            else                    
                component.removeAttributes([trait.id]);
        },
        onUpdate({ elInput, component, trait }) {
            const data = component.getAttributes()[[trait.id]] || '';
            if(data) {
                elInput.querySelector('input[type="checkbox"]').setAttribute('checked', true);
            } else {
                elInput.querySelector('input[type="checkbox"]').removeAttribute('checked')
            }
        }
    });
})

export const memberTrait = grapesjs.plugins.add('member-trait', async (editor, opts) => {
    editor.TraitManager.addType('member', {
        createInput({ trait }) {
            const el = document.createElement('div');
            el.setAttribute('class', 'gjs-field-wrp gjs-field-wrp--checkbox')
            el.innerHTML = `
                <label class="gjs-field gjs-field-checkbox" data-input=""><input type="checkbox" placeholder="" value="">
                    <i class="gjs-chk-icon"></i>
                </label>`

            return el;
        },
        onEvent({ elInput, component, event }) {
            if(event.target.checked)
                component.addAttributes({ 'data-member': '{{user.id}}' });
            else                    
                component.removeAttributes('data-member');
        },
        onUpdate({ elInput, component }) {
            const dataMember = component.getAttributes()['data-member'] || '';
            if(dataMember) {
                elInput.querySelector('input[type="checkbox"]').setAttribute('checked', true);
            } else {
                elInput.querySelector('input[type="checkbox"]').removeAttribute('checked')
            }
        }
    });
})