import grapesjs from 'grapesjs';
import axios from 'axios';

export const customComponents = grapesjs.plugins.add('custom-component', async (editor, opts) => {
    axios.get(`/scripts?page=1&show=100&module=scripts`)
        .then((response) => {
            if (response.data.results) {
                const jsonData = response.data.results.result.data;                
                jsonData.forEach(val => {
                    if(val.config_json){                        
                        editor.Components.addType('component_'+val.id, {
                            isComponent: el => el.classList?.contains('component_'+val.id),
                            model: {
                                defaults: {
                                    name: val.name, // Simple custom name
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
    axios.get(`/scripts?page=1&show=100&module=scripts`)
        .then((response) => {
            if (response.data.results) {
                const jsonData = response.data.results.result.data;
                jsonData.forEach(val => {
                    editor.BlockManager.add(`block-${val.id}`, {
                        label: val.name,
                        category: 'Scripts',
                        attributes: {
                            class: 'fa fa-code'
                        },
                        content: (val.config_json)
                                ? `<div data-script="${val.code}" data-gjs-type="component_${val.id}"></div>`
                                : `<div data-script="${val.code}"></div>`

                        // content: (val.config_json) ? {type: 'component_'+val.id} : '<div data-script="'+val.code+'"></div>'
                    });
                });
                editor.BlockManager.getCategories()._byId["Scripts"].set("open", false)
            } 
        })
        .catch((error) => {
            console.log(error)
        })
})

export const compoentBlockManager = grapesjs.plugins.add('component-block-manager', async (editor, opts) => {
    axios.get(`/components?page=1&show=100&module=components`)
        .then((response) => {
            if (response.data.results) {
                const jsonData = response.data.results.result.data;
                jsonData.forEach(val => {
                    editor.BlockManager.add(`block-${val.name}`, {
                        label: val.name,
                        category: 'Custom Component',
                        attributes: {
                            class: 'fa fa-code'
                        },
                        content: '&nbsp;' + val.html
                    });
                });
                editor.BlockManager.getCategories()._byId["Custom Component"].set("open", false)
            } 
        })
        .catch((error) => {
            console.log(error)
        })
})