import axios from 'axios';
import querystring from 'querystring';

import { battlemetrics } from 'scbl-lib/apis';
import { classifyBanReason, Logger } from 'scbl-lib/utils';

export default class BanFetcher {
  constructor(storeBanFunc) {
    this.storeBanFunc = storeBanFunc;
  }

  async fetchBanList(banList) {
    Logger.verbose('BanFetcher', 1, `Fetching ban list (ID: ${banList.id})...`);
    switch (banList.type) {
      case 'remote':
        await this.fetchRemoteBanList(banList);
        break;
      case 'battlemetrics':
        await this.fetchBattlemetricsBanList(banList);
        break;
      case 'custom':
        await this.fetchCustomBanList(banList);
        break;
      default:
        throw new Error('Unsupported ban list type.');
    }
  }

  async fetchRemoteBanList(banList) {
    // Fetch ban data.
    Logger.verbose(
      'BanFetcher',
      1,
      `Fetching remote ban list data for ban list (ID: ${banList.id})...`
    );
    const { data } = await axios.get(banList.source);

    const bans = [];

    // Loop over each line of the ban file.
    for (const line of data.split('\n')) {
      // Split the line to get the steam user, expiry data and reason.
      const match = line.match(/([0-9]{17}):([0-9]+) ?\/\/(.+)/);
    
      // Skip the line if there's no match, i.e. no ban is contained on the line.
      if (!match) continue;

      let [, steamUser, expires, reason] = match;

      // Turn the expiry data into a date object or null for perm bans.
      expires = parseInt(expires);
      expires = expires ? new Date(expires * 1000) : null;

      // Store the new ban.
      bans.push({
        id: `${banList.id},${steamUser},${expires ? expires.getTime() : 'null'}`,

        steamUser: steamUser,

        expires: expires,
        expired: !(expires === null || expires.getTime() > Date.now()),

        reason: classifyBanReason(reason),
        rawReason: reason,

        banList: banList
      });
    }

    this.storeBanFunc(bans);
  }

  async fetchBattlemetricsBanList(banList) {
    // Setup the initial parameters for the first fetch.
    let params = { 'filter[banList]': banList.source, 'page[size]': 100 };

    // Loop until there's no more pages to fetch.
    while (true) {
      try {
        // Get the ban page's data.
        Logger.verbose(
          'BanFetcher',
          1,
          `Fetching Battlemetrics ban list data for ban list (ID: ${banList.id})...`
        );
        const { data } = await battlemetrics('get', 'bans', params);

        const bans = [];

        // Loop over each ban in the page's data.
        for (const ban of data.data) {
          // Get the SteamID of the player banned.
          let steamUser;
          // Loop through identifiers to get steamID.
          for (const identifier of ban.attributes.identifiers) {
            // Ignore none SteamID identifiers.
            if (identifier.type !== 'steamID') continue;

            // Some show steam url instead of usual format so handle that case.
            if (identifier.identifier)
              steamUser = identifier.identifier.replace('https://steamcommunity.com/profiles/', '');
            else if (identifier.metadata) steamUser = identifier.metadata.profile.steamid;
            else continue;

            if (!steamUser.match(/[0-9]{17}/)) {
              steamUser = null;
              continue;
            }

            break;
          }

          // Sometimes there is no SteamID in the response. If this is the case we ignore the ban.
          if (steamUser == null) continue;

          // Turn the dates into date objects or null if permanent ban.
          const created = new Date(ban.attributes.timestamp);
          const expires = ban.attributes.expires ? new Date(ban.attributes.expires) : null;

          // Store the ban.
          bans.push({
            id: `${banList.id},${ban.attributes.uid}`,

            steamUser: steamUser.trim(),

            created: created,
            expires: expires,
            expired: !(ban.attributes.expires === null || expires.getTime() > Date.now()),

            reason: classifyBanReason(`${ban.attributes.reason} ${ban.attributes.note}`),
            rawReason: `${ban.attributes.reason} ${ban.attributes.note}`,

            banList: banList
          });
        }

        this.storeBanFunc(bans);

        // If that is the last page then break out the loop.
        if (!data.links.next) break;

        // Store the parameters for the next page fetch.
        params = querystring.parse(data.links.next.split('?')[1], null, null, {
          decodeURIComponent: true
        });
      } catch (err) {
        Logger.verbose('BanFetcher', 1, `Failed to fetch ban list (ID: ${banList.id}): `, err);
      }
    }
  }

  async fetchCustomBanList(banList) {
     // Fetch ban data.
     Logger.verbose(
      'BanFetcher',
      1,
      `Fetching custom ban list data for ban list (ID: ${banList.id})...`
    );

    try {
      const { data } = await axios.get(banList.source);
      
      if (!Array.isArray(data)) {
        throw new Error('Custom ban list is not an array');
      }

      const bans = [];

      for (const ban of data) {

        // Skip the object if it's missing a steamID or reason.
        if (ban.steamID === undefined || !ban.steamID.match(/[0-9]{17}/) || !ban.reason) continue; 

        // Turn the dates into date objects or null if permanent ban.
        const created = ban.created ? new Date(ban.created) : null;
        const expires = ban.expires ? new Date(ban.expires) : null;

        // Store the new ban.
        bans.push({
          id: `${banList.id},${ban.steamID},${expires ? expires.getTime() : 'null'}`,

          steamUser: ban.steamID,

          created: created,
          expires: expires,
          expired: !(expires === null || expires.getTime() > Date.now()),

          reason: classifyBanReason(ban.reason),
          rawReason: ban.reason,

          banList: banList
        });
      }

      this.storeBanFunc(bans);
    } catch (err) {
      Logger.verbose('BanFetcher', 1, `Failed to fetch ban list (ID: ${banList.id}): `, err);
    }
  }
}
