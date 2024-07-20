class Component {

    constructor({ id, name, app, props }) {
        this.props = props;
        this.id = id;
        this.name = name;
        this.app = app;
        this.children = {};
        this.hooks = {};
        this.hookId = 0;
    }

    async useRemote(url, method = "GET", body, headers = {}) {
        const id = `${this.id}:${this.hookId++}`;
        if (!this.app.stateTable[id]) {
            const response = await fetch(url, {
                method,
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
            });

            this.app.stateTable[id] = await response.json();
        }
        return [this.app.stateTable[id], async (newValue) => {
            this.app.stateTable[id] = await fetch(url, {
                method,
                body: JSON.stringify(newValue),
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
            }).then((response) => response.json());
        }];
    }

    useState(initialValue) {
        // get the size of the hooks object
        const id = `${this.id}:${this.hookId++}`;
        if (!this.app.stateTable[id]) {
            this.app.stateTable[id] = initialValue;
        }
        return [this.app.stateTable[id], (newValue) => {
            this.app.stateTable[id] = newValue;
        }];
    }

    async updateState( onStateChange) {
        await onStateChange();
        this.refresh();
    }

    delegate(event, onDelegate) {
        const randomId = Math.random().toString(36).substring(7);
        if (!this.app.isServer) {
            $(document).on(event, `#${randomId}`, async (event) => {
                event.preventDefault();
                onDelegate(this);
            });
        }
        return `id="${randomId}"`;
    }

    meta() {
        return `id="${this.id}" component="${this.name}" class="component" props='${JSON.stringify(this.props)}'`;
    }

    async _render() {
        this.hookId = 0;
        let template = this.app.templates[this.name];
        if (!template) {
            const path = this.app.components[this.name];
            const response = await fetch(path);
            template = await response.text();
            this.app.templates[this.name] = template;
        }
        try {
            const html = await this.app.ejs.render(template, { ...this.props, context: this }, { async: true });
            return html;
        } catch (error) {
            return `<div>Failed to render ${error}</div>`;
        }
    }

    async component(name, props) {
        const id = Math.random().toString(36).substring(7);
        const component = new Component({ id, name, app: this.app, props });
        this.children[id] = component;
        const html = await component._render();
        return html;
    }

    async refresh() {
        const target = $(`#${this.id}`);
        const html = await this._render();
        target.replaceWith(html);
    }

}

export default Component;