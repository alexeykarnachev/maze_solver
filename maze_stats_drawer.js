import {pSBC} from "./pSBC.js";


export class MazeStatsDrawer {
    constructor(container, n_algorithms, background_color, border_color, font_name) {
        this.container = container;
        this.n_algorithms = n_algorithms;
        this.background_color = background_color;
        this.border_color = border_color;
        this.font_name = font_name;

        this.steps_pane = new Pane(
            "Steps",
            this.get_pane_container(),
            this.background_color,
            this.font_name
        );

        this.steps_bars = []; // (name, value, color)
        this.path_bars = []; // (name, value, color)
        this.name_to_loc = {};

        this.container.appendChild(this.steps_pane.container);
    }

    get_pane_container() {
        let container = document.createElement("div");
        container.style.height = "32.9%";
        container.style.width = "100%";
        return container;
    }

    reset() {
        this.steps_pane.reset();
    }

    draw() {
        for (let loc = 0; loc < Math.min(this.steps_bars.length, this.n_algorithms); ++loc) {
            let [name, value, color] = this.steps_bars[loc];
            this.steps_pane.draw_hbar(name, value, color, this.n_algorithms, loc, 2, 1);
        }

        for (let loc = 0; loc < Math.min(this.path_bars.length, this.n_algorithms); ++loc) {
            let bar = this.path_bars[loc];
            if (bar != null) {
                let [name, value, color] = bar;
                this.steps_pane.draw_hbar(name, value, color, this.n_algorithms, loc, 2, 0);
            }
        }
    }

    update_steps(name, value, color) {
        let loc = this.name_to_loc[name]; 
        let bar = [name, value, color];
        if (loc == null) {
            loc = Object.keys(this.name_to_loc).length;
            this.steps_bars.push(bar);
            this.name_to_loc[name] = loc;
        } else {
            this.steps_bars[loc] = bar;
        }
    }

    update_path(name, value, color) {
        let loc = this.name_to_loc[name]; 
        if (loc == null) {
            throw(`Can't update path for algorithm ${name} without any update_steps done`)
        } else {
            this.path_bars[loc] = [name, value, color];
        }
    }
}

class Pane {
    constructor(name, container, background_color, font_name) {
        this.container = container;
        this.background_color = background_color;
        this.font_name = font_name;

        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";

        this.reset();
    }

    reset() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.lastChild);
        }
        this.context.fillStyle = this.background_color;
        this.context.fillRect(0, 0, this.width, this.height);
        this.container.appendChild(this.canvas);
    }

    draw_hbar(name, value, color, grid_size, loc, n_texts, text_loc) {
        let thickness = this.height / grid_size;
        let x_offset = this.width * 0.2;
        let y_offset = thickness * 0.1;
        let font_size = thickness / n_texts;
        let y = loc * thickness + y_offset;

        thickness -= (y_offset * 1.5);
        let half_thickness = thickness / 2;
        let max_width = this.width - x_offset
        let length = Math.min(max_width, max_width * value);

        this.context.fillStyle = this.background_color;
        this.context.fillRect(0, y, length, thickness);
        this.context.fillRect(max_width, y + font_size * text_loc, x_offset, font_size);

        this.context.fillStyle = color;
        this.context.fillRect(0, y, length, thickness);

        if (value > 1) {
            this.draw_plus(
                pSBC(0.5, color),
                max_width - half_thickness,
                y + half_thickness,
                half_thickness * 0.6
            );
        }

        this.context.fillStyle = color;
        this.context.font = `${font_size * 0.8}px ` + this.font_name;
        this.context.textBaseline = "hanging";
        this.context.fillText(value.toFixed(2), max_width + x_offset * 0.2, y + font_size * text_loc);
    }

    draw_plus(color, x, y, radius) {
        this.context.fillStyle = color;
        this.context.beginPath();
        this.context.moveTo(x - radius, y + 0.25 * radius);
        this.context.lineTo(x - radius, y - 0.25 * radius);
        this.context.lineTo(x - 0.25 * radius, y - 0.25 * radius);
        this.context.lineTo(x - 0.25 * radius, y - radius);
        this.context.lineTo(x + 0.25 * radius, y - radius);
        this.context.lineTo(x + 0.25 * radius, y - 0.25 * radius);
        this.context.lineTo(x + radius, y - 0.25 * radius);
        this.context.lineTo(x + radius, y + 0.25 * radius);
        this.context.lineTo(x + 0.25 * radius, y + 0.25 * radius);
        this.context.lineTo(x + 0.25 * radius, y + radius);
        this.context.lineTo(x - 0.25 * radius, y + radius);
        this.context.lineTo(x - 0.25 * radius, y + 0.25 * radius);
        this.context.lineTo(x - radius, y + 0.25 * radius);
        this.context.fill();
    }
}

