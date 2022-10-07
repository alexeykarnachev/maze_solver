export function heapify(arr) {
    function heapify_from_parent(arr, parent_ind) {
        let left_ind = parent_ind * 2 + 1;
        let right_ind = parent_ind * 2 + 2;

        if (left_ind < arr.length && arr[left_ind][0] > arr[parent_ind][0]) {
            var greatest_ind = left_ind;
        } else {
            var greatest_ind = parent_ind;
        }
        
        if (right_ind < arr.length && arr[right_ind][0] > arr[greatest_ind][0]) {
            greatest_ind = right_ind;
        }

        if (greatest_ind !== parent_ind) {
            let tmp = arr[greatest_ind];
            arr[greatest_ind] = arr[parent_ind];
            arr[parent_ind] = tmp;
        }
    }

    let mid = Math.floor(arr.length / 2);
    for (let i = 0; i < mid; ++i) {
        let parent_ind = mid - 1 - i;
        heapify_from_parent(arr, parent_ind)
    }
}

export function heappop(arr) {
    let ind = arr.length - 1;
    let tmp = arr[ind];
    arr[ind] = arr[0];
    arr[0] = tmp;
    let x = arr.pop();
    heapify(arr);
    return x;
}

export function heappush(arr, x) {
    arr.push(x); 
    heapify(arr);
}
