export class ControlPane {
    constructor(
        algorithms, // [[name, color, solver], ...]
        background_color,
        button_color,
        slider_color,
        slider_thumb_color,
        text_color,
        font_name
    ) {
        this.size = 0.2;
        this.branch_p = 0.01;
        this.loop_p = 0.01;
        this.started = false;

        this.ongenerate = function(){};
        this.onstart = function(){};

        this.background_color = background_color;
        this.button_color = button_color;
        this.slider_color = slider_color;
        this.slider_thumb_color = slider_thumb_color;
        this.text_color = text_color;
        this.font_name = font_name;

        this.container = document.getElementById("control_pane_div");
        this.container.style.backgroundColor = background_color;

        this.control_buttons_container = document.createElement("div");
        this.generate_button = this.create_control_button("Generate", "ongenerate");
        this.start_button = this.create_control_button("Start", "onstart");

        this.algorithm_buttons_container = document.createElement("div");
        this.algorithm_selected = {};
        this.algorithm_solver = {};
        this.algorithm_color = {};
        this.algorithm_buttons = [];
        for (let [name, color, solver] of algorithms) {
            this.algorithm_buttons.push(this.create_algorithm_button(name, color));
            this.algorithm_selected[name] = false;
            this.algorithm_solver[name] = solver;
            this.algorithm_color[name] = color;
        }

        this.sliders_container = document.createElement("div");
        this.sliders_container.style.width = "100%"
        this.branches_slider = this.create_slider("Size", "size");
        this.branches_slider = this.create_slider("Branches", "branch_p");
        this.loops_slider = this.create_slider("Loops", "loop_p");

        this.container.appendChild(this.control_buttons_container);
        this.container.appendChild(this.sliders_container);
        this.container.appendChild(this.algorithm_buttons_container);
    }

    get_active_algorithms() {
        let algorithms = [];
        for (name in this.algorithm_selected) {
            if (this.algorithm_selected[name]) {
                algorithms.push(name);
            }
        }
        return algorithms;
    }

    async start(maze_animator) {
        for (let button of this.algorithm_buttons) {
            button.disabled = true;
        }
        this.started = true;
        let algorithm_result = {};
        for (name in this.algorithm_selected) {
            if (this.algorithm_selected[name]) {
                algorithm_result[name] = await this.algorithm_solver[name](maze_animator.drawer.maze);
            }
        }

        for (name in this.algorithm_selected) {
            if (this.algorithm_selected[name]) {
                maze_animator.animate_solver_result(name, algorithm_result[name], this.algorithm_color[name]);
            }
        }
    }

    create_control_button(name, callback_name) {
        let div = document.createElement("div");
        let button = document.createElement("button");

        div.style.display = "inline-block";
        button.innerHTML = name;
        button.style.fontFamily = this.font_name;
        button.style.fontSize = "17px";
        button.style.margin = "5px";
        button.style.color = this.text_color;
        button.style.backgroundColor = this.button_color;

        let pane = this;
        button.onclick = function() {
            pane[callback_name]();
        }

        div.appendChild(button);
        this.control_buttons_container.appendChild(div);

        return button;
    }

    create_algorithm_button(name, color) {
        let div = document.createElement("div");
        let button = document.createElement("button");

        div.style.display = "inline-block";
        button.innerHTML = name;
        button.style.fontFamily = this.font_name;
        button.style.fontSize = "17px";
        button.style.marginTop = "25px";
        button.style.marginLeft = "1px";
        button.style.color = this.background_color;
        button.style.backgroundColor = color;
        button.style.opacity = "0.3";

        let pane = this;
        button.onclick = function() {
            if (pane.started) {
                return;
            }
            if (!pane.algorithm_selected[name]) {
                pane.algorithm_selected[name] = true;
                button.style.opacity = "1.0";
            } else {
                pane.algorithm_selected[name] = false;
                button.style.opacity = "0.3";
            }
        }

        div.appendChild(button);
        this.algorithm_buttons_container.appendChild(div);

        return button;
    }

    create_slider(name, field) {
        let div = document.createElement("div");
        let input = document.createElement("input");
        let label = document.createElement("label");
        let span = document.createElement("span")

        div.style.width = "96%";
        div.style.marginLeft = "2%";

        input.type = "range";
        input.style.width = "100%";
        input.style.marginTop = "2%";
        input.style.background = this.slider_color;
        input.style.setProperty('--slider_thumb_background', this.slider_thumb_color);

        input.min = 0;
        input.max = 0.99;
        input.step = 0.01;
        input.value = this[field];

        label.innerHTML = name;
        label.style.marginTop = "-1%";
        label.style.fontFamily = this.font_name;
        label.style.fontSize = "17px";
        label.style.float = "right";
        label.style.color = this.text_color;

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
