import {sleep, alpha} from "./utils.js";


export class MazeAnimator {
    constructor(maze_drawer, maze_stats_drawer, maze_audio_player, step_ms) {
        this.drawer = maze_drawer;
        this.stats_drawer = maze_stats_drawer;
        this.audio_player = maze_audio_player;
        this.step_ms = step_ms;
    }

    async animate_solver_result(name, result, color) {
        await this.animate_history(name, result.history, color);
        await this.animate_path(name, result.path, color);
    }

    async animate_history(name, cells, color) {
        for (let i = 0; i < cells.length; ++i) {
            let cell = cells[i];
            let step = i / this.drawer.maze.n_cells;
            let dist_to_exit = this.drawer.maze.get_progress_to_exit(cell, "true");
            this.stats_drawer.update_steps(name, step, alpha(color, 0.5));
            this.stats_drawer.update_dist_to_exit(name, step, dist_to_exit, color);

            this.stats_drawer.draw();
            this.drawer.fill_cell(cell, alpha(color, 0.5));
            this.audio_player.play_progress(cell, false);

            await sleep(this.step_ms);
            this.audio_player.stop();
        }
    }

    async animate_path(name, cells, color) {
        for (let i = 0; i < cells.length; ++i) {
            let cell = cells[i];
            let value = i / this.drawer.maze.n_cells;
            this.stats_drawer.update_path(name, value, alpha(color));

            this.stats_drawer.draw();
            this.drawer.fill_cell(cell, color);
            this.audio_player.play_progress(cell, true);

            await sleep(this.step_ms);
            this.audio_player.stop();
        }
    }
}
