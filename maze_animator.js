import {sleep} from "./utils.js";


export class MazeAnimator {
    constructor(maze_drawer, step_ms) {
        this.drawer = maze_drawer;
        this.step_ms = step_ms;
        this.maze = this.drawer.maze;
    }

    async animate_solver_result(result, history_color, path_color) {
        await this.fill_cells(result.history, history_color);
        await this.fill_cells(result.path, path_color);
    }

    async fill_cells(cells, color) {
        for (let cell of cells) {
            this.drawer.fill_cell(cell, color);
            await sleep(this.step_ms);
        }
    }
}
