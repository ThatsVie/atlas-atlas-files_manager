import redisClient from './utils/redis';

(async () => {
    console.log(redisClient.isAlive()); // Should print true if Redis is connected
    console.log(await redisClient.get('myKey')); // Should print null if myKey doesn’t exist

    await redisClient.set('myKey', 12, 5); // Set 'myKey' to 12 with a 5-second expiration
    console.log(await redisClient.get('myKey')); // Should print 12

    setTimeout(async () => {
        console.log(await redisClient.get('myKey')); // Should print null after 10 seconds due to expiration
    }, 1000 * 10);
})();
