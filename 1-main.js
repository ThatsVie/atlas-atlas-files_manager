import dbClient from './utils/db';

const waitConnection = () => {
    return new Promise((resolve, reject) => {
        let i = 0;
        const repeatFct = async () => {
            await setTimeout(() => {
                i += 1;
                if (i >= 10) {
                    reject();
                } else if (!dbClient.isAlive()) {
                    repeatFct();
                } else {
                    resolve();
                }
            }, 1000);
        };
        repeatFct();
    });
};

(async () => {
    console.log(dbClient.isAlive());
    await waitConnection();
    console.log(dbClient.isAlive());

    // Check and insert users if needed
    const userCount = await dbClient.nbUsers();
    if (userCount < 4) {
        await dbClient.db.collection('users').insertMany([
            { name: "User1" },
            { name: "User2" },
            { name: "User3" },
            { name: "User4" }
        ]);
    }

    // Check and insert files if needed
    const fileCount = await dbClient.nbFiles();
    if (fileCount < 30) {
        await dbClient.db.collection('files').insertMany(
            Array.from({ length: 30 - fileCount }, (_, i) => ({ filename: `File${fileCount + i + 1}` }))
        );
    }

    // Print counts
    console.log(await dbClient.nbUsers());  // Expected: 4
    console.log(await dbClient.nbFiles());  // Expected: 30
})();
