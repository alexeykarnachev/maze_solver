export class MazeAudioPlayer {
    constructor(maze, context, type) {
        this.maze = maze;
        this.context = context;

        this.oscillator = this.context.createOscillator();
        this.oscillator.type = type;
        this.oscillator.start();
        this.max_freq = 1000;
    }

    play_manhattan_dist(cell, inverse_dist) {
        let progress = this.maze.get_manhattan_dist_to_exit(cell) / this.maze.get_manhattan_diameter();
        if (!inverse_dist) {
            progress = 1 - progress;
        }
        let freq = this.max_freq * progress;
        this.oscillator.frequency.value = freq;
        this.oscillator.connect(this.context.destination);    
    }

    stop() {
        this.oscillator.disconnect();
    }
}
