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

        this.plot_pane = new Pane(
            document.getElementById("plot_canvas"),
            this.background_color,
            this.font_name
        );

        this.steps_bars = []; // (name, value, color)
        this.path_bars = []; // (name, value, color)
        this.dist_to_exit = {}; // (color, [prev_x, prev_y], [curr_x, curr_y])
        this.name_to_loc = {};
    }

    reset() {
        this.bar_pane.reset();
        this.plot_pane.reset();
    }

    draw() {
        let bar_thickness = 0.8;

        let draw_hbar = (value, color, loc) => {
            this.bar_pane.draw_hbar(value, color, this.n_algorithms, loc, bar_thickness);
        }

        let draw_hbar_name = (text, color, loc) => {
            let y = (loc + 1) / this.n_algorithms;
            let font = "45px " + this.font_name;
            this.bar_pane.draw_left_text(text, color, y, font, "bottom");
        }

        let draw_hbar_steps = (value, color, loc) => {
            let y = (loc + 1) / this.n_algorithms;
            let font = "35px " + this.font_name;
            this.bar_pane.draw_right_text(value.toFixed(2), color, y, font, "bottom");
        }

        let draw_hbar_path = (value, color, loc) => {
            let y = loc / this.n_algorithms;
            let font = "35px " + this.font_name;
            this.bar_pane.draw_right_text(value.toFixed(2), color, y, font, "top");
        }

        let draw_line_dist_to_exit = (color, x1, y1, x2, y2) => {
            this.plot_pane.draw_line(color, x1, y1, x2, y2, 2);
        }

        for (let name in this.name_to_loc) {
            let loc = this.name_to_loc[name];
            let [_, value, bar_color] = this.steps_bars[loc];
            let steps_bar_color = pSBC(-0.4, bar_color); 
            draw_hbar(value, steps_bar_color, loc);
            draw_hbar_name(name, bar_color, loc);
            draw_hbar_steps(value, steps_bar_color, loc);

            let [line_color, [x1, y1], [x2, y2]] = this.dist_to_exit[name];
            draw_line_dist_to_exit(line_color, x1, y1, x2, y2);

            let path_bar = this.path_bars[loc];
            if (path_bar != null) {
                draw_hbar(path_bar[1], path_bar[2], loc);
                draw_hbar_path(path_bar[1], path_bar[2], loc);
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

    update_dist_to_exit(name, step, value, color) {
        let dist_to_exit = this.dist_to_exit[name];
        if (dist_to_exit == null) {
            this.dist_to_exit[name] = [color, [0, 1.0], [step, value]];
        } else {
            this.dist_to_exit[name] = [color, dist_to_exit[2], [step, value]];
        }
    }
}

class Pane {
    constructor(
        canvas,
        background_color,
        font_name,
        top_offset=0.15, 
        right_offset=0.15,
        bot_offset=0.15,
        left_offset=0.15
    ) {
        this.background_color = background_color;
        this.font_name = font_name;

        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.top_offset = this.height * top_offset;
        this.right_offset = this.width * right_offset;
        this.bot_offset = this.height * bot_offset;
        this.left_offset = this.width * left_offset;

        this.reset();
    }

    reset() {
        this.context.fillStyle = this.background_color;
        this.context.fillRect(0, 0, this.width, this.height);
    }

    draw_left_text(text, color, y, font, baseline) {
        y = (this.top_offset + (this.height - this.top_offset - this.bot_offset) * y) / this.height;
        let x = 0.025;
        this.draw_text(text, color, x, y, font, baseline);
    }

    draw_right_text(text, color, y, font, baseline) {
        y = (this.top_offset + (this.height - this.top_offset - this.bot_offset) * y) / this.height;
        let x = 1.025 - (this.right_offset / this.width);
        this.draw_text(text, color, x, y, font, baseline);
    }

    draw_text(text, color, x, y, font, baseline) {
        x *= this.width;
        y *= this.height;
        this.context.font = font;
        this.context.textBaseline = baseline;

        let metrics = this.context.measureText(text);
        this.context.fillStyle = this.background_color;
        if (baseline === "bottom") {
            let h = metrics.fontBoundingBoxAscent;
            this.context.fillRect(x, y - h, metrics.width, h);
        } else if (baseline === "top") {
            let h = metrics.fontBoundingBoxDescent;
            this.context.fillRect(x, y, metrics.width, h);
        } else {
            throw(`Unknown text base line: ${baseline}`);
        }

        this.context.fillStyle = color;
        this.context.fillText(text, x, y);
    }

    draw_hbar(value, color, grid_size, loc, thickness) {
        let height = (this.height - this.top_offset - this.bot_offset) / grid_size;
        let y = this.top_offset + loc * height + 0.5 * (1 - thickness) * height;

        thickness *= height;
        let max_width = this.width - this.left_offset - this.right_offset;
        let length = Math.min(max_width, max_width * value);
        let half_thickness = thickness / 2;

        this.context.fillStyle = color;
        this.context.fillRect(this.left_offset, y, length, thickness);

        if (value > 1) {
            this.draw_plus(
                pSBC(0.5, color),
                this.left_offset + max_width - half_thickness,
                y + half_thickness,
                half_thickness * 0.6
            );
        }
    }

    draw_line(color, x1, y1, x2, y2, width) {
        x1 *= this.width;
        y1 *= this.height;
        x2 *= this.width;
        y2 *= this.height;

        this.context.strokeStyle = color;
        this.context.lineWidth = width;
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
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

