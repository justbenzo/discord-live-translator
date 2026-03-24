import { SlashCommandBuilder } from '@discordjs/builders';
import { type APIApplicationCommandOptionChoice } from 'discord.js';

import languages from '../languages';
import type { CommandHandler } from '../types';
import settingsStorage, { type TranslationMode } from '../utils/settingsStorage';

const languageChoices: APIApplicationCommandOptionChoice<string>[] = Object.entries(languages).map(([key, value]) => ({
  name: value.displayName,
  value: key
}));

const modeChoices: { name: string; value: TranslationMode }[] = [
  { name: 'Voice (speak translation)', value: 'voice' },
  { name: 'Captions (DM translated text)', value: 'captions' },
  { name: 'Both (voice + DM captions)', value: 'both' }
];

export const startCommand = new SlashCommandBuilder()
  .setName('start')
  .setDescription('Start the translation')
  .addStringOption((option) =>
    option
      .setName('target')
      .setDescription('Target Language')
      .addChoices(...languageChoices)
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('mode')
      .setDescription('How to receive translations (default: Voice)')
      .addChoices(...modeChoices)
      .setRequired(false)
  );

export const startCommandHandler: CommandHandler = async (interaction) => {
  await interaction.deferReply({ ephemeral: true });

  if (!interaction.member || !interaction.guild) {
    await interaction.editReply('An error occurred! :grimacing:');
    return;
  }

  const targetLanguageRaw = interaction.options.get('target')?.value?.toString();

  if (!targetLanguageRaw || !(targetLanguageRaw in languages)) {
    await interaction.editReply(
      `"${targetLanguageRaw}" is not a supported language! Use "/languages" for a list of supported ones. :x:`
    );
    return;
  }
  const targetLanguage = targetLanguageRaw as keyof typeof languages;
  const mode = (interaction.options.get('mode')?.value?.toString() || 'voice') as TranslationMode;

  await settingsStorage.set(interaction.guild.id, interaction.user.id, targetLanguage, mode);

  const modeLabel = mode === 'voice' ? 'Voice' : mode === 'captions' ? 'Captions (DM)' : 'Both (Voice + DM)';
  await interaction.editReply(`Live translation activated! Mode: **${modeLabel}** :thumbsup:`);
};
