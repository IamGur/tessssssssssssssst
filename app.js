const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');
const prefix = '!';
const logchannel = '475564126140104704';
const botlog = '475564552159756308';
const error = '475574421441216522';
const re = '476368008730902548';
const Dav =  "324432889561219072";
const Status = `${prefix}help `;
const queue = new Map();
const YouTube = require("simple-youtube-api");

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
    client.channels.get(logchannel).send(`**Bot Logged in as ${client.user.tag}\, ${client.guilds.size} Servers \, ${client.users.size} Users Dav-ID:${Dav} !** `);
    client.user.setPresence({ game: { name: `${Status}`, url: 'https://twitch.tv/....', type: 1 } });
});

 client.on('message', async msg => {
  const queue = new Map();
  const YouTube = require("simple-youtube-api");
  const youtube = new YouTube(process.env.APIKEY);
  if (msg.author.id === Dav || msg.member.roles.some(r => ["DJ"].includes(r.name))) {
      if (!msg.content.startsWith(prefix)) return undefined;
      const args = msg.content.split(' ');
      const searchString = args.slice(1).join(' ');
      var url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
      const serverQueue = queue.get(msg.guild.id);
      let command = msg.content.toLowerCase().split(' ')[0];
      command = command.slice(prefix.length)
      if (command === 'play') {
          const voiceChannel = msg.member.voiceChannel;
          if (!voiceChannel) return msg.channel.send('I\'m sorry but you need to be in a voice channel to play music!');
          if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
              const playlist = await youtube.getPlaylist(url);
              const videos = await playlist.getVideos();
              for (const video of Object.values(videos)) {
                  const video2 = await youtube.getVideoByID(video.id);
                  await handleVideo(video2, msg, voiceChannel, true);
              }
              return msg.channel.send(`✅ Playlist: **${playlist.title}** has been added to the queue!`);
          } else {
              try {
                  var video = await youtube.getVideo(url);
              } catch (error) {
                  try {
                      var videos = await youtube.searchVideos(searchString, 10);
                      let index = 0;
                      msg.channel.send(`
__**Song selection:**__
${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}
Please provide a value to select one of the 🔎 results ranging from 1-10.
        `);
                      try {
                          var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
                              maxMatches: 1,
                              time: 10000,
                              errors: ['time']
                          });
                      } catch (err) {
                          console.error(err);
                          return msg.channel.send('No or invalid value entered, cancelling video selection.');
                      }
                      const videoIndex = parseInt(response.first().content);
                      var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
                  } catch (err) {
                      console.error(err);
                      return msg.channel.send('🆘 I could not obtain any search results.');
                  }
              }
              return handleVideo(video, msg, voiceChannel);
          }
      }
      if (command === 'fav') {
          var url = favsong[args[1]] ? favsong[args[1]].replace(/<(.+)>/g, '$1') : '';
          console.log(favsong[args[1]]);
          console.log(" ")
          const voiceChannel = msg.member.voiceChannel;
          if (!voiceChannel) return msg.channel.send('I\'m sorry but you need to be in a voice channel to play music!');
          if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
              const playlist = await youtube.getPlaylist(url);
              const videos = await playlist.getVideos();
              for (const video of Object.values(videos)) {
                  const video2 = await youtube.getVideoByID(video.id);
                  await handleVideo(video2, msg, voiceChannel, true);
              }
              return msg.channel.send(`✅ Playlist: **${playlist.title}** has been added to the queue!`);
          } else {
              try {
                  var video = await youtube.getVideo(url);
              } catch (error) {
                  try {
                      msg.channel.send(`__**Song selection:**__\nPlease Choose a song on this list from 1-` + favsong.length + "\nSongs");
                      var songarnum = 1;
                      while (songarnum < favsong.length) {
                          msg.channel.send(songarnum + ". " + favsong[songarnum])
                          songarnum++
                      }
                  } catch (err) {
                      console.error(err);
                      return msg.channel.send('🆘 I could not obtain any search results.');
                  }
              }
              return handleVideo(video, msg, voiceChannel);
          }
      } else if (command === 'skip') {
          if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');
          if (!serverQueue) return msg.channel.send('There is nothing playing that I could skip for you.');
          serverQueue.connection.dispatcher.end('Skip command has been used!');
          return undefined;
      } else if (command === 'stop') {
          if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');
          if (!serverQueue) return msg.channel.send('There is nothing playing that I could stop for you.');
          serverQueue.songs = [];
          serverQueue.connection.dispatcher.end('Stop command has been used!');
          return undefined;
      } else if (command === 'volume' || command === 'vol') {
          if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');
          if (!serverQueue) return msg.channel.send('There is nothing playing.');
          if (!args[1]) return msg.channel.send(`The current volume is: **${serverQueue.volume}**`);
          serverQueue.volume = args[1];
          serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
          var volval;
          if (serverQueue.volume == 1) {
              volval = `○──── :loud_sound:⠀`
          }
          if (serverQueue.volume == 2) {
              volval = `─○─── :loud_sound:⠀`
          }
          if (serverQueue.volume == 3) {
              volval = `──○── :loud_sound:⠀`
          }
          if (serverQueue.volume == 4) {
              volval = `───○─ :loud_sound:⠀`
          }
          if (serverQueue.volume == 5) {
              volval = `────○ :loud_sound:⠀`
          }
          msg.channel.send(volval)
       } else if (command === 'np') {
          if (!serverQueue) return msg.channel.send('There is nothing playing.');
          return msg.channel.send(`🎶 Now playing: **${serverQueue.songs[0].title}**`);
      } else if (command === 'queue') {
          if (!serverQueue) return msg.channel.send('There is nothing playing.');
          return msg.channel.send(`
__**Song queue:**__
${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}
**Now playing:** ${serverQueue.songs[0].title}
  `);
      } else if (command === 'pause') {
          if (serverQueue && serverQueue.playing) {
              serverQueue.playing = false;
              serverQueue.connection.dispatcher.pause();
              return msg.channel.send('⏸ Paused the music for you!');
          }
          return msg.channel.send('There is nothing playing.');
      } else if (command === 'resume') {
          if (serverQueue && !serverQueue.playing) {
              serverQueue.playing = true;
              serverQueue.connection.dispatcher.resume();
              return msg.channel.send('▶ Resumed the music for you!');
          }
          return msg.channel.send('There is nothing playing.');
      }
      return undefined;
  }
});
async function handleVideo(video, msg, voiceChannel, playlist = false) {
  const serverQueue = queue.get(msg.guild.id);
  //console.log(.red("MOOOOSIK"));
  const song = {
      id: video.id,
      title: /*Util.escapeMarkdown*/(video.title),
      url: `https://www.youtube.com/watch?v=${video.id}`
  };
  if (!serverQueue) {
      const queueConstruct = {
          textChannel: msg.channel,
          voiceChannel: voiceChannel,
          connection: null,
          songs: [],
          volume: 5,
          playing: true
      };
      queue.set(msg.guild.id, queueConstruct);
      queueConstruct.songs.push(song);
      try {
          var connection = await voiceChannel.join();
          queueConstruct.connection = connection;
          play(msg.guild, queueConstruct.songs[0]);
      } catch (error) {
          console.error(`I could not join the voice channel: ${error}`);
          queue.delete(msg.guild.id);
          return msg.channel.send(`I could not join the voice channel: ${error}`);
      }
  } else {
      serverQueue.songs.push(song);
      console.log(serverQueue.songs);
      if (playlist) return undefined;
      else return msg.channel.send(`✅ **${song.title}** has been added to the queue!`);
  }
  return undefined;
}
 function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
  }
  console.log(serverQueue.songs);
  const dispatcher = serverQueue.connection.playStream(ytdl(song.url)).on('end', reason => {
      if (reason === 'Stream is not generating quickly enough.') console.log(reason);
      else console.log(reason);
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
  }).on('error', error => console.error(error));
  var volval;
  if (serverQueue.volume == 1) {
      volval = `○──── :loud_sound:⠀`
  }
  if (serverQueue.volume == 2) {
      volval = `─○─── :loud_sound:⠀`
  }
  if (serverQueue.volume == 3) {
      volval = `──○── :loud_sound:⠀`
  }
  if (serverQueue.volume == 4) {
      volval = `───○─ :loud_sound:⠀`
  }
  if (serverQueue.volume == 5) {
      volval = `────○ :loud_sound:⠀`
  }
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
 var NowEmbed = new Discord.RichEmbed().setColor("990033")
 .addField(`=========================================================`,`
ɴᴏᴡ ᴘʟᴀʏɪɴɢ: **${song.title}**
:white_circle:─────────────────────────────────────────── 
◄◄⠀▐▐ ⠀►►⠀⠀　　${volval}    　　 :gear: ❐ ⊏⊐ 
========================================================= `)
  serverQueue.textChannel.send(NowEmbed);
 };
client.login(process.env.BOTTOKEN);
