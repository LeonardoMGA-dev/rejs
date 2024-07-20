import Component from "./utils/Component.js";
import App from "/utils/App.js";
import components from "/utils/components.js";

const app = new App({ components, ejs });

app.hydrate("hydrator");

// when document is ready

$(document).ready(async () => {
    // get all the components with class component and refresh them
    const components = document.querySelectorAll('.component');
    // create a component for each component
    components.forEach(async (component) => {
        const id = component.getAttribute('id');
        const name = component.getAttribute('component');
        const props = JSON.parse(component.getAttribute('props'));
        const componentInstance = new Component({ id, name, app, props });
        await componentInstance.refresh();
    });

});

async function setState(id, value) {
    app.setState(id, value);
}

async function useState(id, component, initialValue) {
    return app.useState(id, component, initialValue);
}

window.setState = setState;

window.useState = useState;



