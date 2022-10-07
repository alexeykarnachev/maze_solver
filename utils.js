export function uv_to_hex(x) {
    let h = Math.round(Math.min(Math.max(x || 1, 0), 1) * 255);
    return h.toString(16).toUpperCase();
}

export function get_manhattan_dist(pos1, pos2) {
    return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
}

export function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; --i) {
        let j = Math.floor(Math.random() * (i + 1));
        let tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms)); 
}

export function links_to_path(links) {
    let cell = links.length - 1;
    let path = [];
    while (cell !== 0) {
        path.push(cell);
        let neighbour_cell = links[cell];
        if (neighbour_cell === -1) {
            throw("There is unconnected cell in the provided links")
        }
        cell = neighbour_cell;
    }

    path.push(0)
    return path;
}
