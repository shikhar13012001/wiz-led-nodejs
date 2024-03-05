// create a queue for audio data to be processed by the bulb

class TaskQueue {
    constructor(concurrency) {
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
    }

    // runTask using async/await and wait for the task to complete
    async runTask(task) {
        while (this.running >= this.concurrency) {
            await new Promise(resolve => {
                setTimeout(resolve, 1000);
            });
        }
        this.running++;
        try {
            return await task();
        } finally {
            this.running--;
            this.next();
        }
    }

    // runTask(task) {
    //     return new Promise(resolve => {
    //         this.queue.push(() => {
    //             const taskPromise = task();
    //             taskPromise.then(resolve);
    //             return taskPromise;
    //         });
    //         process.nextTick(this.next.bind(this));
    //     });
    // }

    next() {
        while (this.running < this.concurrency && this.queue.length) {
            const task = this.queue.shift();
            task().then(() => {
                this.running--;
                this.next();
            });
            this.running++;
        }
    }
    stop() {
        this.queue = [];
    }
}

export default TaskQueue;