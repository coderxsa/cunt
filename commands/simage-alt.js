const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

async function takeCommand(sock, chatId, message, args) {
    try {
        // Check if message is a reply to a sticker
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMessage?.stickerMessage) {
            await sock.sendMessage(chatId, { text: '❌ Reply to a sticker with .take <packname>' });
            return;
        }

        // Get the packname from args or use default
        const packname = args.join(' ') || 'مهبل';
        const author = 'CODERXSA';

        try {
            // Create tmp directory if it doesn't exist
            const tmpDir = path.join(__dirname, '../tmp');
            if (!fs.existsSync(tmpDir)) {
                fs.mkdirSync(tmpDir, { recursive: true });
            }

            // Download the sticker
            const stickerBuffer = await downloadMediaMessage(
                {
                    key: message.message.extendedTextMessage.contextInfo.stanzaId,
                    message: quotedMessage,
                    messageType: quotedMessage.stickerMessage ? 'stickerMessage' : 'imageMessage'
                },
                'buffer',
                {},
                {
                    logger: console,
                    reuploadRequest: sock.updateMediaMessage
                }
            );

            if (!stickerBuffer) {
                await sock.sendMessage(chatId, { text: '❌ Failed to download sticker' });
                return;
            }

            // Create the sticker using wa-sticker-formatter
            const sticker = new Sticker(stickerBuffer, {
                pack: packname,
                author: author,
                type: StickerTypes.FULL,
                categories: ['🤖'],
                quality: 80
            });

            const stickerBufferFormatted = await sticker.toBuffer();

            // Send the sticker
            await sock.sendMessage(chatId, {
                sticker: stickerBufferFormatted
            });

        } catch (error) {
            console.error('Sticker processing error:', error);
            await sock.sendMessage(chatId, { text: '❌ Error processing sticker' });
        }

    } catch (error) {
        console.error('Error in take command:', error);
        await sock.sendMessage(chatId, { text: '❌ Error processing command' });
    }
}

module.exports = takeCommand;
