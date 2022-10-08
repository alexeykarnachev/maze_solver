export class MazeStatsDrawer {
    constructor(container, background_color, border_color) {
        this.container = container;
        this.background_color = background_color;
        this.border_color = border_color;

        this.steps_pane = new Pane(
            "Steps",
            this.get_pane_container(),
            this.background_color
        );

        this.steps_bars = []; // (name, value, color)

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
        let grid_size = this.steps_bars.length;
        for (let loc = 0; loc < grid_size; ++loc) {
            let [name, value, color] = this.steps_bars[loc];
            this.steps_pane.draw_hbar(name, value, color, grid_size, loc);
        }
    }

    update_steps(name, value, color) {
        for (let loc = 0; loc < this.steps_bars.length; ++loc) {
            if (this.steps_bars[loc][0] === name) {
                this.steps_bars[loc][1] = value;
                this.steps_bars[loc][2] = color;
                return;
            }
        }

        this.steps_bars.push([name, value, color]);
    }
}

class Pane {
    constructor(name, container, background_color) {
        this.container = container;
        this.background_color = background_color;

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

    draw_hbar(name, value, color, grid_size, loc) {
        let thickness = this.height / grid_size;
        let offset = thickness * 0.1;
        let y = loc * thickness + offset;
        thickness -= offset;
        let length = this.width * value;

        this.context.fillStyle = this.background_color;
        this.context.fillRect(0, y, length, thickness);

        this.context.fillStyle = color;
        this.context.fillRect(0, y, length, thickness);
    }
}

