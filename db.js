import dotenv from "dotenv";
import mysql from 'mysql2/promise';  // Ensure you are using promise-based mysql2
import { Client } from 'ssh2';
dotenv.config(); 
const sshClient = new Client();

const dbServer = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: "retailflow",
};

const localDbServer = {
    host: 'localhost',
    port: 3306,
    user: process.env.LOCAL_DB_USERNAME,
    password: process.env.LOCAL_DB_PASSWORD,
    database: "retailflow",
};

const sshTunnelConfig = {
    host: process.env.SSH_HOST,
    port: process.env.SSH_PORT,
    username: process.env.SSH_USER,
    password: process.env.SSH_PASSWORD
};

const forwardConfig = {
    srcHost: '127.0.0.1',
    srcPort: 3306,
    dstHost: process.env.DB_USERNAME,
    dstPort: process.env.DB_PASSWORD
};

const SSHDBConnection = new Promise((resolve, reject) => {
    sshClient.on('ready', () => {
        sshClient.forwardOut(
            forwardConfig.srcHost,
            forwardConfig.srcPort,
            forwardConfig.dstHost,
            forwardConfig.dstPort,
            async (err, stream) => {
                if (err) {
                    console.log("SSH Tunnel failed, trying local connection...");
                    return connectToLocalDb(resolve, reject);
                }

                const updatedDbServer = {
                    ...dbServer,
                    stream
                };

                try {
                    // Use promise-based mysql2 to create connection
                    const connection = await mysql.createConnection(updatedDbServer);
                    console.log("Remote DB Connection Successful");
                    resolve(connection);
                } catch (error) {
                    console.log("Remote DB connection failed, trying local connection...");
                    connectToLocalDb(resolve, reject);
                }
            }
        );
    }).on('error', (err) => {
        console.log("SSH Connection Error:", err.message);
        console.log("Trying local connection...");
        connectToLocalDb(resolve, reject);
    }).connect(sshTunnelConfig);
});

async function connectToLocalDb(resolve, reject) {
    try {
        // Use promise-based mysql2 to create local connection
        const localConnection = await mysql.createConnection(localDbServer);
        console.log("Local DB Connection Successful");
        resolve(localConnection);
    } catch (error) {
        console.log("Local DB connection failed:", error.message);
        reject(error);
    }
}

async function syncOfflineChanges(onlineConnection) {
    const localConnection = await mysql.createConnection(localDbServer);

    try {
        // Query to retrieve unsynced changes from the local offline_changes table
        const [offlineChanges] = await localConnection.promise().query(
            "SELECT * FROM offline_changes"
        );

        for (const change of offlineChanges) {
            const { table_name, change_type, record_id, data } = change;

            switch (change_type) {
                case 'INSERT':
                    await onlineConnection.promise().query(
                        `INSERT INTO ${table_name} SET ?`,
                        JSON.parse(data)
                    );
                    break;
                case 'UPDATE':
                    await onlineConnection.promise().query(
                        `UPDATE ${table_name} SET ? WHERE id = ?`,
                        [JSON.parse(data), record_id]
                    );
                    break;
                case 'DELETE':
                    await onlineConnection.promise().query(
                        `DELETE FROM ${table_name} WHERE id = ?`,
                        [record_id]
                    );
                    break;
                default:
                    console.log(`Unknown change type: ${change_type}`);
            }
        }

        // Clear synced records from the local offline_changes table
        await localConnection.promise().query("DELETE FROM offline_changes");
        console.log("Offline changes synced successfully.");
    } catch (error) {
        console.error("Error syncing offline changes:", error.message);
    } finally {
        localConnection.end();
    }
}

export default SSHDBConnection;