import {links_to_path} from "./utils.js";
import {heappop, heappush} from "./heapq.js"


export async function solve_maze_dfs(maze) {
    let visited = Array(maze.n_cells).fill(false);
    let path = [];
    let history = [0];

    async function walk(cell) {
        visited[cell] = true;
        if (cell == maze.n_cells - 1) {
            return true;
        }

        let doors = maze.get_cell_doors(cell);
        for (let door of doors) {
            let neighbour_cell = maze.get_cell_neighbour(cell, door);
            if (
                !visited[neighbour_cell]
                && maze.can_visit_neighbour(cell, neighbour_cell)
            ) {
                history.push(neighbour_cell);
                if (await walk(neighbour_cell)) {
                    path.push(neighbour_cell);
                    return true
                }
            }
        }
        return false;
    }

    await walk(0);
    path.push(0);
    return {path: path, history: history};
}

export async function solve_maze_bfs(maze) {
    let links = Array(maze.n_cells).fill(-1);
    let history = [0];
    let queue = [0];
    links[0] = 0;

    while (queue.length !== 0) {
        let new_queue = [];
        
        for (let i = 0; i < queue.length; ++i) {
            let cell = queue[i];
            if (cell === maze.n_cells - 1) {
                new_queue = [];
                break;
            }

            let doors = maze.get_cell_doors(cell);
            for (let door of doors) {
                let neighbour_cell = maze.get_cell_neighbour(cell, door);
                if (
                    links[neighbour_cell] === -1
                    && maze.can_visit_neighbour(cell, neighbour_cell)
                ) {
                    links[neighbour_cell] = cell;
                    new_queue.push(neighbour_cell);
                    history.push(neighbour_cell);
                }
            }
        }
        queue = new_queue;
    }
    
    let path = links_to_path(links);
    return {path: path, history: history};
}

export async function solve_maze_astar(maze) {
    let links = Array(maze.n_cells).fill(-1);
    let history = [0];
    let queue = [[-maze.get_manhattan_dist_to_exit(0), 0]];
    links[0] = 0;

    while (queue.length !== 0) {
        let [_, cell] = heappop(queue);
        if (cell === maze.n_cells - 1) {
            break;
        }

        let doors = maze.get_cell_doors(cell);
        for (let door of doors) {
            let neighbour_cell = maze.get_cell_neighbour(cell, door);
            if (
                links[neighbour_cell] === -1
                && maze.can_visit_neighbour(cell, neighbour_cell)
            ) {
                links[neighbour_cell] = cell;
                let score = -maze.get_manhattan_dist_to_exit(neighbour_cell);
                heappush(queue, [score, neighbour_cell]);
                history.push(neighbour_cell);
            }
        }
    }

    let path = links_to_path(links);
    return {path: path, history: history};
}

