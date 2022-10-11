export class MazeAudioPlayer {
    constructor(maze, oscillator_type, dist_type) {
        this.maze = maze;
        this.oscillator_type = oscillator_type;
        this.dist_type = dist_type;
        this.context = new AudioContext();

        this.oscillator = this.context.createOscillator();
        this.oscillator.type = this.oscillator_type;
        this.oscillator.start();
    }

    play_progress(cell, inverse_dist) {
        let progress = this.maze.get_progress_to_exit(cell, this.dist_type);
        if (inverse_dist) {
            progress = 1 - progress;
        }
        let freq = Math.pow(25 * progress, 2.0) + 50;
        this.oscillator.frequency.value = freq;
        this.oscillator.connect(this.context.destination);    
    }

    stop() {
        let gain_node = this.context.createGain();
        this.oscillator.connect(gain_node);
        gain_node.connect(this.context.destination)
        gain_node.gain.setTargetAtTime(0, this.context.currentTime, 0.015);
        this.oscillator.disconnect(this.context.destination);    
    }
}
