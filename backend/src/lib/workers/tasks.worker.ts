import { parentPort } from 'worker_threads';


interface ITask {
  id: string,
  timeoutInSeconds: number
}
parentPort.on('message', (message: ITask) => {
  setTimeout(() => {
    parentPort.postMessage(message);
  }, message.timeoutInSeconds * 1000);
});
