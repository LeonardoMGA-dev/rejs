class Component {
    constructor(props) {
        this.props = props;
    }
    
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.render();
    }

    setFunction(name, func) {
        this[name] = func;
    }
    
    render() {
        return '';
    }
}