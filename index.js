import {Maze} from "./maze.js";
import {MazeDrawer} from "./maze_drawer.js";
import {MazeAudioPlayer} from "./maze_audio_player.js";
import {MazeAnimator} from "./maze_animator.js";
import {solve_maze_dfs, solve_maze_bfs, solve_maze_astar} from "./maze_solver.js";
import {uv_to_hex} from "./utils.js";

let N_COLS = 80;
let N_ROWS = 60;
let BRANCH_P = 0.15;
let LOOP_P = 0.05;

let BACKGROUND_COLOR = "#928374";
let WALL_COLOR = "#282828";
let DFS_COLOR = "#fb4934";
let BFS_COLOR = "#b8bb26";
let ASTAR_COLOR = "#076678";

let ANIMATION_STEP_MS = 0.0;


async function main() {
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext("2d");
    let maze = new Maze(N_COLS, N_ROWS, BRANCH_P, LOOP_P);
    let maze_drawer = new MazeDrawer(maze, context, BACKGROUND_COLOR, WALL_COLOR);

    await maze.generate();
    maze_drawer.draw_maze();

    let dfs = await solve_maze_dfs(maze);
    let bfs = await solve_maze_bfs(maze);
    let astar = await solve_maze_astar(maze);

    window.onkeypress = event => {
        let key = event.key;
        if (key === "Enter") {
            let audio_context = new AudioContext();
            let maze_audio_player = new MazeAudioPlayer(maze, audio_context, "triangle");
            let maze_animator = new MazeAnimator(maze_drawer, maze_audio_player, ANIMATION_STEP_MS);
            let alpha = uv_to_hex(0.5);
            maze_animator.animate_solver_result(bfs, BFS_COLOR + alpha, BFS_COLOR);
            maze_animator.animate_solver_result(dfs, DFS_COLOR + alpha, DFS_COLOR);
            maze_animator.animate_solver_result(astar, ASTAR_COLOR + alpha, ASTAR_COLOR);
        }
    }
}

main();
