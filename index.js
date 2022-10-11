import {Maze} from "./maze.js";
import {MazeDrawer} from "./maze_drawer.js";
import {MazeStatsDrawer} from "./maze_stats_drawer.js";
import {MazeAnimator} from "./maze_animator.js";
import {MazeAudioPlayer} from "./maze_audio_player.js";
import {
    solve_maze_dfs,
    solve_maze_bfs,
    solve_maze_dbs,
    solve_maze_astar
} from "./maze_solver.js";
import {ControlPane} from "./control_pane.js";
import {lerp} from "./utils.js";

let FONT_NAME = "SourceCodePro"

let MIN_N_COLS = 16;
let MIN_N_ROWS = 12;
let MAX_N_COLS = 200;
let MAX_N_ROWS = 150;
let BRANCH_P = 0.01;
let LOOP_P = 0.01;
let ANIMATION_STEP_MS = 10.0;
let DOCUMENT_BACKGROUND_COLOR = "black";
let CONTROL_PANE_BACKGROUND_COLOR = "#1d2021";
let CONTROL_PANE_BUTTON_COLOR = "#282828";
let CONTROL_PANE_SLIDER_COLOR = "#665c54";
let CONTROL_PANE_SLIDER_THUMB_COLOR = "#d65d0e";
let CONTROL_PANE_TEXT_COLOR = "#928374";
let MAZE_BACKGROUND_COLOR = "#928374";
let STATS_BACKGROUND_COLOR = "#1d2021";
let STATS_TEXT_COLOR = "#928374";
let WALL_COLOR = "#282828";
let DFS_COLOR = "#fb4934";
let BFS_COLOR = "#b8bb26";
let DBS_COLOR = "#fabd2f";
let ASTAR_COLOR = "#428588";
let ALGORITHMS = [
    ["DFS", DFS_COLOR, solve_maze_dfs],
    ["BFS", BFS_COLOR, solve_maze_bfs],
    ["DBS", DBS_COLOR, solve_maze_dbs],
    ["A*", ASTAR_COLOR, solve_maze_astar]
];

let MAZE_CANVAS = document.getElementById("maze_canvas");
let MAZE_CONTEXT = maze_canvas.getContext("2d");
let CONTROL_PANE = new ControlPane(
    ALGORITHMS,
    CONTROL_PANE_BACKGROUND_COLOR,
    CONTROL_PANE_BUTTON_COLOR, 
    CONTROL_PANE_SLIDER_COLOR,
    CONTROL_PANE_SLIDER_THUMB_COLOR,
    CONTROL_PANE_TEXT_COLOR, 
    FONT_NAME
);

async function main() {
    new FontFace(
        'SourceCodePro',
        'url(assets/fonts/Source_Code_Pro/static/SourceCodePro-Regular.ttf)'
    ).load().then((font) => { document.fonts.add(font) });
    document.body.style.background = DOCUMENT_BACKGROUND_COLOR;

    let maze = new Maze();

    CONTROL_PANE.start_button.disabled = true;
    CONTROL_PANE.onstart = function() {
        if (CONTROL_PANE.get_active_algorithms().length > 0) {
            CONTROL_PANE.start_button.disabled = true;
            CONTROL_PANE.generate_button.disabled = true;
            start(maze);
        }
    }

    CONTROL_PANE.ongenerate = function() {
        CONTROL_PANE.start_button.disabled = false;
        generate(maze);
    }
}

async function start(maze) {
    let maze_drawer = new MazeDrawer(maze, MAZE_CONTEXT, MAZE_BACKGROUND_COLOR, WALL_COLOR);
    await maze_drawer.draw_maze();

    let active_algorithms = CONTROL_PANE.get_active_algorithms(); 
    let maze_stats_drawer = new MazeStatsDrawer(
        active_algorithms.length,
        STATS_BACKGROUND_COLOR,
        STATS_TEXT_COLOR,
        FONT_NAME
    );
    let maze_audio_player = new MazeAudioPlayer(maze, "triangle", "true");
    let maze_animator = new MazeAnimator(
        maze_drawer,
        maze_stats_drawer,
        maze_audio_player,
        ANIMATION_STEP_MS
    );

    await CONTROL_PANE.start(maze_animator);
}

async function generate(maze) {
    let n_rows = Math.round(lerp(MIN_N_ROWS, MAX_N_ROWS, CONTROL_PANE.size));
    let n_cols = Math.round(lerp(MIN_N_COLS, MAX_N_COLS, CONTROL_PANE.size));
    await maze.generate(n_rows, n_cols, CONTROL_PANE.branch_p, CONTROL_PANE.loop_p);
    let maze_drawer = new MazeDrawer(maze, MAZE_CONTEXT, MAZE_BACKGROUND_COLOR, WALL_COLOR);
    await maze_drawer.draw_maze();
}

main();
