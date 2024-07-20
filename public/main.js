import App from "/utils/App.js";
import components from "/utils/components.js";

const app = new App({ components, ejs });

app.hydrate("hydrator");

async function setState(id, value) {
    app.setState(id, value);
}

async function useState(id, component, initialValue) {
    return app.useState(id, component, initialValue);
}

window.setState = setState;

window.useState = useState;



