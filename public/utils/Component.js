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
        const id = this.hookId++;
        if (!this.hooks[id]) {
            const response = await fetch(url, {
                method,
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
            });

            this.hooks[id] = await response.json();
        }
        return [this.hooks[id], async (newValue) => {
            this.hooks[id] = await fetch(url, {
                method,
                body: JSON.stringify(newValue),
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
            }).then((response) => response.json());
            this.refresh();
        }];
    }

    useState(initialValue) {
        // get the size of the hooks object
        const id = this.hookId++;
        if (!this.hooks[id]) {
            this.hooks[id] = initialValue;
        }
        return [this.hooks[id], (newValue) => {
            this.hooks[id] = newValue;
            this.refresh();
        }];
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
        console.log('Rendering template', this.name);
        let template = this.app.templates[this.name];
        if (!template) {
            console.log('Fetching template', this.name);
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