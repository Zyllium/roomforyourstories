import {configuration} from './delivery';
export type DiscordMessage={id:string;author:{id:string};timestamp:string;embeds?:{title?:string;description?:string}[]};
export type Story={id:string;title:string;text:string;created:string};
export function storyFrom(message:DiscordMessage,botId:string):Story|null {
  if(message.author.id!==botId)return null;
  const embed=message.embeds?.find(e=>/^(My Story|Confession|Reply #)/i.test(e.title||'')&&e.description);
  return embed ? {id:message.id,title:embed.title||'My Story',text:embed.description!,created:message.timestamp}:null;
}
export async function discordConnection(){
  const config=await configuration();if(!config)return null;
  const headers={Authorization:`Bot ${config.token}`};
  const response=await fetch('https://discord.com/api/v10/users/@me',{headers,signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new Error('Could not connect to the bot.');
  const bot=await response.json() as {id:string};return {config,headers,botId:bot.id};
}
