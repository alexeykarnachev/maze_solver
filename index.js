import {Maze} from "./maze.js";
import {MazeDrawer} from "./maze_drawer.js";
import {MazeStatsDrawer} from "./maze_stats_drawer.js";
import {MazeAudioPlayer} from "./maze_audio_player.js";
import {MazeAnimator} from "./maze_animator.js";
import {
    solve_maze_dfs,
    solve_maze_bfs,
    solve_maze_dbs,
    solve_maze_astar
} from "./maze_solver.js";
import {alpha} from "./utils.js";

let N_COLS = 64;
let N_ROWS = 48;
let BRANCH_P = 0.01;
let LOOP_P = 0.01;

let MAZE_BACKGROUND_COLOR = "#928374";
let STATS_BACKGROUND_COLOR = "#1d2021";
let WALL_COLOR = "#282828";
let DFS_COLOR = "#fb4934";
let BFS_COLOR = "#b8bb26";
let DBS_COLOR = "#fabd2f";
let ASTAR_COLOR = "#076678";

let ANIMATION_STEP_MS = 10.0;


async function main() {
    let maze_canvas = document.getElementById("maze_canvas");
    let stats_canvas = document.getElementById("stats_canvas");
    let maze_context = maze_canvas.getContext("2d");
    let stats_context = stats_canvas.getContext("2d");
    let maze = new Maze(N_COLS, N_ROWS, BRANCH_P, LOOP_P);
    let maze_drawer = new MazeDrawer(maze, maze_context, MAZE_BACKGROUND_COLOR, WALL_COLOR);
    let maze_stats_drawer = new MazeStatsDrawer(stats_context, STATS_BACKGROUND_COLOR);

    await maze.generate();
    maze_drawer.draw_maze();

    let dfs = await solve_maze_dfs(maze);
    let bfs = await solve_maze_bfs(maze);
    let dbs = await solve_maze_dbs(maze);
    let astar = await solve_maze_astar(maze);

    console.log(`[DFS] history: ${dfs.history.length}, path: ${dfs.path.length}`);
    console.log(`[BFS] history: ${bfs.history.length}, path: ${bfs.path.length}`);
    console.log(`[DBS] history: ${dbs.history.length}, path: ${dbs.path.length}`);
    console.log(`[ASTAR] history: ${astar.history.length}, path: ${astar.path.length}`);

    window.onkeypress = event => {
        let key = event.key;
        if (key === "Enter") {
            let audio_context = new AudioContext();
            let maze_audio_player = new MazeAudioPlayer(maze, audio_context, "triangle", "true");
            let maze_animator = new MazeAnimator(
                maze_drawer,
                maze_stats_drawer,
                maze_audio_player,
                ANIMATION_STEP_MS
            );
            // maze_animator.animate_solver_result(dfs, alpha(DFS_COLOR, 0.4), alpha(DFS_COLOR, 0.8));
            // maze_animator.animate_solver_result(bfs, BFS_COLOR + alpha, BFS_COLOR);
            maze_animator.animate_solver_result(dbs, alpha(DBS_COLOR, 0.2), alpha(DBS_COLOR, 0.8));
            maze_animator.animate_solver_result(astar, alpha(ASTAR_COLOR, 0.3), alpha(ASTAR_COLOR, 0.8));
        }
    }
}

main();
