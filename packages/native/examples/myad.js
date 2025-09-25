
console.log('aaa asjs');

class MyAd  extends HTMLElement {
    constructor() {
        super();

        // let template = document.getElementById("custom-paragraph");
        // let templateContent = template.content;
        //
        // console.log('aaaa templateContent', templateContent)
        //
        // const shadowRoot = this.attachShadow({ mode: "open" });
        // shadowRoot.appendChild(templateContent.cloneNode(true));

        // this.attachShadow({mode: 'open', slotAssignment: 'named'});
        // this.innerHTML = `
        //       <div class="text-red-600">
        //       Name: <slot name="username" />
        //       </div>
        //       <div>Birthday: <slot name="birthday" />
        //       </div>
        //     `;
    }

    get adFormat() {
        return this.getAttribute("ad-format") || '';
    }

    get adSlot() {
        return this.getAttribute("ad-slot") || '';
    }

    get templateId () {
        return this.getAttribute("template-id") || '';
    }

    connectedCallback() {
        let template = document.getElementById(this.templateId);
        let templateContent = template.content
        const templateTitle = templateContent.querySelector('[name="title"], [slot="title"]');


        // templateTitle?.replaceWith(this.adFormat)


        console.log('aaa  template.accessKeyLabel', template.innerHTML,  templateContent )

            //.replaceAll('{{title}}','HAHA !')

        // console.log('aaa thic', template.innerHTML);

        this.appendChild(templateContent)

        // this.attachShadow({mode: 'open'});
        // this.shadowRoot.appendChild(templateContent.cloneNode(true));
        //

        // this.replaceWith(templateContent.cloneNode(true));
        // this.append(templateContent);
            //`Hello World! "${this.adFormat} " <slot name="username" /> ${templateContent}`;
    }
}

customElements.define("my-ad", MyAd, );

