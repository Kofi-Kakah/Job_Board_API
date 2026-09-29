import cookieParser from 'cookieparser';

const parseCookies = (req, res, next) => {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
        req.cookies = {};
        return next();
    }

    try {
        req.cookies = cookieParser.parse(cookieHeader);
        return next();
    } catch (error) {
        return res.status(400).json({ message: 'Malformed Cookie header.', error: error.message });
    }
};

export default parseCookies;
