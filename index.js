ANVAS = null;
CONTEXT = null;

CANVAS_WIDTH = 800;
CANVAS_HEIGHT = 600;
N_COLS = CANVAS_WIDTH / 25;
N_ROWS = CANVAS_HEIGHT / 25;
N_CELLS = N_ROWS * N_COLS;

CELL_WIDTH = CANVAS_WIDTH / N_COLS;
CELL_HEIGHT = CANVAS_HEIGHT / N_ROWS;

BACKGROUND_COLOR = "#888888";
WALL_COLOR = "#282828";
PATH_COLOR = "#fe8019";
DFS_COLOR = "green";
BFS_COLOR = "blue";
BRANCH_CIRCLE_COLOR = "#cc241d";
BRANCH_CIRCLE_RADIUS = 5.0;
ANIMATION_WAIT_TIME = 1.0;

BRANCH_P = 0.3;
LOOP_P = 1.0;
WALLS = Array(N_CELLS).fill(15);
NORTH = 1;
EAST = 2;
SOUTH = 4;
WEST = 8;

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

    CONTEXT.fillStyle = BACKGROUND_COLOR;
    CONTEXT.fillRect(0, 0, CANVAS.width, CANVAS.height);
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

function draw_line(from, to, color) {
    CONTEXT.strokeStyle = color; 
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
            if (!visited[neighbour_cell] && can_visit_neighbour(cell, neighbour_cell, wall, visited)) {
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
        for (wall of cell_walls) {
            if (Math.random() < loop_p && can_remove_wall(cell, wall)) {
                remove_wall(cell, wall);
            }
        }
    }
}

async function solve_maze_dfs() {
    let visited = Array(N_CELLS).fill(false);

    async function walk(cell) {
        visited[cell] = true;
        if (cell === N_CELLS - 1) {
            return true;
        }
        let paths = get_cell_paths(cell);
        for (let path of paths) {
            let neighbour_cell = get_cell_neighbour(cell, path);
            if (!visited[neighbour_cell] && can_visit_neighbour(cell, neighbour_cell, path, visited)) {
                draw_line(get_cell_middle(cell), get_cell_middle(neighbour_cell), DFS_COLOR);
                await wait(ANIMATION_WAIT_TIME);
                if (await walk(neighbour_cell)) {
                    return true;
                };
            }
        }
        return false;
    }

    await walk(0);
}

async function solve_maze_bfs() {
    let visited = Array(N_CELLS).fill(false);
    visited[0] = true;
    let queue = [0];
    while (queue.length !== 0) {
        let new_queue = [];
        for (let i = 0; i < queue.length; ++i) {
            let cell = queue[i];
            if (cell === N_CELLS - 1) {
                return;
            }
            let paths = get_cell_paths(cell);
            for (path of paths) {
                let neighbour_cell = get_cell_neighbour(cell, path);
                if (!visited[neighbour_cell] && can_visit_neighbour(cell, neighbour_cell, path, visited)) {
                    visited[neighbour_cell] = true;
                    new_queue.push(neighbour_cell);
                    draw_line(get_cell_middle(cell), get_cell_middle(neighbour_cell), BFS_COLOR);
                    await wait(ANIMATION_WAIT_TIME);
                }
            }
        }
        queue = new_queue;
    }
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

function get_cell_paths(cell) {
    let hash = WALLS[cell];
    return [NORTH, EAST, SOUTH, WEST].filter(wall => !(wall & hash));
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
    solve_maze_dfs();
    solve_maze_bfs();
}

main();
