import {pSBC} from "./pSBC.js";


export class MazeStatsDrawer {
    constructor(n_algorithms, background_color, border_color, font_name) {
        this.n_algorithms = n_algorithms;
        this.background_color = background_color;
        this.border_color = border_color;
        this.font_name = font_name;

        this.bar_pane = new Pane(
            document.getElementById("bar_canvas"),
            this.background_color,
            this.font_name
        );

        this.steps_bars = []; // (name, value, color)
        this.path_bars = []; // (name, value, color)
        this.name_to_loc = {};
    }

    reset() {
        this.bar_pane.reset();
    }

    draw() {
        let bar_left_offset = 0.15;
        let bar_right_offset = 0.15;
        let bar_thickness = 0.8;

        let draw_hbar = (value, color, loc) => {
            this.bar_pane.draw_hbar(
                value, color, this.n_algorithms, loc, bar_left_offset, bar_right_offset, bar_thickness
            );
        }

        let draw_hbar_name = (text, color, loc) => {
            let x = 0;
            let y = (loc + 1) / this.n_algorithms;
            let font = "20px " + this.font_name;
            this.bar_pane.draw_text(text, color, x, y, font);
        }

        for (let name in this.name_to_loc) {
            let loc = this.name_to_loc[name];
            let [_, value, color] = this.steps_bars[loc];
            draw_hbar(value, pSBC(-0.8, color), loc);
            draw_hbar_name(name, color, loc);

            let path_bar = this.path_bars[loc];
            if (path_bar != null) {
                draw_hbar(path_bar[1], path_bar[2], loc);
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
    constructor(canvas, background_color, font_name) {
        this.background_color = background_color;
        this.font_name = font_name;

        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.reset();
    }

    reset() {
        this.context.fillStyle = this.background_color;
        this.context.fillRect(0, 0, this.width, this.height);
    }

    draw_text(text, color, x, y, font) {
        x *= this.width;
        y *= this.height;
        this.context.font = font;
        this.context.textBaseline = "bottom";

        let metrics = this.context.measureText(text);
        this.context.fillStyle = this.background_color;
        this.context.fillRect(x, y, metrics.width, metrics.height);

        this.context.fillStyle = color;
        this.context.fillText(text, x, y);
    }

    draw_hbar(value, color, grid_size, loc, left_offset, right_offset, thickness) {
        left_offset = this.width * left_offset;
        right_offset = this.width * right_offset;
        let v_offset = 0.5 * (1 - thickness) * (this.height / grid_size);

        thickness = thickness * this.height / grid_size;
        let half_thickness = thickness / 2;
        let y = loc * this.height / grid_size + v_offset;
        let max_width = this.width - left_offset - right_offset;
        let length = Math.min(max_width, max_width * value);

        this.context.fillStyle = color;
        this.context.fillRect(left_offset, y, length, thickness);

        if (value > 1) {
            this.draw_plus(
                pSBC(0.5, color),
                left_offset + max_width - half_thickness,
                y + half_thickness,
                half_thickness * 0.6
            );
        }
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

