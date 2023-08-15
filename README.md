

# ***SHORT STACK*** 
***is a Dota 2 party composition bot to get your gang in the game quicker.***

What does she do? Everything. If you hate reading just [invite her over](https://discord.com/api/oauth2/authorize?client_id=1109079876713066518&permissions=328565008448&scope=bot), or see the handy gif below.
<img src="shortgif.gif?raw=true" alt="ShortStack in action!" width="800px">

[Skip to setup](#how-to-setup-on-your-discord-server)

In short she allows you to create an LFG-like message in your server to announce that you wanna get a 5-stack going, collect whatever goons show up to your Dota call, and uses The Only Fair Principle In The Universe - randomness - to set roles. No more 

> ”Wait I thought you were support?” ”Why do I never get to play mid?”
> ”Why did you start a Dota stack without me, I informed you I was
> interested by way of [esoteric communication interface here]”

These quotes are of course real, and we have all of course heard them, and they are the reason this bot was created. This bot is the result of 2 years of wild coding and rigorous product testing, ShoSta has been ran over 10 000 times in my server. She has gone over multiple iterations, each removing some small annoyance of the social aspect of getting your gang into a game. I will bore you with the details.



## /lfs

(read as ”Looking for stack”): In my server this command is called ”yapos”, after our most big-handed friend somehow misspelled the word ”Dota?” Into ”yapos_”. The mystery remains to this day. With this command you sort of open shop to let the world know you’re ready to get pubstomped by a rank 86 immortal Meepo smurf and their low Archon Rubick friend. If you’re already a bunch of bozos willing to play, you can optionally add said bozos and they will show up, it works like it should it’s been tested 10 000 times. 

Once the stack reaches 5 it goes into a ready-checker mode, which has all the features you need like a ”Ping” button that makes sure whoever is slacking gets a million red ones on their Discord. When all players are ready you’re ready to stack!
Stacking is the most fun part because now every player is randomly given their turn to select their role. Of course you can be boring and select the role you want, or even more boring if you play it safe and pick ”fill” (used by experts to postpone their turn in order for a better chance with their preferred laning partner), or be a real hero and pick the interrobang (⁉️) random option! You can get any role when you random! You can even get fill! And if you get fill you can of course random again! That’s right this bad girl does gacha. It’s been tested over 10 000 times. 

”Well what about my friend that randomly leaves their computer?” I just told you it’s been tested over 10 000 times! When it’s your turn to pick you have 60 seconds, otherwise you get assigned ”fill” and lose your priority. Well, that is, unless you set your preferences of course.

## /preference

The command /preference lets the bot know in what order you prefer the roles and how you like your eggs. If you’ve set them, you won’t be forced to fill - instead the bot will assign you whatever role you usually prefer. You can be so goddamn lazy. Over 10 000 times et cetera. 

## /stack

Let’s talk about the /stack command. The /stack function gets triggered automatically when the ready checker part of the bot finishes, but if you’re already 5 playing you can just short-cut to the goodies and do /stack. This would be a meagre paragraph if that’s all it did, but fortunately over 10 000 uses there’s more. Once the /stack portion, wether by /lfs or by /stack finishes you’re given a copy code at the top of the embed. Copy the code and paste it into your chat. Bam, the same party composition populates the command and you’re ready to random your roles again. It’s so fast. 

”Well I usually just ping the @dota role and wish for the best :)” ok listen Short Stack has been used over 10 000 times, of course she can ping your Dota roles. The only thing she can’t do is toast bread. Use /settings role and you can set whatever role you associate with congregating the conscripts and she will ping for you. Additionally you can use /settings stackschannel to specify what channel she will post her stacks in, no matter where you type the command.

During the stacking, **anyone can press a button and thus select a role for the current player**. This is not a bug and something that has been discussed a lot on our Discord server. The use case this addresses is that people are in the voice channel but maybe not at the computer. Or, even more likely, they are at the computer but alt tabbed into a super important fight scene in another single player game. Then the busy player can ask "Can someone pick mid (2) for me?" and another player can do just so.

## Queue system
A system where people can queue up (using /queue join) to play after the existing stack has finished their game and one player in the stack wants to stop playing. The queue can then be invoked by the current stack by using /queue invoke, and specifying how many slots are open.
Preview:

![image](https://github.com/snygghugo/ShortStack/assets/4653578/2a8fcdd3-9218-459c-a248-2dcd20d4c320) ![image](https://github.com/snygghugo/ShortStack/assets/4653578/65251a2f-2b98-4d5b-8f07-ff227bb52c5a)

If a stack "implodes", i.e. the party dies completely, whenever a new /lfs is created, the people in the queue will be pinged. 

That’s about it. Essentially you’ll never have to speak with your friends again until you’re in-game losing FB to an Ursa. 

## How to setup on your Discord server
1. [Click this link to invite her](https://discord.com/api/oauth2/authorize?client_id=1109079876713066518&permissions=328565008448&scope=bot).
2. Select which server 👇
   
   ![image](https://github.com/snygghugo/ShortStack/assets/4653578/407b86ce-d292-49bc-9e56-3b2d8528a809)
3. Grant all the requested permissions for it to work properly.
   
   ![image](https://github.com/snygghugo/ShortStack/assets/4653578/f1bcdd77-2391-4383-a4f2-4ccd23ad20d7)
 
4. (Optional, per player) Every player can select their preferred role with `/preference`. **This only affects when the picking timer of 60s runs out** 👇
   
   ![image](https://github.com/snygghugo/ShortStack/assets/4653578/93eaf768-333a-4e3b-97d2-4df97a83ed4e) 
 
5. (Optional) Select a server role that ShoSta should ping when /lfg is called 👇

   ![image](https://github.com/snygghugo/ShortStack/assets/4653578/0f87ba49-dc07-4b44-9653-29665974772e)

7. (Optional) Select a text channel wherein ShoSta posts all her /lfs and /stack related business 👇
    
   ![image](https://github.com/snygghugo/ShortStack/assets/91157834/68561a10-da5e-4b57-9b48-bac910ec1d38)





## Future improvements

### Sound alert system
Considering adding a function wherein the bot would join a voice channel populated with users in the /lfs when the /lfs reaches 5 players to alert them that a stack can be formed. Ideally this would happen through the Discord Soundboard system (there is a nice default option, but players can also set their own), however the soundbords are not accessible by the bots yet (afaik!).


