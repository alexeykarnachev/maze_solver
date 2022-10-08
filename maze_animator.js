import {sleep} from "./utils.js";


export class MazeAnimator {
    constructor(maze_drawer, maze_stats_drawer, maze_audio_player, step_ms) {
        this.drawer = maze_drawer;
        this.stats_drawer = maze_stats_drawer;
        this.audio_player = maze_audio_player;
        this.step_ms = step_ms;
    }

    async animate_solver_result(result, history_color, path_color) {
        await this.animate_history(result.history, history_color);
        await this.animate_path(result.path, path_color);
    }

    async animate_history(cells, color) {
        for (let cell of cells) {
            this.drawer.fill_cell(cell, color);
            this.audio_player.play_progress(cell, false);

            await sleep(this.step_ms);
            this.audio_player.stop();
        }
    }

    async animate_path(cells, color) {
        for (let cell of cells) {
            this.drawer.fill_cell(cell, color);
            this.audio_player.play_progress(cell, true);

            await sleep(this.step_ms);
            this.audio_player.stop();
        }
    }
}
