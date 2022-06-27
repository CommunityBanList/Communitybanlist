import sequelize from './sequelize.js';

import {
  Organisation,
  BanList,
  SteamUser,
  Ban,
  ExportBanList,
  ExportBanListConfig,
  ExportBan
} from './models/index.js';

export default async function () {
  try {
    console.log('Connecting to the CBL database...');
    await sequelize.authenticate();
    console.log('Connected to the CBL database.');
    console.log('Synchronizing the models...');
    await Organisation.sync();
    await BanList.sync();
    await SteamUser.sync();
    await Ban.sync();
    await ExportBanList.sync();
    await ExportBanListConfig.sync();
    await ExportBan.sync();
    console.log('Synchronized the models.');
  } catch (err) {
    console.log(`Error thrown when connecting to the database: ${err.message}`);
  }
}
