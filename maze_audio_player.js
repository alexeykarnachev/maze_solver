export class MazeAudioPlayer {
    constructor(maze, oscillator_type, dist_type) {
        this.maze = maze;
        this.oscillator_type = oscillator_type;
        this.dist_type = dist_type;

        this.context;
        this.oscillator;
        this.started = false;
    }

    start() {
        if (this.started) {
            return;
        }
        this.started = true;
        this.context = new AudioContext();
        this.oscillator = this.context.createOscillator();
        this.oscillator.start();
        this.oscillator.type = this.oscillator_type;
        this.max_freq = 700;
    }

    play_progress(cell, inverse_dist) {
        let progress = this.maze.get_progress_to_exit(cell, this.dist_type);
        if (inverse_dist) {
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
