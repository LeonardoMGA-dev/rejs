import Component from './Component.js';

class App {

    constructor({
        isServer = false,
        stateTable = {},
        components = {},
        ejs,
    }) {
        this.stateTable = stateTable;
        this.components = components
        this.templates = {};
        this.ejs = ejs;
        this.isServer = isServer;
    }

    setState(id, value) {
        const state = this.stateTable[id];
        state.value = value;
        this.refreshById(state.component, value);
    }

    useState(id, component, initialValue) {
        let state = this.stateTable[id];
        if (!state) {
            const newState = {
                value: initialValue,
                component: component,
            };
            this.stateTable[id] = newState;
            state = newState;
        }
        const setState = (newVal) => {
            this.setState(id, newVal);
        }

        return [state.value, setState];
    }

    async render(component, data) {
        console.log('Rendering template', component);
        let template = this.templates[component];
        if (!template) {
            const path = this.components[component];
            const response = await fetch(path);
            template = await response.text();
            this.templates[component] = template;
        }
        const html = await this.ejs.render(template, {...data, app: this}, { async: true });
        return html;
    }

    // Only client side
    async refreshById(id, data) {
        const target = $(`#${id}`);
        const component = target.attr('component');
        const html = await this.render(component, {...data, app: this});
        target.replaceWith(html);
    }

    async getStateTable() {
        return this.stateTable;
    }

    // Only client side
    async hydrate(id) {
        if (this.isServer) {
            return;
        }
        $(document).ready(async () => {
            const hydrator = document.getElementById(id);
            if (hydrator) {
                const content = hydrator.getAttribute('content');
                this.stateTable = JSON.parse(content);
                console.log('Hydrated state table', this.stateTable);
            }
            // get all the components with class component and refresh them
            const components = document.querySelectorAll('.component');
            // create a component for each component

            // use for instead of forEach to wait for each component to finish

            for (let i = 0; i < components.length; i++) {
                const component = components[i];
                const id = component.getAttribute('id');
                const name = component.getAttribute('component');
                const props = JSON.parse(component.getAttribute('props'));
                const componentInstance = new Component({ id, name, app: this, props });
                // delay the refresh 5 seconds
                await componentInstance.refresh();
            }
        });
    }

    async hydrator(id) {
        const json = JSON.stringify(this.stateTable);
        return `<meta id="${id}" content='${json}'>`;
    }

    async start() {
        console.log('App started');
    }

}

export default App;