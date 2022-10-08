export class MazeAudioPlayer {
    constructor(maze, audio_context, oscillator_type, dist_type) {
        this.maze = maze;
        this.context = audio_context;
        this.dist_type = dist_type;

        this.oscillator = this.context.createOscillator();
        this.oscillator.type = oscillator_type;
        this.oscillator.start();
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
