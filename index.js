import {heapify, heappop, heappush} from "./heap.js";


let CANVAS = null;
let CONTEXT = null;
let OSCILLATOR = null;
let AUDIO_CONTEXT = null;

let CANVAS_WIDTH = 800;
let CANVAS_HEIGHT = 600;
let N_COLS = CANVAS_WIDTH / 5;
let N_ROWS = CANVAS_HEIGHT / 5;
let N_CELLS = N_ROWS * N_COLS;
let CELL_WIDTH = CANVAS_WIDTH / N_COLS;
let CELL_HEIGHT = CANVAS_HEIGHT / N_ROWS;
if (CELL_WIDTH !== CELL_HEIGHT) {
    throw(`CELL_WIDTH must be equal to CELL_HEIGHT`)
}

let BACKGROUND_COLOR = "#bfbfbf";
let WALL_COLOR = "#282828";
let ALGO_COLOR = {dfs: "#fb4934", bfs: "#b8bb26", astar: "#076678"}
let ANIMATION_WAIT_TIME = 10.0;


let BRANCH_P = 0.1;
let LOOP_P = 0.01;
let WALLS = Array(N_CELLS).fill(15);
let NORTH = 1;
let EAST = 2;
let SOUTH = 4;
let WEST = 8;

function with_alpha(color, opacity) {
    const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
}

function get_cell_coords(cell) {
    let row = Math.floor(cell / N_COLS);
    let col = cell % N_COLS;

    let x0 = col * CELL_WIDTH;
    let x1 = x0 + CELL_WIDTH;
    let y0 = row * CELL_HEIGHT;
    let y1 = y0 + CELL_HEIGHT;

    return [x0, y0, x1, y1];
}

function get_wall_coords(cell, wall) {
    let [x0, y0, x1, y1] = get_cell_coords(cell);

    if (wall === NORTH) {
        return [x0, y0, x1, y0];
    } else if (wall === EAST) {
        return [x1, y0, x1, y1];
    } else if (wall === SOUTH) {
        return [x0, y1, x1, y1];
    } else if (wall === WEST) {
        return [x0, y0, x0, y1];
    }
}

function get_cell_middle(cell) {
    let [x0, y0, x1, y1] = get_cell_coords(cell);
    return [(x0 + x1) / 2.0, (y0 + y1) / 2.0];
}

function get_wall_middle(cell, wall) {
    let [x0, y0, x1, y1] = get_wall_coords(cell, wall);
    return [(x0 + x1) / 2.0, (y0 + y1) / 2.0];
}

function reset_canvas() {
    CANVAS = document.getElementById("canvas");
    CANVAS.width = CANVAS_WIDTH;
    CANVAS.height = CANVAS_HEIGHT;
    CONTEXT = CANVAS.getContext("2d");

    AUDIO_CONTEXT = new AudioContext();
    OSCILLATOR = AUDIO_CONTEXT.createOscillator();
    OSCILLATOR.type = "triangle";
    OSCILLATOR.start();

    CONTEXT.fillStyle = BACKGROUND_COLOR;
    CONTEXT.fillRect(0, 0, CANVAS.width, CANVAS.height);

    let start_btn = document.createElement("start_btn");
    start_btn.innerHTML = "Start";
    start_btn.onclick = async function() {
        AUDIO_CONTEXT.resume();
        let dfs_res = await solve_maze_dfs();
        let bfs_res = await solve_maze_bfs();
        let astar_res = await solve_maze_astar();
        await draw_results({dfs: dfs_res, bfs: bfs_res, astar: astar_res});
    }

    document.body.appendChild(start_btn);
}

function draw_cell_walls(cell) {
    CONTEXT.lineWidth = 2.0;

    let walls = WALLS[cell]; 
    for (let wall of [NORTH, EAST, SOUTH, WEST]) {
        if (wall & walls) {
            CONTEXT.strokeStyle = WALL_COLOR;
        } else {
            CONTEXT.strokeStyle = BACKGROUND_COLOR;
        }
        let wall_coords = get_wall_coords(cell, wall);
        CONTEXT.beginPath();
        CONTEXT.moveTo(wall_coords[0], wall_coords[1]);
        CONTEXT.lineTo(wall_coords[2], wall_coords[3]);
        CONTEXT.stroke();
    }
}

function draw_grid_walls() {
    for (let cell = 0; cell < N_CELLS; ++cell) {
        draw_cell_walls(cell);
    }
}

function draw_line(from, to, color, width) {
    CONTEXT.strokeStyle = color; 
    CONTEXT.lineWidth = width;
    CONTEXT.beginPath();
    CONTEXT.moveTo(from[0], from[1]);
    CONTEXT.lineTo(to[0], to[1]);
    CONTEXT.stroke();
}

function draw_circle(center, radius, color) {
    CONTEXT.beginPath();
    CONTEXT.arc(center[0], center[1], radius, 0, 2 * Math.PI, false);
    CONTEXT.fillStyle = color;
    CONTEXT.fill();
}

function draw_path_step(cell1, cell2, color) {
    let width = CELL_WIDTH * 0.25;
    draw_line(get_cell_middle(cell1), get_cell_middle(cell2), color, width);
}

