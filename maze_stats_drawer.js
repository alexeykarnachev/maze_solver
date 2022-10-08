export class MazeStatsDrawer {
    constructor(context, background_color) {
        this.context = context;
        this.background_color = background_color;

        this.reset();
    }

    reset() {
        this.context.fillStyle = this.background_color;
        this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    }
}
