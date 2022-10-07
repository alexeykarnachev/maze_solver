import {WALLS, WALL} from "./maze.js";


export class MazeDrawer {
    constructor(maze, context, background_color, wall_color) {
        this.maze = maze;
        this.context = context;
        this.background_color = background_color;
        this.wall_color = wall_color;

        this.cell_width = this.context.canvas.width / maze.n_cols;
        this.cell_height = this.context.canvas.height / maze.n_rows;
        this.wall_width = Math.min(this.cell_width, this.cell_height) * 0.2;

        this.reset();
    }

    reset() {
        this.context.fillStyle = this.background_color;
        this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        for (let cell = 0; cell < this.maze.n_cells; ++cell) {
            this.draw_cell_walls(cell);
        }
    }

    draw_cell_walls(cell) {
        let walls = this.maze.walls[cell]
        this.context.lineWidth = this.wall_width;
        for (let wall of WALLS) {
            this.context.strokeStyle = wall & walls ? this.wall_color : this.background_color;
            let coords = this.get_wall_coords(cell, wall);

            this.context.beginPath();
            this.context.moveTo(coords[0], coords[1]);
            this.context.lineTo(coords[2], coords[3]);
            this.context.stroke();
        }
    }

    fill_cell(cell, color) {
        let [x0, y0, x1, y1] = this.get_cell_coords(cell);
        this.context.fillStyle = color;
        this.context.fillRect(x0, y0, this.cell_width, this.cell_height);
        this.draw_cell_walls(cell);
    }

    get_wall_coords(cell, wall) {
        let [x0, y0, x1, y1] = this.get_cell_coords(cell);

        if (wall === WALL.N) {
            return [x0, y0, x1, y0];
        } else if (wall === WALL.E) {
            return [x1, y0, x1, y1];
        } else if (wall === WALL.S) {
            return [x0, y1, x1, y1];
        } else if (wall === WALL.W) {
            return [x0, y0, x0, y1];
        }
    }

    get_cell_coords(cell) {
        let [row, col] = this.maze.get_cell_row_col(cell);
        let x0 = col * this.cell_width;
        let x1 = x0 + this.cell_width;
        let y0 = row * this.cell_height;
        let y1 = y0 + this.cell_height;
        return [x0, y0, x1, y1];
    }
}
