exports.default = {
   names: ['Info'],
   tags: ['script'],
   command: ['script', 'sc', 'repo', 'repositori'],
   start: (m, {
      conn
   }) => {
      const script = 'gura 2.0\n\nprivada'
      conn.adReply(m.chat, script, cover, m)
   }
};
