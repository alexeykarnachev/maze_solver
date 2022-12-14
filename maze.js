import {get_manhattan_dist, shuffle} from "./utils.js";


export let WALL = {N: 1, E: 2, S: 4, W: 8};
export let OPPOSITE_WALL = {1: WALL.S, 2: WALL.W, 4: WALL.N, 8: WALL.E};
export let WALLS = [WALL.N, WALL.E, WALL.S, WALL.W];

export class Maze {
    constructor() {
        this.n_rows;
        this.n_cols;
        this.branch_p;
        this.loop_p;
        this.n_cells;
        this.walls;
        this.dists;
        this.true_diameter;
    }

    async generate(n_rows, n_cols, branch_p, loop_p) {
        branch_p = Math.min(0.99, branch_p);
        loop_p = Math.min(0.99, loop_p);
        
        this.n_rows = n_rows;
        this.n_cols = n_cols;
        this.branch_p = branch_p;
        this.loop_p = loop_p;
        this.n_cells = this.n_rows * this.n_cols;
        this.walls = Array(this.n_cells).fill(15);
        this.dists = Array(this.n_cells).fill(Infinity);
        this.true_diameter = 0;

        let visited = Array(this.n_cells).fill(false);
        let heads = [];
        let maze = this;
        async function walk(cell) {
            visited[cell] = true;
            let walls = maze.get_cell_walls(cell);
            if (walls.length === 0) {
                return;
            }

            if (
                Math.random() < maze.branch_p
                && walls.length >= 2
            ) {
                while (heads.length !== 0) {
                    await walk(heads.pop());
                }
                heads.push(cell);
            }

            shuffle(walls);
            for (let wall of walls) {
                let neighbour_cell = maze.get_cell_neighbour(cell, wall);
                let neighbour_walls = maze.get_cell_walls(neighbour_cell);
                if (
                    !visited[neighbour_cell]
                    && maze.can_visit_neighbour(cell, neighbour_cell)
                ) {
                    maze.remove_wall(cell, wall);
                    await walk(neighbour_cell);
                }
            }
        }

        function make_loops() {
            for (let cell = 0; cell < maze.n_cells; ++ cell) {
                let walls = maze.get_cell_walls(cell);
                for (let wall of walls) {
                    if (
                        Math.random() < maze.loop_p
                        && maze.can_remove_wall(cell, wall)
                    ) {
                        maze.remove_wall(cell, wall);
                    }
                }
            }
        }

        function calc_dists() {
            let visited = Array(maze.n_cells).fill(false);
            let queue = [maze.n_cells - 1];
            let dist = 0;

            while (queue.length !== 0) {
                let new_queue = [];
                
                for (let i = 0; i < queue.length; ++i) {
                    let cell = queue[i];
                    maze.dists[cell] = dist;
                    maze.true_diameter = Math.max(maze.true_diameter, dist);

                    let doors = maze.get_cell_doors(cell);
                    for (let door of doors) {
                        let neighbour_cell = maze.get_cell_neighbour(cell, door);
                        if (
                            !visited[neighbour_cell]
                            && maze.can_visit_neighbour(cell, neighbour_cell)
                        ) {
                            visited[neighbour_cell] = true;
                            new_queue.push(neighbour_cell);
                        }
                    }
                }
                queue = new_queue;
                dist += 1;
            }
        }

        await walk(0);
        make_loops();
        calc_dists();
    }

    get_cell_row_col(cell) {
        let row = Math.floor(cell / this.n_cols);
        let col = cell % this.n_cols;
        return [row, col];
    }

    get_cell_walls(cell) {
        let hash = this.walls[cell];
        return WALLS.filter(wall => wall & hash);
    }

    get_cell_doors(cell) {
        let hash = this.walls[cell];
        return WALLS.filter(wall => !(wall & hash));
    }

    get_cell_neighbour(cell, wall) {
        let sign = wall === WALL.E || wall === WALL.S ? 1 : -1;
        let shift = wall === WALL.N || wall === WALL.S ? this.n_cols : 1;
        return cell + sign * shift;
    }

    get_progress_to_exit(cell, type) {
        let dist_to_exit = this.get_dist_to_exit(cell, type);
        let diameter = this.get_diameter(type);
        let progress = 1 - dist_to_exit / diameter; 
        return progress;
    }

    get_dist_to_exit(cell, type) {
        if (type === "manhattan") {
            return this.get_manhattan_dist_to_exit(cell);
        } else if (type === "true") {
            return this.get_true_dist_to_exit(cell);
        } else {
            throw(`Unknown distance type: ${type}`);
        }
    }

    get_diameter(type) {
        if (type === "manhattan") {
            return this.get_manhattan_diameter();
        } else if (type === "true") {
            return this.get_true_diameter();
        } else {
            throw(`Unknown distance type: ${type}`);
        }
    }

    get_manhattan_dist_to_exit(cell) {
        let cell_pos = this.get_cell_row_col(cell);
        let exit_pos = this.get_cell_row_col(this.n_cells - 1);
        return get_manhattan_dist(cell_pos, exit_pos); 
    }

    get_manhattan_diameter() {
        return this.get_manhattan_dist_to_exit(0);
    }

    get_true_dist_to_exit(cell) {
        return this.dists[cell];
    }

    get_true_diameter() {
        return this.true_diameter;
    }

    remove_wall(cell, wall) {
        let neighbour_cell = this.get_cell_neighbour(cell, wall);
        this.walls[cell] -= wall;
        this.walls[neighbour_cell] -= OPPOSITE_WALL[wall];
    }

    can_visit_neighbour(cell, neighbour_cell) {
        if (neighbour_cell < 0 || neighbour_cell >= this.n_cells) {
            return false;
        }

        let [row1, col1] = this.get_cell_row_col(cell);
        let [row2, col2] = this.get_cell_row_col(neighbour_cell);

        if (row1 === row2) {
            return col1 === col2 + 1 || col1 === col2 - 1;
        } else if (col1 === col2) {
            return row1 === row2 + 1 || row1 === row2 - 1;
        } else {
            return false;
        }
    }

    can_remove_wall(cell, wall) {
        let walls = this.walls[cell];

        let n_cell = this.get_cell_neighbour(cell, WALL.N)
        let e_cell = this.get_cell_neighbour(cell, WALL.E)
        let s_cell = this.get_cell_neighbour(cell, WALL.S)
        let w_cell = this.get_cell_neighbour(cell, WALL.W)

        let n_walls = this.walls[n_cell];
        let e_walls = this.walls[e_cell];
        let s_walls = this.walls[s_cell];
        let w_walls = this.walls[w_cell];

        if (wall === WALL.N && this.can_visit_neighbour(cell, n_cell)) {
            return (walls & WALL.W) + (n_walls & WALL.W) + (w_walls & WALL.N)
            && (walls & WALL.E) + (n_walls & WALL.E) + (e_walls & WALL.N);
        } else if (wall === WALL.E && this.can_visit_neighbour(cell, e_cell)) {
            return (walls & WALL.N) + (e_walls & WALL.N) + (n_walls & WALL.E)
            && (walls & WALL.S) + (e_walls & WALL.S) + (s_walls & WALL.E);
        } else if (wall === WALL.S && this.can_visit_neighbour(cell, s_cell)) {
            return this.can_remove_wall(s_cell, WALL.N);
        } else if (wall === WALL.W && this.can_visit_neighbour(cell, w_cell)) {
            return this.can_remove_wall(w_cell, WALL.E)
        } else {
            return false;
        }
    }
}
