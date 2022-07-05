import { Ban, BanList, SteamUser } from 'scbl-lib/db/models';
import { Op } from 'scbl-lib/db/sequelize';
import { classifyBanReason, Logger } from 'scbl-lib/utils';
import { connect, disconnect } from 'scbl-lib/db';
async function main(){
    await connect();
    const bans = await Ban.findAll(
        {where: {reason: 'unknown'}}
    )
    console.log(`${bans.length} Unknown Bans To Classify`)
    for(const ban of bans){
        const old = ban.reason;
        ban.reason = classifyBanReason(ban.rawReason);
        if(old !== ban.reason){
            console.log(old, ban.reason)
            console.log(`Updating Ban: ${ban.reason}`)
            await ban.save();
        }
    }
    
}

main();