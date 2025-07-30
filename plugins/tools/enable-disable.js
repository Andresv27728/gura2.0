const { restoreMongo } = require('../../lib/src/cloud/mongo-db.js');
const { restoreGithub } = require('../../lib/src/cloud/github-db.js');
exports.default = {
  names: ['Tools'],
  tags: ['on', 'off'],
  command: ['on', 'off', 'enable', 'disable'],
  start: async (m, {
    conn, text, prefix, command,
    Format, isOwner, isAdmins, isPremium, groupName,
  }) => {
    const cmd_on = ['on','enable'], cmd_off = ['off','disable'];
    const owner_admin = isOwner || isAdmins;
    const v = `${prefix}${command} `;
    let caption = `❀ *Gawr Gura Tools* _modo **${command}**_\n\n🌟 *Opciones disponibles:* 🌊\n\n`;
    const opts = [
      'welcome','antilink','viewonce','autodl','autobackup mongo',
      'autobackup github','antitoxic','antiphoto','antibot','anticall',
      'autoreadsw','autobio','autosticker','antispam','antitagsw','chat_ai','hd','sholat','blockpc'
    ];
    opts.forEach(o => caption += `• \`${v + o}\`\n`);
    caption += `\n❗*Ejemplo:* \`${v}welcome on\`\n`;

    if (!text) return m.reply(caption);

    const [opt, sub] = text.toLowerCase().split(' ');
    const active = cmd_on.includes(command);
    const dbchat = db.chats[m.chat] || {};
    const dbuser = db.users[m.sender] || {};
    const dbset = db.settings || {};

    const guraReply = msg => m.reply(`🦈 ${msg}`);
    const onOff = state => state ? 'activado' : 'desactivado';

    // Manejadores genéricos
    const grp = (key, desc) => {
      if (!m.isGroup) return guraReply('solo en grupos~');
      if (!owner_admin) return m.reply('❌ solo admins 😢');
      dbchat[key] = active;
      return guraReply(`${desc} ${onOff(active)} en *${groupName}*`);
    };
    const own = (key, desc) => {
      if (!isOwner) return m.reply('🔒 solo owner puede controlar eso');
      dbset[key] = active;
      return guraReply(`${desc} ${onOff(active)}`);
    };
    const glo = async (flag, onMsg, offMsg) => {
      if (!isOwner) return m.reply('🔒 sólo owner puede cambiar eso~');
      await save.global(`global.${flag} = ${!active}`, `global.${flag} = ${active}`);
      return guraReply(active ? onMsg : offMsg);
    };

    switch (opt) {
      case 'welcome': return grp('welcome','🎉 Bienvenida');
      case 'antilink': return grp('antilink','🔗 Antilink');
      case 'viewonce':
      case 'once': return grp('viewOnce','📷 ViewOnce');
      case 'antitoxic':
      case 'toxic': return grp('antiToxic','🧼 AntiToxic');
      case 'antiphoto': return grp('antiPhoto','📵 AntiPhoto');
      case 'antibot': return grp('antiBot','🤖 AntiBot');
      case 'antitagsw': return grp('tagsw','❗ Anti Tag SW');
      case 'chat_ai':
      case 'ai':
        if (!m.isGroup && !isPremium) return m.reply('💳 premium only');
        if (m.isGroup && !owner_admin) return m.reply('❌ admins only');
        if (m.isGroup) dbchat.chat_ai = active;
        else dbuser.chat_ai = active;
        return guraReply(`🤖 ChatAI ${onOff(active)} ${m.isGroup ? 'en grupo' : ''}`);
      case 'hd':
      case 'remini': return grp('hd','🔍 HD / Remini');
      case 'anticall': return glo('anticall','📵 AntiCall activado','📞 AntiCall desactivado');
      case 'blockpc':
      case 'autoblockpc': {
        if (!isOwner) return m.reply('🔒 solo owner~');
        if (active) {
          if (global.group_mode) return m.reply('❌ modo grupo ON, apágalo primero con .setgcmode off');
          dbset.block_pc = true;
          return guraReply('🔒 Auto‑bloqueo PC activado');
        } else {
          dbset.block_pc = false;
          return guraReply('🔓 Auto‑bloqueo PC desactivado');
        }
      }
      case 'autoreadsw':
      case 'readsw': return own('readsw','👁️ AutoReadSW');
      case 'autobio':
      case 'bio': {
        if (!isOwner) return m.reply('🔒 solo owner~');
        dbset.autobio = active;
        if (!active) {
          await Format.sleep(3000);
          await conn.updateProfileStatus(' ‎');
        }
        return guraReply(`📜 Autobio ${onOff(active)}`);
      }
      case 'autodl':
      case 'autodown': return own('auto_down','⬇️ Auto‑Descarga');
      case 'autosticker':
      case 'sticker':
      case 'stiker': return own('auto_sticker','🌟 Auto‑Sticker');
      case 'antispam':
      case 'spam': return own('antispam','🚫 Anti‑Spam');
      case 'sholat':
      case 'autosholat': return glo('auto_sholat','🕌 AutoSholat activado','🕌 AutoSholat desactivado');
      case 'autobackup':
      case 'backup': {
        if (!isOwner) return m.reply('🔒 solo owner~');
        if (!['mongo','github'].includes(sub)) return guraReply('solo “mongo” o “github” están disponibles');
        // Mongo:
        if (sub === 'mongo') {
          if (active) {
            if (backup_mongo) return guraReply('ya está activado mongoo~');
            m.reply('☁️ Activando Mongo backup...');
            const res = await restoreMongo();
            if (!res) return guraReply('❌ Error backup mongo');
            await save.global('global.backup_mongo = false','global.backup_mongo = true');
            m.reply('✅ Backup mongo activado 👌\nreiniciando...');
            return reset();
          } else {
            if (!backup_mongo) return guraReply('mongo ya estaba desactivado');
            await save.global('global.backup_mongo = true','global.backup_mongo = false');
            m.reply('🛑 Backup mongo desactivado');
            return reset();
          }
        }
        // GitHub:
        if (sub === 'github') {
          if (active) {
            if (backup_github) return guraReply('ya está activado githubo~');
            m.reply('☁️ Activando GitHub backup...');
            const d = await restoreGithub();
            if (!d.status) return guraReply('❌ Error backup github');
            await save.global('global.backup_github = false','global.backup_github = true');
            m.reply('✅ Backup GitHub activado 👌\nreiniciando...');
            return reset();
          } else {
            if (!backup_github) return guraReply('github ya estaba desactivado');
            await save.global('global.backup_github = true','global.backup_github = false');
            return guraReply('🛑 Backup GitHub desactivado');
          }
        }
      }
      default:
        return guraReply('opción no reconocida 🦈');
    }
  }
};