async function draw_results(results) {
    let colors = [];
    let algos = [];
    let paths = [];
    let histories = [];

    for (let algo in results) {
        colors.push(ALGO_COLOR[algo]);
        algos.push(algo);
        paths.push(results[algo].path);
        histories.push(results[algo].history);
    }

    let n_histories_done = 0;
    while (n_histories_done !== histories.length) {
        for (let i = 0; i < histories.length; ++i) {
            let history = histories[i];
            if (history.length === 0) {
                continue;
            }
            let cell = history.pop();
            n_histories_done += history.length === 0;

            fill_cell(cell, with_alpha(colors[i], 0.2));
            draw_cell_walls(cell);

            let dist = get_manhattan_dist(cell, N_CELLS - 1);
            let max_dist = get_manhattan_dist(0, N_CELLS - 1);
            OSCILLATOR.frequency.value = 1000 * (1 - dist / max_dist);
            OSCILLATOR.connect(AUDIO_CONTEXT.destination);
            await wait(ANIMATION_WAIT_TIME);
            OSCILLATOR.disconnect(AUDIO_CONTEXT.destination);
        }
    }

    let n_paths_done = 0;
    while (n_paths_done !== paths.length) {
        for (let i = 0; i < paths.length; ++i) {
            let path = paths[i];
            if (path.length === 0) {
                continue;
            }
            let cell = path.pop();
            n_paths_done += path.length === 0;

            draw_path_step()
            fill_cell(cell, with_alpha(colors[i], 0.8));
            draw_cell_walls(cell);

            let dist = get_manhattan_dist(cell, N_CELLS - 1);
            let max_dist = get_manhattan_dist(0, N_CELLS - 1);
            OSCILLATOR.frequency.value = 1000 * (dist / max_dist);
            OSCILLATOR.connect(AUDIO_CONTEXT.destination);
            await wait(ANIMATION_WAIT_TIME);
            OSCILLATOR.disconnect(AUDIO_CONTEXT.destination);
        }
    }
}

function fill_cell(cell, color) {
    let [x0, y0, x1, y1] = get_cell_coords(cell);
    CONTEXT.fillStyle = color;
    CONTEXT.fillRect(x0, y0, CELL_WIDTH, CELL_HEIGHT);
}

function get_opposite_wall(wall) {
    if (wall === NORTH) {
        return SOUTH;
    } else if (wall === EAST) {
        return WEST;
    } else if (wall === SOUTH) {
        return NORTH;
    } else if (wall === WEST) {
        return EAST;
    } else {
        throw("Unknown wall");
    }
}

function remove_wall(cell, wall) {
    let neighbour_cell = get_cell_neighbour(cell, wall);
    WALLS[cell] -= wall;
    WALLS[neighbour_cell] -= get_opposite_wall(wall);
}

function can_remove_wall(cell, wall) {
    let north_cell = get_cell_neighbour(cell, NORTH);
    let east_cell = get_cell_neighbour(cell, EAST);
    let south_cell = get_cell_neighbour(cell, SOUTH);
    let west_cell = get_cell_neighbour(cell, WEST);

    let walls = WALLS[cell];
    let north_walls = WALLS[north_cell];
    let east_walls = WALLS[east_cell];
    let south_walls = WALLS[south_cell];
    let west_walls = WALLS[west_cell];

    if (wall === NORTH && can_visit_neighbour(cell, north_cell, wall)) {
        return (
            ((walls & WEST) || (north_walls & WEST) || (west_walls & NORTH))
            && ((walls & EAST) || (north_walls & EAST) || (east_walls & NORTH)) 
        )
    } else if (wall === EAST && can_visit_neighbour(cell, east_cell, wall)) {
        return (
            ((walls & NORTH) || (east_walls & NORTH) || (north_walls & EAST))
            && ((walls & SOUTH) || (east_walls & SOUTH) || (south_walls & EAST)) 
        )
    } else if (wall === SOUTH && can_visit_neighbour(cell, south_cell, wall)) {
        return can_remove_wall(south_cell, NORTH);
    } else if (wall === WEST && can_visit_neighbour(cell, west_cell, wall)) {
        return can_remove_wall(west_cell, EAST);
    } else {
        return false;
    }
}

function can_visit_neighbour(cell, neighbour_cell, wall) {
    return !(
        neighbour_cell < 0
        || neighbour_cell >= N_CELLS
        || (wall === EAST && cell % N_COLS === N_COLS - 1)
        || (wall === WEST && cell % N_COLS === 0)
    )
}

async function generate_maze(branch_p) {
    let visited = Array(N_CELLS).fill(false);

    let branch_heads = [];
    async function walk(cell) {
        visited[cell] = true;
        let walls = get_cell_walls(cell);
        if (walls.length === 0) {
            return;
        }

        let is_branch = (Math.random() < branch_p && walls.length >= 2);

        if (is_branch) {
            while (branch_heads.length !== 0) {
                await walk(branch_heads.pop())
            }
            branch_heads.push(cell);
        }

        shuffle(walls);
        for (let wall of walls) {
            let neighbour_cell = get_cell_neighbour(cell, wall);
            let neighbour_walls = get_cell_walls(neighbour_cell);
            if (!visited[neighbour_cell] && can_visit_neighbour(cell, neighbour_cell, wall)) {
                remove_wall(cell, wall);
                await walk(neighbour_cell);
            }
        }
    }

    await walk(0);
}

