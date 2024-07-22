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

    setGlobalStyle(styles) {
        if (this.app.isServer) {
            return;
        }
        const storedStyles = this.app.styles[this.name];
        if (storedStyles && storedStyles === styles) {
            return;
        }
        // convert the styles object to css string
        const css = this._convertToCss(styles);
        // create a style element and append it to the document
        this.app.styles[this.name] = styles;
        $('<style>').text(css).appendTo(document.head)
    }


    _convertToCss(styles) {
        return Object.keys(styles).map((key) => {
            const value = styles[key];
            if (typeof value === 'object') {
                return `${key} { ${this._convertToCss(value)} }`;
            }
            return `${key}: ${value};`;
        }).join('\n');
    }

    useStyle (styles) {
        const id = `${this.id}:${this.hookId++}`;
        const storedStyles = this.app.stateTable[id];
        if (!storedStyles) {
            this.app.stateTable[id] = styles;
        }
        const attribute = `style="${this._convertToCss(this.app.stateTable[id])}"`;
        return [attribute, this.app.stateTable[id], (newStyles) => {
            this.app.stateTable[id] = newStyles;
            this.refresh();
        }];
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

    meta({className = ""} = {}) {
        // verify if className is not undefined
        const classes = className ? `component ${className}` : "component";
        return `id="${this.id}" component="${this.name}" class="${classes}" props='${JSON.stringify(this.props)}'`;
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
            if (this.id === 1) {
                return html;   
            }
            return `<div ${this.meta()} >${html}</div>`;
        } catch (error) {
            return `<div>Failed to render ${error}</div>`;
        }
    }

    async component(name, props = {}) {
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