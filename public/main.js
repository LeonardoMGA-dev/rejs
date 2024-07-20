import App from "/utils/App.js";
import components from "/utils/components.js";

const app = new App({ components, ejs });
app.hydrate("hydrator");
