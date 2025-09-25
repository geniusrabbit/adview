import {LitElement, css, html} from 'lit';


class MyAd extends LitElement {
    static properties = {
        name: {},
    };

    constructor() {
        super();

        this.name = 'World';
    }

    render() {
        return html`<p>Hello, ${this.name}!</p>`;
    }
}
customElements.define('my-ad', MyAd);
