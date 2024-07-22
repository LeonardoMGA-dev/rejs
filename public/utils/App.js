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
        this.styles = {};
    }

    async render(entryPointComponent, props) {
        const component = new Component({ id: 1, name: entryPointComponent, app: this, props });
        const html = await component._render();
        return html;
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

}

export default App;