async function make_loops(loop_p) {
    for (let cell = 0; cell < N_CELLS; ++cell) {
        let cell_walls = get_cell_walls(cell);
        for (let wall of cell_walls) {
            if (Math.random() < loop_p && can_remove_wall(cell, wall)) {
                remove_wall(cell, wall);
            }
        }
    }
}

async function solve_maze_dfs() {
    let visited = Array(N_CELLS).fill(false);
    let path = [];
    let history = [0];

    async function walk(cell) {
        visited[cell] = true;
        if (cell === N_CELLS - 1) {
            return true;
        }
        let doors = get_cell_doors(cell);
        for (let door of doors) {
            let neighbour_cell = get_cell_neighbour(cell, door);
            if (!visited[neighbour_cell] && can_visit_neighbour(cell, neighbour_cell, door)) {
                history.push(neighbour_cell);
                if (await walk(neighbour_cell)) {
                    path.push(neighbour_cell);
                    return true;
                };
            }
        }
        return false;
    }

    await walk(0);
    path.push(0);
    return {path: path.reverse(), history: history.reverse()};
}

async function solve_maze_bfs() {
    let links = Array(N_CELLS).fill(-1);
    let history = [0];
    let queue = [0];

    while (queue.length !== 0) {
        let new_queue = [];
        for (let i = 0; i < queue.length; ++i) {
            let cell = queue[i];
            if (cell === N_CELLS - 1) {
                new_queue = [];
                break;
            }
            let doors = get_cell_doors(cell);
            for (let door of doors) {
                let neighbour_cell = get_cell_neighbour(cell, door);
                if (
                    links[neighbour_cell] === -1
                    && can_visit_neighbour(cell, neighbour_cell, door)
                ) {
                    links[neighbour_cell] = cell;
                    new_queue.push(neighbour_cell);
                    history.push(neighbour_cell);
                }
            }
        }
        queue = new_queue;
    }

    let cell = N_CELLS - 1; 
    let path = [];
    while (cell !== 0) {
        path.push(cell)
        let neighbour_cell = links[cell];
        cell = neighbour_cell;
    }

    path.push(0);
    return {path: path.reverse(), history: history.reverse()};
}

async function solve_maze_astar() {
    let links = Array(N_CELLS).fill(-1);
    let queue = [[-get_manhattan_dist(0, N_CELLS - 1), 0]];
    let history = [0];
    links[0] = 0;

    while (true) {
        let [_score, cell] = heappop(queue);

        // DEBUG
        if (queue.length > 0 && _score < Math.max(queue.map(x => x[0]))) {
            throw("BUG!");
        }

        if (cell === N_CELLS - 1) {
            break;
        }
        let doors = get_cell_doors(cell);
        for (let door of doors) {
            let neighbour_cell = get_cell_neighbour(cell, door);
            if (
                links[neighbour_cell] === -1
                && can_visit_neighbour(cell, neighbour_cell, door)
            ) {
                links[neighbour_cell] = cell;
                let score = get_manhattan_dist(neighbour_cell, N_CELLS - 1);
                heappush(queue, [-score, neighbour_cell]);
                history.push(neighbour_cell);
            }
        }
    }

    let cell = N_CELLS - 1; 
    let path = [];
    while (cell !== 0) {
        path.push(cell)
        let neighbour_cell = links[cell];
        cell = neighbour_cell;
    }

    path.push(0);
    return {path: path.reverse(), history: history.reverse()};
}

function get_cell_neighbour(cell, wall) {
    let neighbour_cell;
    if (wall === NORTH) {
        neighbour_cell = cell - N_COLS;
    } else if (wall === EAST) {
        neighbour_cell = cell + 1;
    } else if (wall === SOUTH) {
        neighbour_cell = cell + N_COLS;
    } else if (wall === WEST) {
        neighbour_cell = cell - 1;
    } else {
        throw("Unknown wall");
    }
    return neighbour_cell;
}

function get_cell_walls(cell) {
    let hash = WALLS[cell];
    return [NORTH, EAST, SOUTH, WEST].filter(wall => wall & hash);
}

function get_cell_doors(cell) {
    let hash = WALLS[cell];
    return [NORTH, EAST, SOUTH, WEST].filter(wall => !(wall & hash));
}

function get_manhattan_dist(cell1, cell2) {
    let x1 = cell1 % N_COLS;
    let y1 = Math.floor(cell1 / N_COLS);
    let x2 = cell2 % N_COLS;
    let y2 = Math.floor(cell2 / N_COLS);
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

const shuffle = array => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    reset_canvas();
    await generate_maze(BRANCH_P);
    await make_loops(LOOP_P);
    draw_grid_walls();
}

main();
