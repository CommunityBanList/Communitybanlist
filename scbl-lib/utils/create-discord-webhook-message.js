import DiscordWebhookNode from 'discord-webhook-node';

const { Webhook, MessageBuilder } = DiscordWebhookNode;

export default function (url, options = {}) {
  return [
    new Webhook(url, { retryOnLimit: false })
      .setUsername('Community Ban List')
      .setAvatar(
        'https://raw.githubusercontent.com/CommunityBanList/Communitybanlist/v3/client/src/assets/img/brand/cbl-logo-square.png'
      ),
    new MessageBuilder()
      .setColor(options.color || '#ffc40b')
      .setFooter('Powered by the Community Ban List.')
      .setTimestamp()
  ];
}
