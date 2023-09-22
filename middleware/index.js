const admin = require('../config/firebase-config');
class Middleware {
	async decodeToken(req, res, next) {
		const allowedEmails = ['dayasudhankg@gmail.com', 'kuruvatechnologies@gmail.com'];
		const token = req.headers.authorization.split(' ')[1];
		try {
			const decodeValue = await admin.auth().verifyIdToken(token);
			if (decodeValue) {
                // console.log("decodeValue",decodeValue);
								// console.log("email1",decodeValue.email);
								if (!allowedEmails.includes(decodeValue.email)) {
									console.log("1")
									//	const reslt = await admin.auth().deleteUser(user.uid);
									console.log("email2",decodeValue.email)									;
								//	console.log("reslt2",reslt)
								// throw "error";
								const statusCode = 401;
									return res.status(statusCode).json(
										{ 'message': 'Unauthorized'}
									);
								}
								else{
									console.log("else")
									return next();
								}
				
			}
			return res.json({ message: 'Unauthorized' });
		} catch (e) {
			return res.json({ message: 'Internal Error' });
		}
	}
}
module.exports = new Middleware();