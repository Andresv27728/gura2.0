const { restoreMongo } = require('../../lib/src/cloud/mongo-db.js');
const { restoreGithub } = require('../../lib/src/cloud/github-db.js');

exports.default = {
   names: ['Tools'],
   tags: ['on', 'off'],
   command: ['on', 'off', 'enable', 'disable'],
   start: async (m, {
      conn,
      text,
      prefix,
      command,
      Format,
      isOwner,
      isAdmins,
      isPremium,
      groupName,
   }) => {
      const cmd_on = ['on', 'enable'];
      const cmd_off = ['off', 'disable'];
      const owner_admin = isOwner || isAdmins;
      const v = `${prefix + command} `;
      let caption = `🎛️ *Lista de opciones para* \`${command}\`\n\n📌 *Ejemplos:*\n\n`;
      caption += `${v}welcome\n`;
      caption += `${v}antilink\n`;
      caption += `${v}viewonce / once\n`;
      caption += `${v}autodl / autodown\n`;
      caption += `${v}autobackup mongo\n`;
      caption += `${v}autobackup github\n`;
      caption += `${v}antitoxic / toxic\n`;
      caption += `${v}antiphoto\n`;
      caption += `${v}antibot\n`;
      caption += `${v}anticall\n`;
      caption += `${v}autoreadsw / readsw\n`;
      caption += `${v}autobio / bio\n`;
      caption += `${v}autosticker / sticker\n`;
      caption += `${v}antispam / spam\n`;
      caption += `${v}antitagsw\n`;
      caption += `${v}chat_ai / ai\n`;
      caption += `${v}hd / remini\n`;
      caption += `${v}sholat / autosholat\n`;
      caption += `${v}blockpc / autoblockpc\n`;

      if (!text) return m.reply(caption);

      const opt = text.toLowerCase().split(" ")[0];
      const dbchat = db.chats[m.chat] || {};
      const dbuser = db.users[m.sender] || {};
      const dbset = db.settings || {};
      
      const handleGroupOption = (key, msg) => {
         if (!m.isGroup) return m.reply(mess.OnlyGroup);
         if (!owner_admin) return m.reply(mess.GrupAdmin);
         dbchat[key] = cmd_on.includes(command);
         m.reply(`${msg} ${cmd_on.includes(command) ? 'activado' : 'desactivado'} en el grupo ${groupName}`);
      };

      const handleOwnerOption = (key, msg) => {
         if (!isOwner) return m.reply(mess.OnlyOwner);
         dbset[key] = cmd_on.includes(command);
         m.reply(`${msg} ${cmd_on.includes(command) ? 'activado' : 'desactivado'}`);
      };

      const handleGlobalToggle = async (flag, msgOn, msgOff) => {
         if (!isOwner) return m.reply(mess.OnlyOwner);
         const from = `global.${flag} = ${!cmd_on.includes(command)}`;
         const to = `global.${flag} = ${cmd_on.includes(command)}`;
         await save.global(from, to);
         m.reply(cmd_on.includes(command) ? msgOn : msgOff);
      };

      switch (opt) {
         case 'welcome': return handleGroupOption('welcome', '🟢 Sistema de bienvenida');
         case 'antilink': return handleGroupOption('antilink', '🔗 Antilink');
         case 'viewonce':
         case 'once': return handleGroupOption('viewOnce', '📷 ViewOnce');
         case 'antitoxic':
         case 'toxic': return handleGroupOption('antiToxic', '🧼 Anti Toxic');
         case 'antiphoto': return handleGroupOption('antiPhoto', '📵 Anti Foto de Perfil');
         case 'antibot': return handleGroupOption('antiBot', '🤖 Anti Bot');
         case 'antitagsw': return handleGroupOption('tagsw', '❗ Anti Etiqueta de SW');
         case 'hd':
         case 'remini': {
            if (!m.isGroup) return m.reply(mess.OnlyGroup);
            if (!isOwner) return m.reply(mess.OnlyOwner);
            dbchat.hd = cmd_on.includes(command);
            return m.reply(`🔍 HD Remini ${cmd_on.includes(command) ? 'activado' : 'desactivado'} en ${groupName}`);
         }
         case 'anticall': return handleGlobalToggle('anticall', '📵 Anti Llamadas activado', '📞 Anti Llamadas desactivado');
         case 'blockpc':
         case 'autoblockpc': {
            if (!isOwner) return m.reply(mess.OnlyOwner);
            if (cmd_on.includes(command)) {
               if (global.group_mode) return m.reply('❌ El modo grupo está activo. Usa .setgcmode off primero.');
               dbset.block_pc = true;
               return m.reply('🔒 Auto bloqueador de privados activado');
            } else {
               dbset.block_pc = false;
               return m.reply('🔓 Auto bloqueador de privados desactivado');
            }
         }
         case 'sholat':
         case 'autosholat': return handleGlobalToggle('auto_sholat', '🕌 Auto Sholat activado', '🕌 Auto Sholat desactivado');
         case 'autodl':
         case 'autodown': return handleOwnerOption('auto_down', '⬇️ AutoDescarga');
         case 'autosticker':
         case 'sticker':
         case 'stiker': return handleOwnerOption('auto_sticker', '🌟 AutoSticker');
         case 'autoreadsw':
         case 'readsw': return handleOwnerOption('readsw', '👁️ Auto Read Status');
         case 'autobio':
         case 'bio': {
            if (!isOwner) return m.reply(mess.OnlyOwner);
            dbset.autobio = cmd_on.includes(command);
            if (cmd_off.includes(command)) {
               await Format.sleep(3000);
               await conn.updateProfileStatus(' ‎'); // invisible char
            }
            return m.reply(`📜 Auto Bio ${cmd_on.includes(command) ? 'activado' : 'desactivado'}`);
         }
         case 'antispam':
         case 'spam': return handleOwnerOption('antispam', '🚫 Anti Spam');
         case 'chat_ai':
         case 'ai': {
            if (!m.isGroup && !isPremium) return m.reply(mess.premium);
            if (m.isGroup && !owner_admin) return m.reply(mess.GrupAdmin);
            if (!m.isGroup) dbuser.chat_ai = cmd_on.includes(command);
            else dbchat.chat_ai = cmd_on.includes(command);
            return m.reply(`🤖 Chat AI ${cmd_on.includes(command) ? 'activado' : 'desactivado'} ${m.isGroup ? 'en grupo' : ''}`);
         }
         case 'autobackup':
         case 'backup': {
            if (!isOwner) return m.reply(mess.OnlyOwner);
            const pick = text.split(" ")[1]?.toLowerCase();
            if (!pick) return m.reply(`🗂️ Especifica el tipo de backup: ${prefix + command} autobackup mongo/github`);
            if (!['mongo', 'github'].includes(pick)) return m.reply('❌ Solo está disponible: mongo y github');

            if (pick === 'mongo') {
               if (cmd_on.includes(command)) {
                  if (backup_mongo) return m.reply('Ya está activado. Usa .status para verificar');
                  m.reply('☁️ Activando backup automático a Mongo...');
                  const response = await restoreMongo();
                  if (!response) return m.reply('❌ Falló el intento');
                  await save.global('global.backup_mongo = false', 'global.backup_mongo = true');
                  m.reply('✅ AutoBackup Mongo activado\nReiniciando...');
                  return reset();
               } else {
                  if (!backup_mongo) return m.reply('Ya estaba desactivado');
                  await save.global('global.backup_mongo = true', 'global.backup_mongo = false');
                  m.reply('🛑 AutoBackup Mongo desactivado\nReiniciando...');
                  return reset();
               }
            }

            if (pick === 'github') {
               if (cmd_on.includes(command)) {
                  if (backup_github) return m.reply('Ya está activado. Usa .status para verificar');
                  m.reply('☁️ Activando backup automático a GitHub...');
                  const data = await restoreGithub();
                  if (!data.status) return m.reply('❌ Falló el backup GitHub');
                  await save.global('global.backup_github = false', 'global.backup_github = true');
                  return m.reply('✅ Backup GitHub activado\nReiniciando...'), reset();
               } else {
                  if (!backup_github) return m.reply('Ya estaba desactivado');
                  await save.global('global.backup_github = true', 'global.backup_github = false');
                  return m.reply('🛑 AutoBackup GitHub desactivado');
               }
            }
         }
      }
   }
};
