export class ControlPane {
    constructor(background_color) {
        this.size = 0.2;
        this.branch_p = 0.01;
        this.loop_p = 0.01;

        this.ongenerate = function(){};
        this.onstart = function(){};

        this.container = document.getElementById("control_pane_div");
        this.container.style.backgroundColor = background_color;

        this.buttons_container = document.createElement("div");
        this.generate_button = this.create_button("Generate", "ongenerate");
        this.start_button = this.create_button("Start", "onstart");

        this.sliders_container = document.createElement("div");
        this.sliders_container.style.width = "100%"
        this.branches_slider = this.create_slider("Size", "size");
        this.branches_slider = this.create_slider("Branches", "branch_p");
        this.loops_slider = this.create_slider("Loops", "loop_p");

        this.container.appendChild(this.buttons_container);
        this.container.appendChild(this.sliders_container);
    }

    create_button(name, callback_name) {
        let div = document.createElement("div");
        let button = document.createElement("button");

        div.style.display = "inline-block";
        button.innerHTML = name;
        button.style.margin = "5px";

        let pane = this;
        button.onclick = function() {
            pane[callback_name]();
        }

        div.appendChild(button);
        this.buttons_container.appendChild(div);

        return button;
    }

    create_slider(name, field) {
        let div = document.createElement("div");
        let input = document.createElement("input");
        let label = document.createElement("label");
        let span = document.createElement("span")

        div.style.width = "90%";
        div.style.marginLeft = "2%";

        input.style.width = "100%";
        input.style.marginTop = "2%";
        input.type = "range";
        input.min = 0;
        input.max = 0.99;
        input.step = 0.01;
        input.value = this[field];

        label.innerHTML = name;
        label.style.fontSize = "16px";
        label.style.float = "right";
        label.style.backgroundColor = "white";

        span.innerHTML = ": " + this[field].toFixed(2);

        let pane = this;
        input.oninput = function() {
            pane[field] = parseFloat(this.value);
            span.innerHTML = ": " + pane[field].toFixed(2);
        }

        label.appendChild(span);
        div.appendChild(input);
        div.appendChild(label);

        this.sliders_container.appendChild(div);

        return input;
    }
}
