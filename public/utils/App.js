

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
        const hydrator = document.getElementById(id);
        if (hydrator) {
            const content = hydrator.getAttribute('content');
            this.stateTable = JSON.parse(content);
            console.log('Hydrated state table', this.stateTable);
        }
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