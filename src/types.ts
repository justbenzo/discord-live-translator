import type { ChatInputCommandInteraction } from 'discord.js';

export type CommandHandler = (interaction: ChatInputCommandInteraction) => void | Promise<void>;
