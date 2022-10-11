import {pSBC} from "./pSBC.js";


export class MazeStatsDrawer {
    constructor(n_algorithms, background_color, text_color, font_name) {
        this.n_algorithms = n_algorithms;
        this.background_color = background_color;
        this.text_color = text_color;
        this.font_name = font_name;

        this.bar_pane = new Pane(
            document.getElementById("bar_canvas"),
            this.background_color,
            0.15, 0.15, 0.05, 0.15
        );

        this.plot_pane = new Pane(
            document.getElementById("plot_canvas"),
            this.background_color,
            0.15, 0.15, 0.05, 0.15
        );

        this.steps_bars = []; // (name, value, color)
        this.path_bars = []; // (name, value, color)
        this.steps_progress = {}; // (color, [prev_x, prev_y], [curr_x, curr_y])
        this.path_progress = {}; // (color, [prev_x, prev_y], [curr_x, curr_y])
        this.name_to_loc = {};
    }

    reset() {
        this.bar_pane.reset();
        this.plot_pane.reset();
    }

    draw() {
        let bar_thickness = 0.8;

        let font = (size) => {
            return size.toString() + "px " + this.font_name;
        }

        let draw_hbar = (value, color, loc) => {
            this.bar_pane.draw_hbar(value, color, this.n_algorithms, loc, bar_thickness);
        }

        let draw_hbar_name = (text, color, loc) => {
            let y = (loc + 1) / this.n_algorithms;
            this.bar_pane.draw_left_text(text, color, y, font(45), "bottom");
        }

        let draw_hbar_steps = (value, color, loc) => {
            let y = (loc + 0.5) / this.n_algorithms;
            this.bar_pane.draw_right_text(value.toFixed(2), color, y, font(35), "top");
        }

        let draw_hbar_path = (value, color, loc) => {
            let y = (loc + 0.5) / this.n_algorithms;
            this.bar_pane.draw_right_text(value.toFixed(2), color, y, font(35), "bottom");
        }

        let draw_line_progress = (color, x1, y1, x2, y2, width) => {
            this.plot_pane.draw_line(color, x1, y1, x2, y2, width);
        }

        this.bar_pane.draw_left_text("Steps Done:", this.text_color, 0, font(40), "bottom");
        this.plot_pane.draw_left_text("Distance to Exit:", this.text_color, 0, font(40), "bottom");

        for (let name in this.name_to_loc) {
            let loc = this.name_to_loc[name];
            let [_, value, bar_color] = this.steps_bars[loc];
            let steps_bar_color = pSBC(-0.4, bar_color); 
            draw_hbar(value, steps_bar_color, loc);
            draw_hbar_name(name, bar_color, loc);
            draw_hbar_steps(value, steps_bar_color, loc);

            let [line_color, [x1, y1], [x2, y2]] = this.steps_progress[name];
            if (x1 != null) {
                let line_progress_color = pSBC(-0.8, line_color);
                draw_line_progress(line_progress_color, x1, y1, x2, y2, 2);
            }

            let path_bar = this.path_bars[loc];
            if (path_bar != null) {
                draw_hbar(path_bar[1], path_bar[2], loc);
                draw_hbar_path(path_bar[1], path_bar[2], loc);
            }

            let path_progress = this.path_progress[name];
            if (path_progress != null) {
                let [line_color, [x1, y1], [x2, y2]] = path_progress;
                if (x1 != null) {
                    draw_line_progress(line_color, x1, y1, x2, y2, 5);
                }
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

    update_steps_progress(name, step, value, color) {
        let progress = this.steps_progress[name];
        if (progress == null) {
            this.steps_progress[name] = [color, [null, null], [step, value]];
        } else {
            this.steps_progress[name] = [color, progress[2], [step, value]];
        }
    }

    update_path_progress(name, step, value, color) {
        let progress = this.path_progress[name];
        if (progress == null) {
            this.path_progress[name] = [color, [null, null], [step, value]];
        } else {
            this.path_progress[name] = [color, progress[2], [step, value]];
        }
    }
}

class Pane {
    constructor(
        canvas,
        background_color,
        top_offset, 
        right_offset,
        bot_offset,
        left_offset
    ) {
        this.background_color = background_color;

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
        x1 = this.left_offset + (this.width - this.left_offset - this.right_offset) * x1;
        x2 = this.left_offset + (this.width - this.left_offset - this.right_offset) * x2;
        y1 = this.top_offset + (this.height - this.top_offset - this.bot_offset) * y1;
        y2 = this.top_offset + (this.height - this.top_offset - this.bot_offset) * y2;

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

