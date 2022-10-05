ANVAS = null;
CONTEXT = null;

CANVAS_WIDTH = 800;
CANVAS_HEIGHT = 600;
N_COLS = CANVAS_WIDTH / 20;
N_ROWS = CANVAS_HEIGHT / 20;
N_CELLS = N_ROWS * N_COLS;

CELL_WIDTH = CANVAS_WIDTH / N_COLS;
CELL_HEIGHT = CANVAS_HEIGHT / N_ROWS;

WALLS = Array(N_CELLS).fill(15);
NORTH = 1;
EAST = 2;
SOUTH = 4;
WEST = 8;

function get_wall_coords(cell, wall) {
    let row = Math.floor(cell / N_COLS);
    let col = cell % N_COLS;

    let x0 = col * CELL_WIDTH;
    let x1 = x0 + CELL_WIDTH;
    let y0 = row * CELL_HEIGHT;
    let y1 = y0 + CELL_HEIGHT;

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

function reset_canvas() {
    CANVAS = document.getElementById("canvas");
    CANVAS.width = CANVAS_WIDTH;
    CANVAS.height = CANVAS_HEIGHT;
    CONTEXT = CANVAS.getContext("2d");

    CONTEXT.fillStyle = "#888888";
    CONTEXT.fillRect(0, 0, CANVAS.width, CANVAS.height);
}

async function draw_cell_walls(cell) {
    CONTEXT.strokeStyle = "#282828";
    CONTEXT.lineWidth = 3.0;

    let walls = WALLS[cell]; 
    for (let wall of [NORTH, EAST, SOUTH, WEST]) {
        if (wall & walls) {
            let wall_coords = get_wall_coords(cell, wall);
            CONTEXT.beginPath();
            CONTEXT.moveTo(wall_coords[0], wall_coords[1]);
            CONTEXT.lineTo(wall_coords[2], wall_coords[3]);
            CONTEXT.stroke();
        }
    }
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
        throw(`Unknown wallection`);
    }
}

function get_neighbor_cell(cell, wall) {
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
        throw(`Unknown wallection`);
    }
    return neighbour_cell;
}

async function pave_way() {
    let visited = Array(N_CELLS).fill(false);

    function can_visit_neighbour(cell, neighbour_cell, wall) {
        return !(
            neighbour_cell < 0
            || neighbour_cell >= N_CELLS
            || visited[neighbour_cell]
            || (wall === EAST && cell % N_COLS === N_COLS - 1)
            || (wall === WEST && cell % N_COLS === 0)
        )
    }

    async function dfs(cell) {
        visited[cell] = true;

        let walls = [NORTH, EAST, SOUTH, WEST];
        shuffle(walls);
        for (let wall of walls) {
            let neighbour_cell = get_neighbor_cell(cell, wall);
            if (can_visit_neighbour(cell, neighbour_cell, wall)) {
                WALLS[cell] -= wall;
                WALLS[neighbour_cell] -= get_opposite_wall(wall);
                await dfs(neighbour_cell);
            }
        }
    }

    await dfs(0);
}

const shuffle = array => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

async function main() {
    reset_canvas();
    await pave_way();
    for (let cell = 0; cell < N_CELLS; ++cell) {
        await draw_cell_walls(cell);
    }
}

main();
